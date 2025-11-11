import { NextRequest } from "next/server";

import { getChatsByGuestId } from "@/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get("guestId");

  if (!guestId) {
    return Response.json("Guest ID required", { status: 400 });
  }

  const chats = await getChatsByGuestId({ id: guestId });
  return Response.json(chats);
}
