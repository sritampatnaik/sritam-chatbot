"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";

interface TimeSlot {
  start: string;
  end: string;
}

interface AvailableSlotsProps {
  date?: string;
  availableSlots?: TimeSlot[];
  totalAvailable?: number;
}

export function AvailableSlots({ date, availableSlots, totalAvailable }: AvailableSlotsProps) {
  if (!date || !availableSlots) {
    return (
      <div className="border rounded-lg p-6 space-y-4 bg-muted/50">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="border rounded-lg p-6 space-y-4 bg-background"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <h3 className="font-semibold text-lg">Available Time Slots</h3>
        <p className="text-sm text-muted-foreground">
          {format(new Date(date), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {availableSlots.length > 0 ? (
        <div className="space-y-2">
          {availableSlots.map((slot, index) => {
            const startTime = new Date(slot.start);
            const endTime = new Date(slot.end);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    30 minutes
                  </div>
                </div>
              </div>
            );
          })}
          
          {totalAvailable && totalAvailable > availableSlots.length && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{totalAvailable - availableSlots.length} more slots available
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No available slots for this date.</p>
          <p className="text-sm mt-2">Please try another date.</p>
        </div>
      )}
    </motion.div>
  );
}

