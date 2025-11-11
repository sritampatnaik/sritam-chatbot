# Meeting Scheduler Setup Guide

This guide will help you set up the meeting scheduler chatbot with Google Calendar integration.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Platform account
- pnpm package manager

## Step 1: Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection string from Project Settings > Database
3. Copy `.env.example` to `.env.local` and add your database URL:
   ```
   SUPABASE_DATABASE_URL=your-connection-string
   ```

## Step 2: Supabase Configuration

1. In your Supabase project, go to Project Settings > API
2. Copy the Project URL and anon/public key
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Step 3: Google Calendar API Setup

### Enable the API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Google Calendar API" and enable it

### Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000/admin/api/auth/google/callback`
   - Production: `https://your-domain.com/admin/api/auth/google/callback`
5. Click "Create"
6. Copy the Client ID and Client Secret

### Configure Environment Variables

Add to your `.env.local`:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/admin/api/auth/google/callback
```

## Step 4: Google AI (Gemini) Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
   ```

## Step 5: Admin Configuration

1. Set your admin email in `.env.local`:
   ```
   ADMIN_EMAIL=your-email@example.com
   ```
2. This email will have admin access to the system

## Step 6: Install Dependencies and Run Migrations

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm run build

# This will create all necessary tables
```

## Step 7: Create Admin Account

1. Start the development server:
   ```bash
   pnpm dev
   ```
2. Visit `http://localhost:3000/admin/login`
3. Create your admin account using the email specified in `ADMIN_EMAIL`
4. Sign in with your credentials

## Step 8: Connect Google Calendar

1. After logging in as admin, you'll be redirected to the dashboard
2. Click "Connect Google Calendar"
3. Sign in with your Google account
4. Grant permissions for calendar access
5. You'll be redirected back to the dashboard

## Step 9: Test the System

1. Open a new incognito window
2. Visit `http://localhost:3000`
3. Enter your email address
4. Start chatting to book a meeting
5. The bot will check your Google Calendar for availability

## Configuration Options

### Meeting Duration
- Default: 30 minutes
- Location: `lib/google-calendar/calendar.ts` (line 93)

### Available Hours
- Default: 9:00 AM - 5:00 PM (weekdays)
- Location: `lib/google-calendar/calendar.ts` (line 47-50)

### Time Zone
- Default: America/Los_Angeles
- Location: `lib/google-calendar/calendar.ts` (line 117, 122)

## Troubleshooting

### Calendar Not Connecting
- Verify your Google OAuth credentials are correct
- Check that the redirect URI matches exactly
- Ensure Google Calendar API is enabled

### Database Errors
- Run migrations: `pnpm run build`
- Check your database connection string
- Verify Supabase project is active

### Bot Not Responding
- Verify Gemini API key is valid
- Check browser console for errors
- Ensure guest email is collected before chat starts

## Security Notes

1. Never commit `.env.local` to version control
2. Keep your API keys secure
3. Use different credentials for production
4. Regularly rotate your API keys
5. Review Google Cloud Console permissions regularly

## Production Deployment

When deploying to production:

1. Update `GOOGLE_REDIRECT_URI` to your production URL
2. Add production redirect URI to Google Cloud Console
3. Set all environment variables in your hosting platform
4. Use strong passwords for admin accounts
5. Enable HTTPS (required for Google OAuth)

## Support

For issues or questions:
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [Google Calendar API docs](https://developers.google.com/calendar/api)
- Check [Supabase documentation](https://supabase.com/docs)

