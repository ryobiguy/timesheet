# Quick Start Testing Guide

## Fastest Way to Test Everything

### 1. Start Backend

```bash
cd backend
npm install
# Create .env with DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run seed  # Creates test data automatically
npm run dev
```

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Test Login

Open `http://localhost:5175/login` and use:
- **Email**: `admin@test.com`
- **Password**: `admin123`

Or use any of these test accounts:
- Admin: `admin@test.com` / `admin123`
- Supervisor: `supervisor@test.com` / `super123`
- Worker 1: `worker1@test.com` / `worker123`
- Worker 2: `worker2@test.com` / `worker123`

### 4. Quick Test Checklist

- [ ] Login works
- [ ] Can see Overview page with stats
- [ ] Can navigate to Jobsites (should see 2 test jobsites)
- [ ] Can create a new jobsite
- [ ] Can search/filter jobsites
- [ ] Can navigate to Live Roster (should see worker2 clocked in)
- [ ] Can navigate to Approvals (should see pending entries)
- [ ] Can approve/reject time entries
- [ ] Can export CSV (as admin)
- [ ] Can navigate to Clock In/Out
- [ ] Can clock in/out (as worker)
- [ ] Logout works

### 5. Test Clock In/Out Flow

1. Logout and login as `worker1@test.com` / `worker123`
2. Go to Clock In/Out page
3. Allow location access
4. Select "Downtown Office Building"
5. Click "Clock In"
6. Verify success message
7. Click "Clock Out"
8. Login as admin and check Approvals page - should see new entry

### 6. Test Geofence Events API

```bash
# Get token from login response, then:
TOKEN="your-jwt-token-here"
WORKER_ID="worker-id-from-db"
JOBSITE_ID="jobsite-id-from-db"

# Clock in (ENTER event)
curl -X POST http://localhost:5001/api/geofence-events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"workerId\": \"$WORKER_ID\",
    \"jobsiteId\": \"$JOBSITE_ID\",
    \"type\": \"ENTER\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"source\": \"test\"
  }"

# Clock out (EXIT event) - wait a few minutes
curl -X POST http://localhost:5001/api/geofence-events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"workerId\": \"$WORKER_ID\",
    \"jobsiteId\": \"$JOBSITE_ID\",
    \"type\": \"EXIT\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"source\": \"test\"
  }"
```

### 7. Test Weekly Summary

```bash
# Calculate weekly summary for a worker
curl -X POST http://localhost:5001/api/summaries/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"workerId\": \"$WORKER_ID\",
    \"weekStart\": \"2024-01-15T00:00:00Z\"
  }"
```

## Troubleshooting

**Database not found?**
```bash
createdb timesheet  # PostgreSQL command
```

**Prisma errors?**
```bash
cd backend
npx prisma generate
npx prisma migrate reset  # WARNING: Deletes all data
npm run seed
```

**Port already in use?**
- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.ts`

**CORS errors?**
- Make sure backend is running
- Check `VITE_API_URL` in frontend `.env` matches backend URL

## Test Data Created by Seed

- 1 Organization: "Test Construction Co"
- 4 Users (admin, supervisor, 2 workers)
- 2 Jobsites (Downtown Office Building, Riverside Construction Site)
- 3 Assignments (workers assigned to jobsites)
- 2 Sample time entries (1 approved, 1 pending/active)

All passwords are simple (admin123, worker123, etc.) for easy testing.
