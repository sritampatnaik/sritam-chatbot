# Supabase Migration Complete

## What Was Changed

### 1. Dependencies
- **Removed**: `next-auth`, `@vercel/postgres`, `@vercel/blob`, `bcrypt-ts`
- **Added**: `@supabase/supabase-js`, `@supabase/ssr`

### 2. New Files Created
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/middleware.ts` - Authentication middleware

### 3. Files Modified
- `package.json` - Updated dependencies
- `drizzle.config.ts` - Using SUPABASE_DATABASE_URL
- `db/migrate.ts` - Using SUPABASE_DATABASE_URL
- `db/queries.ts` - Updated database connection and createUser function
- `middleware.ts` - Using Supabase auth middleware
- `app/(auth)/actions.ts` - Rewritten to use Supabase Auth
- `app/(chat)/api/chat/route.ts` - Using Supabase auth
- `app/(chat)/api/files/upload/route.ts` - Using Supabase Storage
- `app/(chat)/api/history/route.ts` - Using Supabase auth
- `app/(chat)/api/reservation/route.ts` - Using Supabase auth
- `app/(chat)/chat/[id]/page.tsx` - Using Supabase auth
- `components/custom/navbar.tsx` - Using Supabase auth

### 4. Files Deleted
- `app/(auth)/auth.ts`
- `app/(auth)/auth.config.ts`
- `app/(auth)/api/auth/[...nextauth]/route.ts`

## Required Setup Steps

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables

Update your `.env.local` file with these Supabase variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_DATABASE_URL=postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Remove these old variables:**
```env
# Remove these:
POSTGRES_URL=...
AUTH_SECRET=...
```

### 3. Supabase Dashboard Setup

#### A. Get Your Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Navigate to **Settings** → **Database**
5. Copy the **Connection string** for **Transaction mode** → `SUPABASE_DATABASE_URL`

#### B. Create Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Name it: `attachments`
4. Set **Public bucket**: ✅ (enabled)
5. Click **Create bucket**

#### C. Configure Storage Policies (Optional)
You can add Row Level Security (RLS) policies for the storage bucket:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Allow public read access
CREATE POLICY "Public can read files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');
```

#### D. Database Migration
Your existing database schema will work with Supabase. Run migrations:
```bash
pnpm run build  # This runs migrations automatically
```

Or manually:
```bash
npx tsx db/migrate
```

### 4. User ID Synchronization

**Important**: The app now uses Supabase Auth's user IDs instead of custom ones.

When users register:
1. Supabase creates a user in `auth.users`
2. The app creates a matching record in your custom `User` table with the same UUID
3. All chat and reservation records use this UUID

**For existing users**: You'll need to migrate them or they'll need to re-register.

## Authentication Flow

### Registration
1. User submits email/password
2. Supabase creates auth user
3. App creates corresponding User record with same UUID
4. User is automatically signed in

### Login
1. User submits credentials
2. Supabase validates and creates session
3. Session stored in cookies automatically

### Session Management
- Sessions are managed via httpOnly cookies
- Middleware refreshes sessions automatically
- No manual token management needed

## Storage Implementation

File uploads now use Supabase Storage:
- Files uploaded to `attachments` bucket
- Filenames prefixed with timestamp to avoid collisions
- Public URLs returned for use in chat
- 5MB size limit enforced
- Supports: JPEG, PNG, PDF

## Testing

After setup, test these flows:
1. ✅ User registration
2. ✅ User login
3. ✅ File upload
4. ✅ Chat creation
5. ✅ Reservation creation
6. ✅ User logout

## Troubleshooting

### Auth Issues
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify Supabase project is active
- Check browser cookies are enabled

### Database Connection
- Ensure `SUPABASE_DATABASE_URL` is correct
- Use Transaction mode connection string (port 6543 with pgbouncer)
- Check Supabase project database is not paused

### Storage Issues
- Verify `attachments` bucket exists
- Check bucket is set to public
- Ensure proper CORS settings in Supabase dashboard

## Migration Benefits

✅ Unified platform (auth + database + storage)  
✅ Automatic session management  
✅ Real-time capabilities (available if needed)  
✅ Built-in Row Level Security  
✅ Better scalability  
✅ Integrated dashboard for management  
✅ No separate services to maintain

