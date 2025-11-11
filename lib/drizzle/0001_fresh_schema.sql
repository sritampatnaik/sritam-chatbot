-- Drop old tables if they exist
DROP TABLE IF EXISTS "Reservation" CASCADE;
DROP TABLE IF EXISTS "Chat" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(64) NOT NULL UNIQUE,
	"password" varchar(64) NOT NULL,
	"googleAccessToken" text,
	"googleRefreshToken" text,
	"googleTokenExpiry" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Create Guest table
CREATE TABLE IF NOT EXISTS "Guest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);

-- Create Meeting table
CREATE TABLE IF NOT EXISTS "Meeting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guestId" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL,
	"duration" varchar(32) NOT NULL,
	"guestName" varchar(128) NOT NULL,
	"guestEmail" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'confirmed' NOT NULL,
	"googleEventId" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Meeting_guestId_Guest_id_fk" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Create Chat table with new schema
CREATE TABLE IF NOT EXISTS "Chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"messages" json NOT NULL,
	"guestId" uuid NOT NULL,
	CONSTRAINT "Chat_guestId_Guest_id_fk" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

