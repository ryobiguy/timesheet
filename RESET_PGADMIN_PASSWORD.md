# Reset pgAdmin Password & Database Cleanup Options

## Option 1: Run Cleanup Script Locally (EASIEST - No pgAdmin Needed!)

This is the **simplest way** - you don't need pgAdmin at all.

### Steps:

1. **Get your production DATABASE_URL from Render:**
   - Go to your **backend service** in Render
   - Click on **"Environment"** tab
   - Find `DATABASE_URL` and copy the entire value
   - It looks like: `postgresql://user:password@host:port/database`

2. **Run the cleanup script locally:**
   ```powershell
   cd backend
   
   # Set the production DATABASE_URL temporarily
   $env:DATABASE_URL="paste-your-database-url-here"
   
   # Run the cleanup script
   npm run cleanup
   ```

3. **The script will:**
   - Show you what data exists
   - Delete all organizations (and cascade delete everything else)
   - Confirm when done

**That's it!** No pgAdmin needed.

---

## Option 2: Reset PostgreSQL Database Password in Render

If you need to reset the database password for pgAdmin:

1. **Go to your PostgreSQL service in Render**
2. **Click on "Settings" tab**
3. **Look for "Reset Password" or "Change Password"**
4. **Set a new password**
5. **Update your backend service's `DATABASE_URL`** with the new password:
   - Go to backend service → Environment tab
   - Update `DATABASE_URL` with the new password
   - Format: `postgresql://user:NEW_PASSWORD@host:port/database`

---

## Option 3: Reset pgAdmin Master Password

If you forgot your **pgAdmin application password** (not the database password):

### Windows:
1. Close pgAdmin completely
2. Delete the pgAdmin config file:
   - Press `Win + R`
   - Type: `%APPDATA%\pgAdmin`
   - Delete the `pgadmin4.db` file (or the entire folder)
3. Restart pgAdmin
4. You'll be prompted to set a new master password

### Alternative (if above doesn't work):
1. Uninstall pgAdmin
2. Delete `%APPDATA%\pgAdmin` folder
3. Reinstall pgAdmin
4. Set a new master password

---

## Option 4: Get Database Password from DATABASE_URL

Your database password is in your `DATABASE_URL`:

Format: `postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE`

Example:
```
postgresql://timesheet_user:MyPassword123@dpg-xxxxx-a.oregon-postgres.render.com:5432/timesheet_db
                                    ^^^^^^^^^^^^^^
                                    This is your password
```

**To extract it:**
1. Copy your `DATABASE_URL` from Render
2. The password is between the `:` after the username and the `@` symbol
3. Use this password in pgAdmin when connecting

---

## Recommended: Use Option 1

**Option 1 is the easiest** - just run the script locally with your production `DATABASE_URL`. No passwords to remember, no pgAdmin needed!
