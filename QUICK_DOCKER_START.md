# Quick Docker Start (After Installing Docker)

## One Command to Start Everything

```powershell
docker-compose up --build
```

That's it! This will:
1. Start PostgreSQL database
2. Build your backend (Prisma client will generate successfully in Linux!)
3. Run database migrations
4. Start the backend server

## What You'll See

- Backend API: http://localhost:5001
- Frontend: http://localhost:5175 (your existing frontend)
- Database: Running in Docker container

## Seed Test Data

After everything starts, in a new terminal:

```powershell
docker exec -it timesheet-backend npm run seed
```

This creates:
- Test organization
- Admin user: admin@test.com / admin123
- Workers, jobsites, etc.

## Stop Everything

Press `Ctrl+C` in the terminal, or:

```powershell
docker-compose down
```

## View Logs

```powershell
docker-compose logs -f backend
```

## Rebuild After Code Changes

```powershell
docker-compose up --build
```

---

**That's it! Once Docker is installed, just run `docker-compose up --build` and everything will work! 🚀**
