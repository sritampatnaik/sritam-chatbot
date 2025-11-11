"use client";

import { useState, useEffect } from "react";

import { Chat } from "@/components/custom/chat";
import { EmailCollection } from "@/components/custom/email-collection";
import { generateUUID } from "@/lib/utils";

export default function Page() {
  const [guestEmail, setGuestEmail] = useState<string | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatId] = useState(() => generateUUID());

  useEffect(() => {
    // Check localStorage for existing guest info
    const storedEmail = localStorage.getItem("guestEmail");
    const storedId = localStorage.getItem("guestId");

    if (storedEmail && storedId) {
      setGuestEmail(storedEmail);
      setGuestId(storedId);
    }

    setIsLoading(false);
  }, []);

  const handleEmailSubmitted = (email: string, id: string) => {
    setGuestEmail(email);
    setGuestId(id);
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!guestEmail || !guestId) {
    return <EmailCollection onEmailSubmitted={handleEmailSubmitted} />;
  }

  return <Chat key={chatId} id={chatId} initialMessages={[]} />;
}
