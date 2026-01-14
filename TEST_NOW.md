# Quick Testing Guide - Right Now!

## Current Status
- ✅ Backend dependencies installed
- ✅ Frontend dependencies installed  
- ⚠️ Prisma client generation needs to be fixed
- 🔄 Backend server starting...

## Immediate Steps to Test

### 1. Fix Prisma Client Generation

The Prisma client needs to be generated. Try one of these:

**Option A: Use default Prisma location**
```powershell
cd backend
# The schema is already updated to use default location
# Try: npm install -g prisma@5.10.2
# Then: prisma generate
```

**Option B: Manual generation**
```powershell
cd backend
npx prisma@5.10.2 generate --schema=./prisma/schema.prisma
```

**Option C: If all else fails, update to Prisma 7**
```powershell
cd backend
npm install prisma@latest @prisma/client@latest
# Then update schema.prisma to remove url from datasource
# And create prisma.config.ts (see Prisma 7 docs)
```

### 2. Check Backend is Running

Open a new terminal and check:
```powershell
curl http://localhost:5001/api/health
```

Should return: `{"status":"ok","uptime":...}`

### 3. Set Up Database

Make sure PostgreSQL is running and create the database:

```powershell
# If PostgreSQL is installed locally:
createdb timesheet

# Or via psql:
psql -U postgres -c "CREATE DATABASE timesheet;"
```

### 4. Run Migrations

```powershell
cd backend
npx prisma migrate dev --name init
```

### 5. Seed Test Data

```powershell
cd backend
npm run seed
```

This creates:
- Organization: "Test Construction Co"
- Users: admin@test.com, supervisor@test.com, worker1@test.com, worker2@test.com
- All passwords: admin123, super123, worker123
- 2 jobsites
- Sample time entries

### 6. Start Frontend

```powershell
cd frontend
npm run dev
```

Frontend will open at `http://localhost:5175`

### 7. Test Login

1. Go to `http://localhost:5175/login`
2. Login with: `admin@test.com` / `admin123`
3. You should see the dashboard!

## Quick Test Checklist

Once logged in:

- [ ] **Overview Page** - See stats and pending entries
- [ ] **Jobsites** - See 2 test jobsites, try creating one
- [ ] **Search/Filter** - Test search bar and sorting
- [ ] **Live Roster** - See active workers
- [ ] **Approvals** - Approve/reject time entries
- [ ] **Export CSV** - Click export button (admin only)
- [ ] **Clock In/Out** - Login as worker1@test.com, test clocking
- [ ] **Logout** - Test logout button

## If Backend Won't Start

Check for errors:
```powershell
cd backend
npm run dev
```

Common issues:
1. **Prisma client not generated** - Run `npx prisma generate`
2. **Database connection** - Check DATABASE_URL in .env
3. **Port in use** - Change PORT in .env
4. **Missing dependencies** - Run `npm install`

## Manual API Testing

Once backend is running, test with curl:

```powershell
# Health check
curl http://localhost:5001/api/health

# Register (get org ID from database first)
curl -X POST http://localhost:5001/api/auth/register -H "Content-Type: application/json" -d '{\"email\":\"test@test.com\",\"name\":\"Test\",\"password\":\"test1234\",\"orgId\":\"YOUR_ORG_ID\",\"role\":\"WORKER\"}'

# Login
curl -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"admin@test.com\",\"password\":\"admin123\"}'
# Save the token from response

# Test protected endpoint
curl http://localhost:5001/api/jobsites -H "Authorization: Bearer YOUR_TOKEN"
```

## Need Help?

Check these files:
- `QUICK_START.md` - Detailed setup guide
- `TESTING.md` - Comprehensive testing documentation
- `README.md` - Full project documentation
