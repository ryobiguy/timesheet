# Testing Guide

This guide will help you test all features of the Timesheet application.

## Prerequisites

1. **PostgreSQL Database** - Make sure PostgreSQL is running
2. **Node.js** - Version 18+ recommended
3. **Environment Variables** - Set up `.env` files

## Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/timesheet
JWT_SECRET=your-super-secret-jwt-key-change-in-production
EOF

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend should be running on `http://localhost:5001`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Optional: Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5001
EOF

# Start frontend dev server
npm run dev
```

Frontend should be running on `http://localhost:5175` (or check terminal output)

## Testing Steps

### Step 1: Create Test Organization

First, you need to create an organization in the database. You can do this via Prisma Studio:

```bash
cd backend
npx prisma studio
```

Or use the seed script (see below).

### Step 2: Register a User

1. Open `http://localhost:5175/register`
2. Fill in the form:
   - **Name**: Test Admin
   - **Email**: admin@test.com
   - **Organization ID**: (use the org ID from Step 1)
   - **Role**: Admin
   - **Password**: test1234 (min 8 characters)
   - **Confirm Password**: test1234
3. Click "Create account"
4. You should be automatically logged in and redirected to the dashboard

### Step 3: Create a Jobsite

1. Navigate to "Jobsites" in the sidebar
2. Click "+ Add Jobsite"
3. Fill in:
   - **Name**: Test Construction Site
   - **Address**: 123 Main St, City, State
   - **Latitude**: 40.7128 (or your location)
   - **Longitude**: -74.0060 (or your location)
   - **Radius**: 150
   - **Organization ID**: (your org ID)
4. Click "Create"
5. Verify the jobsite appears in the list

### Step 4: Register a Worker

1. Logout (click logout in header)
2. Register a new user:
   - **Name**: John Worker
   - **Email**: worker@test.com
   - **Organization ID**: (same org ID)
   - **Role**: Worker
   - **Password**: test1234
3. Login with worker@test.com

### Step 5: Create Assignment

You need to assign the worker to the jobsite. Use Prisma Studio or the API:

```bash
# Get your worker ID and jobsite ID from the UI or database
curl -X POST http://localhost:5001/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "workerId": "WORKER_ID",
    "jobsiteId": "JOBSITE_ID",
    "scheduleDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }'
```

Or create a simple script (see below).

### Step 6: Test Clock In/Out

1. Navigate to "Clock In/Out" page
2. Allow location access when prompted
3. Select the jobsite you created
4. Click "Clock In"
5. Verify you see "Currently Clocked In" message
6. Click "Clock Out"
7. Verify success message

### Step 7: Test Time Entry Approval

1. Login as admin@test.com
2. Navigate to "Approvals" page
3. You should see the time entry created from clock in/out
4. Click "Approve" on the entry
5. Verify status changes to "APPROVED"
6. Try filtering by status (PENDING, APPROVED, DISPUTED)

### Step 8: Test Live Roster

1. Navigate to "Live Roster" page
2. Should show active workers (if any are clocked in)
3. Page auto-refreshes every 30 seconds
4. Verify entries are grouped by jobsite

### Step 9: Test Export

1. Stay on "Approvals" page (as admin)
2. Click "Export CSV" button
3. Verify CSV file downloads
4. Open CSV and verify data is correct

### Step 10: Test Advanced Filtering

1. Navigate to "Jobsites" page
2. Use search bar to filter by name or address
3. Change sort order (ascending/descending)
4. Change sort by (name, date created, etc.)
5. Verify results update in real-time

## API Testing with cURL

### Health Check
```bash
curl http://localhost:5001/api/health
```

### Register User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "test1234",
    "orgId": "YOUR_ORG_ID",
    "role": "WORKER"
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
  }'
```

Save the token from the response, then use it:

### Create Jobsite (Protected)
```bash
curl -X POST http://localhost:5001/api/jobsites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Site",
    "address": "123 Main St",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radiusMeters": 150,
    "orgId": "YOUR_ORG_ID"
  }'
```

### Create Geofence Event (Clock In)
```bash
curl -X POST http://localhost:5001/api/geofence-events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "workerId": "WORKER_ID",
    "jobsiteId": "JOBSITE_ID",
    "type": "ENTER",
    "timestamp": "2024-01-15T09:00:00Z",
    "source": "device"
  }'
```

### List Time Entries
```bash
curl http://localhost:5001/api/time-entries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues

### Database Connection Error
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env` is correct
- Check database exists: `psql -l | grep timesheet`

### Prisma Client Not Generated
```bash
cd backend
npx prisma generate
```

### CORS Errors
- Make sure backend is running on port 5001
- Check frontend VITE_API_URL matches backend URL

### Authentication Errors
- Verify JWT_SECRET is set in backend `.env`
- Check token is being sent in Authorization header
- Token expires after 7 days, login again if needed

### Location Not Working
- Make sure browser has location permissions
- Use HTTPS or localhost (required for geolocation API)
- Check browser console for errors

## Test Data Script

See `backend/scripts/seed.ts` for automated test data creation.
