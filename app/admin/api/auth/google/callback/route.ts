import { NextRequest, NextResponse } from "next/server";

import { updateAdminGoogleTokens } from "@/db/queries";
import { exchangeCodeForTokens } from "@/lib/google-calendar/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL("/admin/dashboard?error=oauth_failed", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/dashboard?error=no_code", request.url)
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, expiryDate } =
      await exchangeCodeForTokens(code);

    // Store tokens in database
    await updateAdminGoogleTokens({
      email: user.email!,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
      googleTokenExpiry: expiryDate,
    });

    return NextResponse.redirect(
      new URL("/admin/dashboard?success=true", request.url)
    );
  } catch (error) {
    console.error("Error handling Google OAuth callback:", error);
    return NextResponse.redirect(
      new URL("/admin/dashboard?error=token_exchange_failed", request.url)
    );
  }
}

