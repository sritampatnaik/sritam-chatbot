import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  createMeeting,
  deleteChatById,
  getChatById,
  getMeetingById,
  saveChat,
} from "@/db/queries";
import {
  checkAvailability,
  createCalendarEvent,
} from "@/lib/google-calendar/calendar";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages, guestId }: { id: string; messages: Array<Message>; guestId: string } =
    await request.json();

  if (!guestId) {
    return new Response("Guest ID required", { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `
        - You are a helpful meeting booking assistant
        - Help users book 30-minute meetings
        - Keep your responses limited to 1-2 sentences
        - Be friendly and conversational
        - Today's date is ${new Date().toLocaleDateString()}
        - Ask for any details you don't know (name, preferred date/time)
        - Meetings are 30 minutes long
        - Available hours: 9:00 AM - 5:00 PM (weekdays)
        - Time zone: America/Los_Angeles
        - Optimal flow:
          1. Greet the user and ask when they'd like to meet
          2. Check availability for their requested date
          3. Suggest available time slots
          4. Get their name
          5. Confirm the meeting details
          6. Create the meeting
        - After creating a meeting, provide confirmation with the date and time
      `,
    messages: coreMessages,
    tools: {
      checkAvailability: {
        description: "Check available meeting slots for a specific date",
        parameters: z.object({
          date: z.string().describe("Date to check availability (YYYY-MM-DD format)"),
        }),
        execute: async ({ date }) => {
          try {
            const requestedDate = new Date(date);
            requestedDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(requestedDate);
            endDate.setHours(23, 59, 59, 999);

            const availableSlots = await checkAvailability(requestedDate, endDate);
            
            return {
              date,
              availableSlots: availableSlots.slice(0, 5), // Return first 5 slots
              totalAvailable: availableSlots.length,
            };
          } catch (error) {
            console.error("Error checking availability:", error);
            return {
              error: "Unable to check availability at this time. Please try again.",
            };
          }
        },
      },
      createMeeting: {
        description: "Create a meeting booking after confirming all details with the user",
        parameters: z.object({
          guestName: z.string().describe("Full name of the guest"),
          guestEmail: z.string().describe("Email address of the guest"),
          startTime: z.string().describe("Meeting start time (ISO 8601 format)"),
          title: z.string().describe("Meeting title/subject"),
        }),
        execute: async ({ guestName, guestEmail, startTime, title }) => {
          try {
            const start = new Date(startTime);
            const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 minutes later

            // Create calendar event
            const googleEventId = await createCalendarEvent({
              title,
              startTime: start,
              endTime: end,
              guestEmail,
              guestName,
              description: `Meeting with ${guestName}`,
            });

            // Create meeting record in database
            const meetingId = generateUUID();
            await createMeeting({
              id: meetingId,
              guestId,
              title,
              startTime: start,
              endTime: end,
              duration: "30 minutes",
              guestName,
              guestEmail,
              googleEventId,
            });

            return {
              success: true,
              meetingId,
              title,
              startTime: start.toISOString(),
              endTime: end.toISOString(),
              guestName,
              duration: "30 minutes",
            };
          } catch (error) {
            console.error("Error creating meeting:", error);
            return {
              error: "Unable to create meeting. Please try again.",
            };
          }
        },
      },
      getMeetingDetails: {
        description: "Get details of a booked meeting",
        parameters: z.object({
          meetingId: z.string().describe("Unique identifier for the meeting"),
        }),
        execute: async ({ meetingId }) => {
          try {
            const meeting = await getMeetingById({ id: meetingId });
            
            if (!meeting) {
              return { error: "Meeting not found" };
            }

            return {
              meetingId: meeting.id,
              title: meeting.title,
              startTime: meeting.startTime.toISOString(),
              endTime: meeting.endTime.toISOString(),
              guestName: meeting.guestName,
              status: meeting.status,
              duration: meeting.duration,
            };
          } catch (error) {
            console.error("Error getting meeting details:", error);
            return {
              error: "Unable to retrieve meeting details.",
            };
          }
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      try {
        await saveChat({
          id,
          messages: [...coreMessages, ...responseMessages],
          guestId,
        });
      } catch (error) {
        console.error("Failed to save chat");
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const guestId = searchParams.get("guestId");

  if (!id || !guestId) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat || chat.guestId !== guestId) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
