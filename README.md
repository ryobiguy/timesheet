# Timesheet Control - GeoFence Workforce

A comprehensive construction workforce timesheet management system with geofencing capabilities.

## Features

- 🔐 **Authentication** - JWT-based auth with role-based access control
- 📍 **Geofencing** - Automatic time tracking via GPS geofence events
- ⏱️ **Time Management** - Clock in/out, time entry approval workflow
- 📊 **Dashboard** - Real-time overview of active workers and pending approvals
- 📤 **Export** - CSV export of time entries with filtering
- 🔍 **Advanced Filtering** - Search, sort, and filter jobsites and time entries
- 📱 **Mobile-Friendly** - Responsive design with mobile clock in/out interface

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Backend Setup

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

# Seed test data (optional but recommended)
npm run seed

# Start dev server
npm run dev
```

Backend runs on `http://localhost:5001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Optional: Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5001
EOF

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5175` (or check terminal)

## Testing

See [QUICK_START.md](./QUICK_START.md) for the fastest way to test everything, or [TESTING.md](./TESTING.md) for comprehensive testing guide.

### Quick Test

1. Run `npm run seed` in backend to create test data
2. Open `http://localhost:5175/login`
3. Login with `admin@test.com` / `admin123`
4. Explore all features!

## Test Accounts (from seed script)

- **Admin**: `admin@test.com` / `admin123`
- **Supervisor**: `supervisor@test.com` / `super123`
- **Worker 1**: `worker1@test.com` / `worker123`
- **Worker 2**: `worker2@test.com` / `worker123`

## Project Structure

```
timesheet/
├── backend/          # Express + Prisma API
│   ├── src/
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Business logic
│   │   ├── middleware/# Auth, logging, validation
│   │   └── lib/      # Utilities (Prisma, auth)
│   ├── prisma/       # Database schema
│   └── scripts/      # Seed and utility scripts
└── frontend/         # React + Vite dashboard
    ├── src/
    │   ├── pages/    # Page components
    │   ├── components/# Reusable components
    │   ├── contexts/ # React contexts (Auth)
    │   └── lib/      # API clients
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Jobsites
- `GET /api/jobsites` - List jobsites (with search/filter)
- `GET /api/jobsites/:id` - Get single jobsite
- `POST /api/jobsites` - Create jobsite
- `PUT /api/jobsites/:id` - Update jobsite
- `DELETE /api/jobsites/:id` - Delete jobsite

### Time Entries
- `GET /api/time-entries` - List time entries (with filters)
- `GET /api/time-entries/:id` - Get single entry
- `POST /api/time-entries` - Create entry
- `PUT /api/time-entries/:id` - Update entry
- `DELETE /api/time-entries/:id` - Delete entry

### Geofence Events
- `POST /api/geofence-events` - Create event (triggers auto time entry)
- `GET /api/geofence-events` - List events

### Summaries
- `GET /api/summaries` - List weekly summaries
- `POST /api/summaries/calculate` - Calculate weekly summary

### Exports
- `GET /api/exports/time-entries` - Export time entries as CSV

## Development

### Backend Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run start    # Start production server
npm run seed     # Seed test data
npm run lint     # Run ESLint
```

### Frontend Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/timesheet
JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5001
```

## Database Migrations

```bash
cd backend

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

## License

Private - Internal use only
