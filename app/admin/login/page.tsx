import { redirect } from "next/navigation";

import { AuthForm } from "@/components/custom/auth-form";
import { getAdmin } from "@/db/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Check if user is admin
    const admin = await getAdmin(user.email!);
    if (admin) {
      redirect("/admin/dashboard");
    } else {
      // Not an admin, sign out
      await supabase.auth.signOut();
    }
  }

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Admin Login</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Sign in to manage your calendar integration
          </p>
        </div>
        <AuthForm action="Sign in" isAdmin={true} />
      </div>
    </div>
  );
}

