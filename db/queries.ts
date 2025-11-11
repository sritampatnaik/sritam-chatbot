import "server-only";

import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { admin, guest, chat, meeting, Admin, Guest, Meeting } from "./schema";

let client = postgres(`${process.env.SUPABASE_DATABASE_URL!}`);
let db = drizzle(client);

// Admin queries
export async function getAdmin(email: string): Promise<Admin | undefined> {
  try {
    const [adminUser] = await db.select().from(admin).where(eq(admin.email, email));
    return adminUser;
  } catch (error) {
    console.error("Failed to get admin from database");
    throw error;
  }
}

export async function createAdmin(email: string, password: string) {
  try {
    return await db.insert(admin).values({ email, password });
  } catch (error) {
    console.error("Failed to create admin in database");
    throw error;
  }
}

export async function updateAdminGoogleTokens({
  email,
  googleAccessToken,
  googleRefreshToken,
  googleTokenExpiry,
}: {
  email: string;
  googleAccessToken: string;
  googleRefreshToken: string;
  googleTokenExpiry: Date;
}) {
  try {
    return await db
      .update(admin)
      .set({
        googleAccessToken,
        googleRefreshToken,
        googleTokenExpiry,
      })
      .where(eq(admin.email, email));
  } catch (error) {
    console.error("Failed to update admin Google tokens");
    throw error;
  }
}

// Guest queries
export async function getGuest(email: string): Promise<Array<Guest>> {
  try {
    return await db.select().from(guest).where(eq(guest.email, email));
  } catch (error) {
    console.error("Failed to get guest from database");
    throw error;
  }
}

export async function createGuest(id: string, email: string) {
  try {
    return await db.insert(guest).values({ id, email });
  } catch (error) {
    console.error("Failed to create guest in database");
    throw error;
  }
}

// Chat queries
export async function saveChat({
  id,
  messages,
  guestId,
}: {
  id: string;
  messages: any;
  guestId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      guestId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByGuestId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.guestId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by guest from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

// Meeting queries
export async function createMeeting({
  id,
  guestId,
  title,
  startTime,
  endTime,
  duration,
  guestName,
  guestEmail,
  googleEventId,
}: {
  id: string;
  guestId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  duration: string;
  guestName: string;
  guestEmail: string;
  googleEventId?: string;
}) {
  try {
    return await db.insert(meeting).values({
      id,
      guestId,
      title,
      startTime,
      endTime,
      duration,
      guestName,
      guestEmail,
      status: "confirmed",
      googleEventId,
    });
  } catch (error) {
    console.error("Failed to create meeting in database");
    throw error;
  }
}

export async function getMeetingById({ id }: { id: string }): Promise<Meeting | undefined> {
  try {
    const [selectedMeeting] = await db
      .select()
      .from(meeting)
      .where(eq(meeting.id, id));
    return selectedMeeting;
  } catch (error) {
    console.error("Failed to get meeting by id from database");
    throw error;
  }
}

export async function getMeetingsByGuestId({ guestId }: { guestId: string }): Promise<Meeting[]> {
  try {
    return await db
      .select()
      .from(meeting)
      .where(eq(meeting.guestId, guestId))
      .orderBy(desc(meeting.createdAt));
  } catch (error) {
    console.error("Failed to get meetings by guest from database");
    throw error;
  }
}

export async function updateMeetingStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  try {
    return await db
      .update(meeting)
      .set({ status })
      .where(eq(meeting.id, id));
  } catch (error) {
    console.error("Failed to update meeting status");
    throw error;
  }
}
