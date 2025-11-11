import { NextRequest, NextResponse } from "next/server";

import { createGuest, getGuest } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if guest already exists
    const existingGuests = await getGuest(email);
    
    if (existingGuests.length > 0) {
      // Return existing guest
      return NextResponse.json({
        guestId: existingGuests[0].id,
        email: existingGuests[0].email,
      });
    }

    // Create new guest
    const guestId = generateUUID();
    await createGuest(guestId, email);

    return NextResponse.json({
      guestId,
      email,
    });
  } catch (error) {
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 }
    );
  }
}

