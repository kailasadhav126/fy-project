# PowerShell script to create npm alias
# Run this once: .\setup-npm-alias.ps1

# Add npm alias to PowerShell profile
$profilePath = $PROFILE.CurrentUserAllHosts
$profileDir = Split-Path -Parent $profilePath

# Create profile directory if it doesn't exist
if (!(Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
}

# Check if alias already exists
$aliasExists = Get-Content $profilePath -ErrorAction SilentlyContinue | Select-String "function npm"

if (!$aliasExists) {
    # Add npm function to profile
    Add-Content -Path $profilePath -Value @"

# npm alias to use .cmd instead of .ps1
function npm {
    & "C:\Program Files\nodejs\npm.cmd" `$args
}

"@
    Write-Host "✅ npm alias added to PowerShell profile!" -ForegroundColor Green
    Write-Host "Please restart PowerShell or run: . `$PROFILE" -ForegroundColor Yellow
} else {
    Write-Host "✅ npm alias already exists in profile" -ForegroundColor Green
}

