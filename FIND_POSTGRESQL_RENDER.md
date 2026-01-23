# How to Find PostgreSQL in Render

## Where to Look

### Method 1: Dashboard Sidebar
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Look at the **left sidebar** for:
   - **"Databases"** section
   - **"Postgres"** section
   - Or scroll through **"Services"** - PostgreSQL databases appear as services

### Method 2: All Services View
1. Click **"Services"** or **"All Services"** in the sidebar
2. Look for a service with:
   - Type: **"PostgreSQL"**
   - Name might be something like:
     - `timesheet-db`
     - `postgres`
     - `database`
     - Or whatever you named it

### Method 3: Check Your Backend Service
1. Go to your **backend service** (the one running your API)
2. Click on it
3. Go to **"Environment"** tab
4. Look for `DATABASE_URL` - this will tell you:
   - The database name
   - The hostname
   - The connection details

### Method 4: Search
1. Use the **search bar** at the top of Render dashboard
2. Search for: `postgres`, `database`, or `db`

## If You Still Can't Find It

### Option A: Database Was Never Created
If you don't see a PostgreSQL database, you may need to create one:

1. Click **"New +"** button (top right)
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name**: `timesheet-db` (or any name)
   - **Database**: `timesheet` (or any name)
   - **User**: `timesheet_user` (or any name)
   - **Region**: Same region as your backend
   - **PostgreSQL Version**: Latest (14 or 15)
   - **Plan**: Free tier (or paid if you need it)
4. Click **"Create Database"**
5. Once created, copy the **"Internal Database URL"**
6. Update your backend service's `DATABASE_URL` environment variable

### Option B: Database is Attached to Backend Service
Some Render setups attach the database directly to the service. Check:

1. Go to your **backend service**
2. Look for a **"Databases"** tab or section
3. The database might be listed there

## Accessing the Database Console

Once you find your PostgreSQL database:

1. Click on the **PostgreSQL service**
2. Look for:
   - **"Connect"** button
   - **"Database Console"** tab
   - **"psql"** or **"Query"** option
3. This opens a web-based SQL console where you can run:
   ```sql
   DELETE FROM organizations;
   ```

## Quick Check: Is Database Working?

If your backend is running successfully, the database exists and is connected. You just need to find it in the UI.

Check your backend logs - if you see successful database connections, the database is there!

## Need Help?

If you still can't find it:
1. Take a screenshot of your Render dashboard
2. Check what services you see listed
3. Look at your backend service's environment variables for `DATABASE_URL`
