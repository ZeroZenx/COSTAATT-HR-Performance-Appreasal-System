# COSTAATT HR Performance Gateway - Service Startup Script
# This script ensures both API and Web services are running with auto-restart

Write-Host "🚀 Starting COSTAATT HR Performance Gateway Services..." -ForegroundColor Green

# Create logs directory if it doesn't exist
if (!(Test-Path "C:\HR\HR\logs")) {
    New-Item -ItemType Directory -Path "C:\HR\HR\logs" -Force
    Write-Host "📁 Created logs directory" -ForegroundColor Yellow
}

# Kill any existing Node.js processes
Write-Host "🔄 Stopping existing services..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process pm2 -ErrorAction SilentlyContinue | Stop-Process -Force

# Start PM2 if not running
Write-Host "🔧 Starting PM2 Process Manager..." -ForegroundColor Yellow
pm2 kill
pm2 start "C:\HR\HR\apps\api\ecosystem.config.js"
pm2 start "C:\HR\HR\apps\web\ecosystem.config.js"

# Save PM2 configuration
pm2 save
pm2 startup

Write-Host "✅ Services started successfully!" -ForegroundColor Green
Write-Host "🌐 API Server: http://10.2.1.27:3000" -ForegroundColor Cyan
Write-Host "🌐 Web App: http://10.2.1.27:5173" -ForegroundColor Cyan
Write-Host "📊 Monitor: pm2 monit" -ForegroundColor Cyan
Write-Host "📋 Status: pm2 status" -ForegroundColor Cyan

# Show current status
Write-Host "`n📊 Current Service Status:" -ForegroundColor Yellow
pm2 status

