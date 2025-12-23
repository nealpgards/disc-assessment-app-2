# Migration Checklist

## ✅ Pre-Migration Checklist

Before running the migration script, make sure:

1. **Environment Variables Set**
   - [ ] Opened `.env.local` file
   - [ ] Replaced `your_supabase_project_url_here` with your actual Supabase URL
   - [ ] Replaced `your_supabase_anon_key_here` with your actual anon key
   - [ ] Replaced `your_supabase_service_role_key_here` with your actual service_role key

2. **Database Table Created**
   - [ ] Went to Supabase Dashboard → SQL Editor
   - [ ] Ran the SQL from `supabase-migration.sql`
   - [ ] Verified table was created (check Table Editor → results table)

## 🚀 Run Migration

Once the checklist above is complete, run:

```bash
npx tsx scripts/migrate-to-supabase.ts
```

The script will:
- Read all 6 records from your SQLite database
- Insert them into Supabase
- Show you a summary

## ✅ Post-Migration Verification

After migration completes:

1. [ ] Check Supabase Table Editor → results table
2. [ ] Verify you see 6 records
3. [ ] Test your app: `npm run dev`
4. [ ] Try creating a new assessment
5. [ ] Check admin dashboard shows data

## 🆘 If Something Goes Wrong

- **"Missing Supabase credentials"**: Check `.env.local` file exists and has correct values
- **"Table doesn't exist"**: Make sure you ran the SQL migration in Step 3
- **"Permission denied"**: Check your service_role key is correct
- **No data migrated**: Check Supabase logs in the dashboard

