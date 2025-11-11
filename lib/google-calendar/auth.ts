import "server-only";

import { google } from "googleapis";

import { getAdmin, updateAdminGoogleTokens } from "@/db/queries";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export function getGoogleAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  return authUrl;
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to get tokens from Google");
    }

    const expiryDate = tokens.expiry_date 
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default to 1 hour

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate,
    };
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

export async function refreshAccessToken(adminEmail: string): Promise<string> {
  const admin = await getAdmin(adminEmail);

  if (!admin || !admin.googleRefreshToken) {
    throw new Error("Admin not found or refresh token missing");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: admin.googleRefreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error("Failed to refresh access token");
    }

    const expiryDate = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    // Update tokens in database
    await updateAdminGoogleTokens({
      email: adminEmail,
      googleAccessToken: credentials.access_token,
      googleRefreshToken: admin.googleRefreshToken,
      googleTokenExpiry: expiryDate,
    });

    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

export async function getValidAccessToken(adminEmail: string): Promise<string> {
  const admin = await getAdmin(adminEmail);

  if (!admin || !admin.googleAccessToken) {
    throw new Error("Admin not found or access token missing");
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date();
  const expiryDate = admin.googleTokenExpiry ? new Date(admin.googleTokenExpiry) : null;

  if (!expiryDate || expiryDate.getTime() - now.getTime() < 5 * 60 * 1000) {
    // Token expired or expiring soon, refresh it
    return await refreshAccessToken(adminEmail);
  }

  return admin.googleAccessToken;
}

