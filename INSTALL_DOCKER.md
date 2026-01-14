# Install Docker for Windows

## Step 1: Install Docker Desktop

1. **Download Docker Desktop for Windows:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Download "Docker Desktop for Windows"
   - Run the installer

2. **Install:**
   - Follow the installation wizard
   - Make sure "Use WSL 2 instead of Hyper-V" is checked (if available)
   - Restart your computer when prompted

3. **Start Docker Desktop:**
   - Open Docker Desktop from Start menu
   - Wait for it to start (whale icon in system tray)
   - Make sure it says "Docker Desktop is running"

## Step 2: Verify Installation

Open PowerShell and run:
```powershell
docker --version
docker-compose --version
```

You should see version numbers.

## Step 3: Start the Application

Once Docker is running:

```powershell
# From the timesheet directory
docker-compose up --build
```

This will:
- ✅ Pull PostgreSQL image
- ✅ Build your backend image
- ✅ Generate Prisma client (works in Linux!)
- ✅ Start both services

## Step 4: Test

1. **Backend**: http://localhost:5001/api/health
2. **Frontend**: http://localhost:5175 (should already be running)

## Alternative: If You Don't Want to Install Docker

You can also use **WSL (Windows Subsystem for Linux)** if you have it:

```bash
# In WSL terminal
cd /mnt/c/Users/Ryan\ Guy/CascadeProjects/content-platform/timesheet/backend
npm install
npx prisma generate  # This works in WSL!
npm run dev
```

## Need Help?

- Docker Desktop docs: https://docs.docker.com/desktop/install/windows-install/
- If Docker won't install, try WSL option above
