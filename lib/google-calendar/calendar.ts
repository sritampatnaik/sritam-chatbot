import "server-only";

import { google } from "googleapis";

import { getValidAccessToken } from "./auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
}

export interface MeetingDetails {
  title: string;
  startTime: Date;
  endTime: Date;
  guestEmail: string;
  guestName: string;
  description?: string;
}

async function getCalendarClient() {
  const accessToken = await getValidAccessToken(ADMIN_EMAIL);

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function checkAvailability(
  startDate: Date,
  endDate: Date
): Promise<TimeSlot[]> {
  try {
    const calendar = await getCalendarClient();

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busySlots = response.data.calendars?.primary?.busy || [];
    
    // Generate 30-minute slots throughout the day (9 AM - 5 PM)
    const availableSlots: TimeSlot[] = [];
    const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    const start = new Date(startDate);
    start.setHours(9, 0, 0, 0); // Start at 9 AM
    
    const end = new Date(startDate);
    end.setHours(17, 0, 0, 0); // End at 5 PM
    
    let currentSlotStart = start.getTime();
    
    while (currentSlotStart + slotDuration <= end.getTime()) {
      const slotEnd = currentSlotStart + slotDuration;
      
      // Check if this slot conflicts with any busy period
      const isAvailable = !busySlots.some((busy) => {
        const busyStart = new Date(busy.start!).getTime();
        const busyEnd = new Date(busy.end!).getTime();
        
        // Check for overlap
        return (
          (currentSlotStart >= busyStart && currentSlotStart < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentSlotStart <= busyStart && slotEnd >= busyEnd)
        );
      });
      
      if (isAvailable) {
        availableSlots.push({
          start: new Date(currentSlotStart).toISOString(),
          end: new Date(slotEnd).toISOString(),
        });
      }
      
      currentSlotStart += slotDuration;
    }
    
    return availableSlots;
  } catch (error) {
    console.error("Error checking availability:", error);
    throw error;
  }
}

export async function createCalendarEvent(
  meetingDetails: MeetingDetails
): Promise<string> {
  try {
    const calendar = await getCalendarClient();

    const event = {
      summary: meetingDetails.title,
      description: meetingDetails.description || `Meeting with ${meetingDetails.guestName}`,
      start: {
        dateTime: meetingDetails.startTime.toISOString(),
        timeZone: "America/Los_Angeles", // Adjust as needed
      },
      end: {
        dateTime: meetingDetails.endTime.toISOString(),
        timeZone: "America/Los_Angeles", // Adjust as needed
      },
      attendees: [
        { email: meetingDetails.guestEmail, displayName: meetingDetails.guestName },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      sendUpdates: "none", // Don't send email invites automatically
    });

    if (!response.data.id) {
      throw new Error("Failed to create calendar event");
    }

    return response.data.id;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    throw error;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = await getCalendarClient();

    await calendar.events.delete({
      calendarId: "primary",
      eventId: eventId,
      sendUpdates: "none",
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
}

export async function getUpcomingMeetings(maxResults: number = 10) {
  try {
    const calendar = await getCalendarClient();

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error getting upcoming meetings:", error);
    throw error;
  }
}

