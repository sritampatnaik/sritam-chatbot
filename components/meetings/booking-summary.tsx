"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarIcon, ClockIcon, UserIcon } from "lucide-react";

interface BookingSummaryProps {
  title?: string;
  startTime?: string;
  endTime?: string;
  guestName?: string;
  status?: string;
  duration?: string;
  meetingId?: string;
}

export function BookingSummary({
  title,
  startTime,
  endTime,
  guestName,
  status,
  duration,
  meetingId,
}: BookingSummaryProps) {
  if (!startTime || !title) {
    return (
      <div className="border rounded-lg p-6 space-y-4 bg-muted/50">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date(start.getTime() + 30 * 60 * 1000);

  return (
    <motion.div
      className="border rounded-lg p-6 space-y-4 bg-background"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        {status && (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <CalendarIcon className="size-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="font-medium">{format(start, "EEEE, MMMM d, yyyy")}</div>
            <div className="text-sm text-muted-foreground">
              {format(start, "h:mm a")} - {format(end, "h:mm a")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ClockIcon className="size-5 text-muted-foreground" />
          <div className="text-sm">{duration || "30 minutes"}</div>
        </div>

        {guestName && (
          <div className="flex items-center gap-3">
            <UserIcon className="size-5 text-muted-foreground" />
            <div className="text-sm">{guestName}</div>
          </div>
        )}
      </div>

      {meetingId && (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Meeting ID: {meetingId.slice(0, 8)}
          </p>
        </div>
      )}
    </motion.div>
  );
}

