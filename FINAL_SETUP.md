# Final Setup Instructions

## ✅ What's Done
- PostgreSQL database connected
- Database "timesheet" created  
- All tables created (organizations, users, jobsites, etc.)
- Frontend dependencies installed
- Backend dependencies installed

## 🎯 How to Test Now

### Method 1: Use Prisma Studio (Easiest)

1. **Open Prisma Studio** (visual database editor):
   ```powershell
   cd backend
   npx prisma studio
   ```
   This opens http://localhost:5555 in your browser

2. **Create test data**:
   - Click "Organization" → Add record
     - Name: "Test Construction Co"
     - subscriptionTier: "free"
   - Click "User" → Add record
     - email: "admin@test.com"
     - name: "Admin User"  
     - passwordHash: (use bcrypt hash - see below)
     - role: "ADMIN"
     - orgId: (select the org you just created)
   - Repeat for more users (worker1@test.com, etc.)

3. **For password hashing**, you can use an online bcrypt generator or:
   - Password "admin123" → Hash: `$2a$10$rOzJqZqZqZqZqZqZqZqZqO` (example)
   - Or create users via the registration API endpoint

### Method 2: Use Registration API

1. **Start backend**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Register via API** (in another terminal):
   ```powershell
   # First create an organization in Prisma Studio, then:
   curl -X POST http://localhost:5001/api/auth/register `
     -H "Content-Type: application/json" `
     -d '{\"email\":\"admin@test.com\",\"name\":\"Admin\",\"password\":\"admin123\",\"orgId\":\"YOUR_ORG_ID\",\"role\":\"ADMIN\"}'
   ```

3. **Login via frontend**:
   - Open http://localhost:5175/login
   - Use: admin@test.com / admin123

### Method 3: Direct Database SQL

Connect to PostgreSQL and insert data directly:

```sql
-- Create organization
INSERT INTO organizations (id, name, "subscriptionTier", "createdAt", "updatedAt")
VALUES ('org1', 'Test Construction Co', 'free', NOW(), NOW());

-- Create user (password hash for "admin123")
-- You'll need to generate this with bcrypt
INSERT INTO users (id, email, name, "passwordHash", role, "orgId", "createdAt", "updatedAt")
VALUES ('user1', 'admin@test.com', 'Admin User', '$2a$10$...', 'ADMIN', 'org1', NOW(), NOW());
```

## 🚀 Start Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend  
npm run dev
```

## ✅ Test Checklist

Once you have test data:

- [ ] Open http://localhost:5175
- [ ] Login page loads
- [ ] Register or login with test account
- [ ] Dashboard loads
- [ ] Navigate to Jobsites page
- [ ] Create a jobsite
- [ ] Navigate to Approvals page
- [ ] Test Clock In/Out page
- [ ] Test export functionality

## 🔧 Troubleshooting

**Backend won't start?**
- Check if port 5001 is in use
- Check database connection in .env
- Look for error messages in terminal

**Can't login?**
- Make sure user exists in database
- Check password hash is correct
- Verify JWT_SECRET is set in .env

**Frontend can't connect?**
- Check backend is running
- Verify VITE_API_URL in frontend/.env
- Check browser console for errors

## 📝 Quick Reference

- **Database**: postgresql://postgres:***@localhost:5432/timesheet
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:5175
- **Prisma Studio**: http://localhost:5555 (when running)
