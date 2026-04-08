# Quick Start Script for Kumbh Sahyogi
# This script helps you start both frontend and backend servers

# Add Node.js to PATH for this session
$env:PATH += ";C:\Program Files\nodejs"

# Define npm function for this session (backup)
function npm { & "C:\Program Files\nodejs\npm.cmd" $args }

Write-Host "🚀 Starting Kumbh Sahyogi Servers..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "server")) {
    Write-Host "❌ Error: server folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from: KumbhSahyogi-1jsx\KumbhSahyogi-1jsx" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Starting Backend Server (Port 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH += ';C:\Program Files\nodejs'; cd '$PWD\server'; npm start"

Start-Sleep -Seconds 3

Write-Host "📦 Starting Frontend Server (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH += ';C:\Program Files\nodejs'; cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "✅ Servers are starting in separate windows!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

