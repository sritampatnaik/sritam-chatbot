import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
} from "drizzle-orm/pg-core";

// Admin table for calendar owner
export const admin = pgTable("Admin", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 64 }).notNull(),
  googleAccessToken: text("googleAccessToken"),
  googleRefreshToken: text("googleRefreshToken"),
  googleTokenExpiry: timestamp("googleTokenExpiry"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Admin = InferSelectModel<typeof admin>;

// Guest table for meeting bookers (no password required)
export const guest = pgTable("Guest", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Guest = InferSelectModel<typeof guest>;

// Meeting table for scheduled meetings
export const meeting = pgTable("Meeting", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  guestId: uuid("guestId")
    .notNull()
    .references(() => guest.id),
  title: varchar("title", { length: 255 }).notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  duration: varchar("duration", { length: 32 }).notNull(), // e.g., "30 minutes"
  guestName: varchar("guestName", { length: 128 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("confirmed"), // confirmed, cancelled
  googleEventId: varchar("googleEventId", { length: 255 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Meeting = InferSelectModel<typeof meeting>;

// Chat table linked to guests
export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  guestId: uuid("guestId")
    .notNull()
    .references(() => guest.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};
