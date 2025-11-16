# Betegna Development Server Starter
# This script starts both backend and frontend servers

Write-Host "Starting Betegna Development Servers..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "Starting Backend (port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "✅ Servers starting in separate windows" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

