# Supabase Migration Guide

This guide will walk you through migrating your DISC Assessment app from SQLite to Supabase.

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/sdyihdcwdqiamljqielp
2. Navigate to **Settings** → **API**
3. You'll need the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")
   - **service_role key** (under "Project API keys" → "service_role" - keep this secret!)

## Step 2: Create Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace the values with your actual Supabase credentials from Step 1.

## Step 3: Create the Database Table in Supabase

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase-migration.sql` into the editor
5. Click **Run** to execute the SQL

This will create the `results` table with all necessary columns and indexes.

## Step 4: Migrate Existing Data (Optional)

If you have existing data in your SQLite database that you want to migrate:

1. Make sure your `.env.local` file is set up with Supabase credentials
2. Install the migration script dependencies (if needed):
   ```bash
   npm install tsx --save-dev
   ```
3. Run the migration script:
   ```bash
   npx tsx scripts/migrate-to-supabase.ts
   ```

The script will:
- Read all data from your SQLite database (`data/disc-assessment.db`)
- Insert it into your Supabase `results` table
- Show you a summary of the migration

## Step 5: Verify the Migration

1. In your Supabase dashboard, go to **Table Editor**
2. Select the `results` table
3. Verify that your data is present

## Step 6: Test Your Application

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Test creating a new assessment result
3. Test viewing results in the admin dashboard
4. Verify that insights are calculated correctly

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env.local` file exists and contains all three required variables
- Restart your development server after creating/updating `.env.local`

### Migration script fails
- Verify your Supabase credentials are correct
- Make sure the `results` table exists in Supabase (run the SQL migration first)
- Check that your SQLite database file exists at `data/disc-assessment.db`

### Data not appearing in Supabase
- Check the Supabase dashboard logs for errors
- Verify Row Level Security (RLS) policies allow your operations
- The migration script uses the service_role key which bypasses RLS

## Security Notes

- The `service_role` key has full access to your database and should NEVER be exposed in client-side code
- The migration script uses `service_role` for data migration only
- The application uses the `anon` key for regular operations
- Review and adjust the RLS policies in `supabase-migration.sql` based on your security requirements

## What Changed

- **Database**: Migrated from SQLite (local file) to Supabase (cloud PostgreSQL)
- **Connection**: All database operations now use Supabase client library
- **API Routes**: Updated to use async Supabase queries
- **Insights**: All insight calculations now use async database queries

The application interface remains the same - all changes are internal to the database layer.

