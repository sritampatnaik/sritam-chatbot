"use client";

import { useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface EmailCollectionProps {
  onEmailSubmitted: (email: string, guestId: string) => void;
}

export function EmailCollection({ onEmailSubmitted }: EmailCollectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/guest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to create guest");
      }

      const data = await response.json();
      
      // Store in localStorage
      localStorage.setItem("guestEmail", email);
      localStorage.setItem("guestId", data.guestId);
      
      onEmailSubmitted(email, data.guestId);
    } catch (err) {
      setError("Failed to submit email. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-8 flex flex-col p-8 border">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <h3 className="text-2xl font-semibold">Welcome!</h3>
          <p className="text-sm text-muted-foreground">
            Please enter your email to start booking a meeting
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-email">Email Address</Label>
            <Input
              id="guest-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Continue"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          Your email will only be used to send you meeting details
        </p>
      </div>
    </div>
  );
}

