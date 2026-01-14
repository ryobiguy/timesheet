# PowerShell script to fix Prisma client generation on Windows
Write-Host "=== Fixing Prisma Client Generation ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean everything
Write-Host "Step 1: Cleaning old Prisma files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules\@prisma\client" -ErrorAction SilentlyContinue
Write-Host "✅ Cleaned" -ForegroundColor Green

# Step 2: Reinstall @prisma/client
Write-Host "`nStep 2: Reinstalling @prisma/client..." -ForegroundColor Yellow
npm uninstall @prisma/client
npm install @prisma/client@5.10.2
Write-Host "✅ Installed" -ForegroundColor Green

# Step 3: Try generation with explicit path
Write-Host "`nStep 3: Attempting Prisma client generation..." -ForegroundColor Yellow
$prismaPath = Join-Path $PWD "node_modules\prisma\build\index.js"
if (Test-Path $prismaPath) {
    node $prismaPath generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Generation successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Generation had errors, but checking if files were created..." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Prisma CLI not found at expected path" -ForegroundColor Red
}

# Step 4: Verify
Write-Host "`nStep 4: Verifying Prisma client..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client\index.js") {
    $content = Get-Content "node_modules\.prisma\client\index.js" -Raw
    if ($content -notmatch "did not initialize") {
        Write-Host "✅ Prisma client appears to be properly generated!" -ForegroundColor Green
        Write-Host "`nTry running: npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Client files exist but may still be stubs" -ForegroundColor Yellow
        Write-Host "`nThis is a known Windows issue. Try:" -ForegroundColor Yellow
        Write-Host "  1. Restart your terminal" -ForegroundColor White
        Write-Host "  2. Use WSL if available" -ForegroundColor White
        Write-Host "  3. Or use Docker" -ForegroundColor White
    }
} else {
    Write-Host "❌ Prisma client files not found" -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
