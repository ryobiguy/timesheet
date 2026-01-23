# Database Cleanup Guide

This guide explains how to delete all users, organizations, and data from your database to start fresh.

## ⚠️ WARNING

**This action is IRREVERSIBLE!** All data will be permanently deleted:
- All organizations
- All users
- All jobsites
- All time entries
- All assignments
- All geofence events
- All disputes
- All timesheet summaries

## How to Run

### Option 1: Using npm script (Recommended)

```bash
cd backend
npm run cleanup
```

### Option 2: Direct execution

```bash
cd backend
npx tsx scripts/cleanup-database.ts
```

## What Happens

1. The script will show you what data currently exists
2. It will delete all organizations
3. Due to cascade relationships, all related data will be automatically deleted:
   - Users (cascades from organizations)
   - Jobsites (cascades from organizations)
   - Time entries (cascades from users/jobsites)
   - Assignments (cascades from users/jobsites)
   - Geofence events (cascades from users/jobsites)
   - Disputes (cascades from time entries)
   - Timesheet summaries (cascades from users/organizations)

## After Cleanup

Once cleanup is complete, you can:

1. **Create a new company account:**
   - Go to `/signup` on your frontend
   - Create a new organization

2. **Create new users:**
   - Log in as the admin
   - Go to the Users page
   - Add new users

## Local vs Production

### Local Development
If you're running locally, make sure your `.env` file has the correct `DATABASE_URL` pointing to your local database.

### Production (Render)
If you want to clean up production data:

1. **Option A: Run script locally with production DATABASE_URL**
   ```bash
   # Set your production DATABASE_URL temporarily
   export DATABASE_URL="your-production-database-url"
   npm run cleanup
   ```

2. **Option B: Connect to Render database directly**
   - Get your database connection string from Render
   - Use a PostgreSQL client (like pgAdmin, DBeaver, or psql)
   - Run: `DELETE FROM organizations;` (cascade will handle the rest)

3. **Option C: Use Render's database console**
   - Go to your PostgreSQL service in Render
   - Open the database console
   - Run: `DELETE FROM organizations;`

## Safety Check

The script will:
- Show you what data exists before deleting
- Only proceed if there's data to delete
- Provide clear confirmation messages

## Troubleshooting

### "Cannot find module" error
Make sure you're in the `backend/` directory and have run `npm install`.

### "Database connection failed"
Check that your `DATABASE_URL` environment variable is set correctly.

### "Permission denied"
Make sure your database user has DELETE permissions.
