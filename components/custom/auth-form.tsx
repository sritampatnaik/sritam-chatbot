"use client";

import { useActionState } from "react";

import { adminLogin } from "@/app/(auth)/actions";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SubmitButton } from "./submit-button";

export function AuthForm({
  action,
  isAdmin = false,
}: {
  action: string;
  isAdmin?: boolean;
}) {
  const [state, formAction] = useActionState(adminLogin, {
    status: "idle",
  });

  return (
    <form action={formAction} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm border-none"
          type="email"
          placeholder="admin@example.com"
          autoComplete="email"
          required
        />

        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm border-none"
          type="password"
          required
        />
      </div>

      {state.status === "failed" && (
        <p className="text-red-500 text-sm">Invalid credentials</p>
      )}

      <SubmitButton isSuccessful={state.status === "success"}>
        {action}
      </SubmitButton>
    </form>
  );
}
