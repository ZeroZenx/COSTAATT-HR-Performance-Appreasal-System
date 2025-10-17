Write-Host "🚀 Building COSTAATT HR Performance Gateway Windows Installer..." -ForegroundColor Green

# Navigate to project root
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Clean everything
Write-Host "🧹 Cleaning project..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build web application
Write-Host "🌐 Building web application..." -ForegroundColor Yellow
npm run build --workspace=@costaatt/web

# Check if web build exists
if (-not (Test-Path "apps\web\dist")) {
    Write-Host "❌ Web build failed. Please check the build output above." -ForegroundColor Red
    exit 1
}

# Build desktop app
Write-Host "🖥️ Building desktop application..." -ForegroundColor Yellow
cd apps\desktop

# Install desktop dependencies
npm install

# Create assets directory if it doesn't exist
if (-not (Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" -Force
    Write-Host "📁 Created assets directory. You may need to add icon files." -ForegroundColor Yellow
}

# Build Windows installer
Write-Host "🔨 Building Windows installer..." -ForegroundColor Yellow
npm run build-win

Write-Host "✅ Windows Installer build complete!" -ForegroundColor Green
Write-Host "📁 Installer location: apps\desktop\dist" -ForegroundColor Cyan

# List files in dist directory
if (Test-Path "dist") {
    Write-Host "📦 Generated files:" -ForegroundColor Cyan
    Get-ChildItem "dist" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
}
