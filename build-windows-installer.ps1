# COSTAATT HR Performance Gateway - Windows Installer Builder
# PowerShell Script for Advanced Users

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT HR Performance Gateway" -ForegroundColor Yellow
Write-Host "Windows Installer Builder" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm detected: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/4] Installing desktop dependencies..." -ForegroundColor Yellow
Set-Location "apps\desktop"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install desktop dependencies" -ForegroundColor Red
    exit 1
}
Set-Location "..\.."

Write-Host ""
Write-Host "[2/4] Building web application..." -ForegroundColor Yellow
npm run build --workspace=@costaatt/web
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build web application" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Building desktop application..." -ForegroundColor Yellow
npm run desktop:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build desktop application" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/4] Creating Windows installer..." -ForegroundColor Yellow
Set-Location "apps\desktop"
npm run build-win
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Windows installer" -ForegroundColor Red
    exit 1
}
Set-Location "..\.."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Windows installer is ready at:" -ForegroundColor Yellow
Write-Host "apps\desktop\dist\COSTAATT HR Performance Gateway Setup.exe" -ForegroundColor White
Write-Host ""
Write-Host "This installer includes:" -ForegroundColor Yellow
Write-Host "- Complete HR Performance Gateway" -ForegroundColor White
Write-Host "- All 347+ staff members" -ForegroundColor White
Write-Host "- All appraisal templates" -ForegroundColor White
Write-Host "- Desktop shortcuts" -ForegroundColor White
Write-Host "- Start Menu integration" -ForegroundColor White
Write-Host "- Auto-update capability" -ForegroundColor White
Write-Host ""

# Check if installer exists
$installerPath = "apps\desktop\dist\COSTAATT HR Performance Gateway Setup.exe"
if (Test-Path $installerPath) {
    $fileSize = (Get-Item $installerPath).Length / 1MB
    Write-Host "📦 Installer size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Would you like to open the installer location? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "Y" -or $response -eq "y") {
        Invoke-Item "apps\desktop\dist"
    }
} else {
    Write-Host "❌ Installer not found. Check the build logs above for errors." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
