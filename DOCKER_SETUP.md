# Docker Setup Guide

## Quick Start

### Option 1: Docker Compose (Easiest)

This will start both PostgreSQL and the backend:

```powershell
# From the timesheet directory
docker-compose up --build
```

This will:
- ✅ Start PostgreSQL database
- ✅ Build and start the backend
- ✅ Generate Prisma client (works in Linux!)
- ✅ Run migrations automatically

### Option 2: Just Backend in Docker

If you want to use your existing PostgreSQL:

```powershell
cd backend

# Build the image
docker build -t timesheet-backend .

# Run the container
docker run -it --rm `
  -p 5001:5001 `
  -v ${PWD}/src:/app/src `
  -v ${PWD}/prisma:/app/prisma `
  -e DATABASE_URL="postgresql://postgres:222222@host.docker.internal:5432/timesheet" `
  -e JWT_SECRET="test-jwt-secret-key-change-in-production-min-32-chars" `
  timesheet-backend
```

**Note:** Use `host.docker.internal` to connect to PostgreSQL on your Windows host.

## After Starting

1. **Backend will be at**: http://localhost:5001
2. **Test health**: `curl http://localhost:5001/api/health`
3. **Seed data** (in another terminal):
   ```powershell
   docker exec -it timesheet-backend npm run seed
   ```

## Useful Commands

```powershell
# View logs
docker-compose logs -f backend

# Stop everything
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Run commands in container
docker exec -it timesheet-backend npm run seed
docker exec -it timesheet-backend npx prisma studio
```

## Troubleshooting

**Port already in use?**
- Change port in docker-compose.yml: `"5002:5001"`

**Database connection issues?**
- Make sure PostgreSQL container is healthy
- Check DATABASE_URL in docker-compose.yml

**Need to regenerate Prisma client?**
```powershell
docker exec -it timesheet-backend npx prisma generate
```
