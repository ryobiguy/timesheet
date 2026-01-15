# PostgreSQL Setup for Render

## Problem
SQLite on Render uses an ephemeral filesystem - the database gets wiped on every deploy/restart, causing data loss.

## Solution
Switch to PostgreSQL (Render provides managed PostgreSQL with persistent storage).

## Steps to Fix

### 1. Create PostgreSQL Database on Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `clockly-database` (or any name)
   - **Database**: `clockly` (or any name)
   - **User**: (auto-generated)
   - **Region**: Same as your backend service
   - **PostgreSQL Version**: 15 or 16
   - **Plan**: Free tier is fine for development
4. Click **"Create Database"**
5. Wait for it to provision (takes 1-2 minutes)

### 2. Get Database Connection String

1. Once created, click on your PostgreSQL database
2. Find the **"Internal Database URL"** or **"Connection String"**
3. It will look like:
   ```
   postgresql://user:password@hostname:5432/database_name
   ```

### 3. Update Backend Environment Variable

1. Go to your **Web Service** (the backend) on Render
2. Click **"Environment"** tab
3. Add/Update the `DATABASE_URL` variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the PostgreSQL connection string from step 2
4. Click **"Save Changes"**

### 4. Redeploy Backend

1. Render will automatically redeploy when you save environment variables
2. Or manually trigger a deploy from the "Manual Deploy" section
3. The Dockerfile will run `prisma migrate deploy` or `prisma db push` to create tables

### 5. Verify It Works

1. Check the deploy logs - should see "Prisma migrations applied"
2. Try creating a user in the web app
3. Restart the service - data should persist!

## What Changed

- ✅ Prisma schema updated to use PostgreSQL
- ✅ Date fields converted from String to DateTime (proper PostgreSQL types)
- ✅ Dockerfile updated to use migrations
- ✅ Environment config requires DATABASE_URL

## Notes

- **Free tier PostgreSQL** on Render has limitations but is fine for development
- **Data persists** across deploys and restarts
- **Backup automatically** handled by Render
- If you need to reset the database, you can drop/recreate it in Render dashboard
