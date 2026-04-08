# PowerShell script to permanently add Node.js to PATH
# Run this ONCE as Administrator to fix node/npm permanently

Write-Host "🔧 Setting up Node.js PATH..." -ForegroundColor Cyan

$nodePath = "C:\Program Files\nodejs"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$nodePath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$nodePath", "User")
    Write-Host "✅ Node.js added to PATH!" -ForegroundColor Green
    Write-Host "   Please restart PowerShell for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "✅ Node.js is already in PATH!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Current PATH includes:" -ForegroundColor Cyan
$env:PATH -split ';' | Where-Object { $_ -like "*node*" } | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }

