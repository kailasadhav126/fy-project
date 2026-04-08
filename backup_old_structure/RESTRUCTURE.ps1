# KumbhSahyogi Project Restructure Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KumbhSahyogi - Project Restructure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$currentDir = Get-Location

Write-Host "[1/6] Creating backup folder..." -ForegroundColor Yellow
$backupDir = Join-Path $currentDir "backup_old_structure"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "[2/6] Moving unnecessary folders to backup..." -ForegroundColor Yellow
$foldersToBackup = @("crowd-analysis", "diagrams", "dist", "KumbhSahyogi-1jsx", "node_modules", ".vercel")
foreach ($folder in $foldersToBackup) {
    $folderPath = Join-Path $currentDir $folder
    if (Test-Path $folderPath) {
        $destination = Join-Path $backupDir $folder
        Write-Host "  - Moving $folder to backup" -ForegroundColor Gray
        Move-Item -Path $folderPath -Destination $destination -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[3/6] Moving root config files to backup..." -ForegroundColor Yellow
$filesToBackup = @(
    "drizzle.config.ts", "postcss.config.js", "tailwind.config.ts", 
    "tsconfig.json", "vite.config.ts", "components.json",
    ".replit", "replit.md", "setup-npm-alias.ps1"
)
foreach ($file in $filesToBackup) {
    $filePath = Join-Path $currentDir $file
    if (Test-Path $filePath) {
        Write-Host "  - Moving $file to backup" -ForegroundColor Gray
        Move-Item -Path $filePath -Destination $backupDir -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[4/6] Organizing documentation..." -ForegroundColor Yellow
$docsDir = Join-Path $currentDir "docs"
if (!(Test-Path $docsDir)) {
    New-Item -ItemType Directory -Path $docsDir | Out-Null
}

$docsToMove = @(
    "ADMIN_PANEL_SETUP.md", "API_SETUP_GUIDE.md", "FIXES_APPLIED.md",
    "FIX_ADMIN_ROUTES.md", "PERMANENT_NODEJS_FIX.md", "SETUP_COMPLETE.md"
)
foreach ($doc in $docsToMove) {
    $docPath = Join-Path $currentDir $doc
    if (Test-Path $docPath) {
        Write-Host "  - Moving $doc to docs/" -ForegroundColor Gray
        Move-Item -Path $docPath -Destination $docsDir -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[5/6] Creating clean README files..." -ForegroundColor Yellow
# Keep QUICKSTART.md, PROJECT_STRUCTURE.md, and README.md at root
Write-Host "  - Keeping QUICKSTART.md, PROJECT_STRUCTURE.md, README.md at root" -ForegroundColor Gray

Write-Host "[6/6] Final structure verification..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Restructure Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your clean project structure:" -ForegroundColor Cyan
Write-Host ""
Write-Host "KumbhSahyogi/" -ForegroundColor White
Write-Host "├── client/              (User website)" -ForegroundColor Green
Write-Host "├── server/              (Backend API)" -ForegroundColor Green
Write-Host "├── admin/               (Admin panel)" -ForegroundColor Green
Write-Host "├── assets/              (Images, static files)" -ForegroundColor Yellow
Write-Host "├── docs/                (Documentation)" -ForegroundColor Yellow
Write-Host "├── backup_old_structure/ (Old files - can be deleted)" -ForegroundColor Gray
Write-Host "├── .git/                (Git repository)" -ForegroundColor Gray
Write-Host "├── .env                 (Root environment)" -ForegroundColor Cyan
Write-Host "├── .gitignore           (Git ignore rules)" -ForegroundColor Cyan
Write-Host "├── package.json         (Root package file)" -ForegroundColor Cyan
Write-Host "├── vercel.json          (Deployment config)" -ForegroundColor Cyan
Write-Host "├── README.md            (Main readme)" -ForegroundColor Cyan
Write-Host "├── QUICKSTART.md        (Quick start guide)" -ForegroundColor Cyan
Write-Host "├── PROJECT_STRUCTURE.md (Structure docs)" -ForegroundColor Cyan
Write-Host "└── start-all.bat        (Run everything)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the backup_old_structure/ folder" -ForegroundColor White
Write-Host "2. Delete it if everything works fine" -ForegroundColor White
Write-Host "3. Run: ./start-all.bat to test" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
