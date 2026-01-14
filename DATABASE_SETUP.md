# Database Setup Guide

## Current Issue
The application needs a PostgreSQL database to run. You have a few options:

## Option 1: Use Existing PostgreSQL (Recommended)

If you have PostgreSQL installed:

1. **Update your `.env` file** in the `backend` folder:
   ```env
   DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/timesheet
   ```
   
   Replace:
   - `USERNAME` with your PostgreSQL username (often `postgres`)
   - `PASSWORD` with your PostgreSQL password
   - `5432` with your PostgreSQL port (default is 5432)
   - `timesheet` is the database name (will be created automatically)

2. **Create the database** (if it doesn't exist):
   ```powershell
   # Using psql command line:
   psql -U postgres -c "CREATE DATABASE timesheet;"
   
   # Or using createdb:
   createdb timesheet
   ```

3. **Run migrations**:
   ```powershell
   cd backend
   npx prisma migrate dev --name init
   ```

4. **Seed test data**:
   ```powershell
   npm run seed
   ```

## Option 2: Use Docker PostgreSQL

If you have Docker:

```powershell
# Start PostgreSQL in Docker
docker run --name timesheet-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=timesheet -p 5432:5432 -d postgres

# Update .env:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/timesheet

# Then run migrations and seed
cd backend
npx prisma migrate dev --name init
npm run seed
```

## Option 3: Use Prisma Accelerate (Cloud)

If you have a Prisma Accelerate URL (like the one in your original .env):

1. Keep the Prisma Accelerate URL in your `.env`
2. Generate with Accelerate:
   ```powershell
   cd backend
   npx prisma generate --accelerate
   ```
3. Run migrations:
   ```powershell
   npx prisma migrate deploy
   ```

## Quick Test Without Database

To test the frontend UI without backend:

1. Start frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

2. The UI will load but API calls will fail (which is expected)

## Next Steps After Database Setup

Once database is connected:

1. **Start backend**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Start frontend** (in another terminal):
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Test**:
   - Open http://localhost:5175/login
   - Use test credentials from seed script

## Test Credentials (after seeding)

- Admin: `admin@test.com` / `admin123`
- Supervisor: `supervisor@test.com` / `super123`
- Worker 1: `worker1@test.com` / `worker123`
- Worker 2: `worker2@test.com` / `worker123`
