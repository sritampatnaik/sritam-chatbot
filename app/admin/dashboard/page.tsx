import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAdmin } from "@/db/queries";
import { getGoogleAuthUrl } from "@/lib/google-calendar/auth";
import { createClient } from "@/lib/supabase/server";

async function disconnectCalendar() {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Update admin to remove Google tokens
  const { updateAdminGoogleTokens } = await import("@/db/queries");
  await updateAdminGoogleTokens({
    email: user.email!,
    googleAccessToken: "",
    googleRefreshToken: "",
    googleTokenExpiry: new Date(0),
  });

  redirect("/admin/dashboard");
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = await getAdmin(user.email!);

  if (!admin) {
    // Not an admin, sign out and redirect
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const isCalendarConnected = !!admin.googleAccessToken && !!admin.googleRefreshToken;
  const googleAuthUrl = getGoogleAuthUrl();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Google Calendar integration for meeting bookings
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Google Calendar</h2>
              <p className="text-sm text-muted-foreground">
                {isCalendarConnected
                  ? "Your calendar is connected"
                  : "Connect your calendar to enable meeting bookings"}
              </p>
            </div>
            <div
              className={`size-3 rounded-full ${
                isCalendarConnected ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          </div>

          {isCalendarConnected && (
            <div className="text-sm text-muted-foreground">
              <p>Connected as: {user.email}</p>
            </div>
          )}

          <div className="flex gap-2">
            {isCalendarConnected ? (
              <form action={disconnectCalendar}>
                <Button type="submit" variant="destructive">
                  Disconnect Calendar
                </Button>
              </form>
            ) : (
              <Button asChild>
                <a href={googleAuthUrl}>Connect Google Calendar</a>
              </Button>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Settings</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Meeting Duration: 30 minutes
            </p>
            <p className="text-sm text-muted-foreground">
              Availability: 9:00 AM - 5:00 PM (Weekdays)
            </p>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/admin/login");
          }}
        >
          <Button type="submit" variant="outline">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}

