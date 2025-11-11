# Environment Variables Template

Create a `.env.local` file in the root of your project with the following variables:

## Database Configuration

```bash
# Supabase PostgreSQL database URL
# Get this from Supabase Project Settings > Database > Connection String
SUPABASE_DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

## Supabase Configuration

```bash
# Get these from Supabase Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Google Calendar API Configuration

```bash
# Get these from Google Cloud Console
# Steps:
# 1. Go to https://console.cloud.google.com/
# 2. Create a project
# 3. Enable Google Calendar API
# 4. Create OAuth 2.0 credentials (Web application)
# 5. Add redirect URI: http://localhost:3000/admin/api/auth/google/callback

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/admin/api/auth/google/callback
```

## Admin Configuration

```bash
# Your email address for admin access
# Only this email can access /admin routes and link Google Calendar
ADMIN_EMAIL=admin@example.com
```

## Google AI (Gemini) Configuration

```bash
# Get your API key from https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
```

## Complete Example

Here's a complete `.env.local` file template:

```bash
# Database
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Calendar
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123
GOOGLE_REDIRECT_URI=http://localhost:3000/admin/api/auth/google/callback

# Admin
ADMIN_EMAIL=you@example.com

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

## Production Configuration

For production, update the following:

1. **GOOGLE_REDIRECT_URI**: Change to your production domain
   ```bash
   GOOGLE_REDIRECT_URI=https://yourdomain.com/admin/api/auth/google/callback
   ```

2. Add the production redirect URI in Google Cloud Console OAuth settings

3. Ensure all secrets are kept secure and never committed to version control

## Notes

- Never commit `.env.local` to git (it's already in `.gitignore`)
- Keep your API keys and secrets secure
- Use different credentials for development and production
- Rotate your API keys regularly
- The admin email should match the email used to create your admin account in Supabase Auth

