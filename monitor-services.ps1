# COSTAATT HR Performance Gateway - Service Monitor Script

Write-Host "📊 COSTAATT HR Performance Gateway Service Monitor" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Show PM2 status
pm2 status

Write-Host "`n🔧 Available Commands:" -ForegroundColor Yellow
Write-Host "  pm2 status     - Show service status" -ForegroundColor White
Write-Host "  pm2 monit      - Real-time monitoring" -ForegroundColor White
Write-Host "  pm2 logs       - Show logs" -ForegroundColor White
Write-Host "  pm2 restart all - Restart all services" -ForegroundColor White
Write-Host "  pm2 stop all   - Stop all services" -ForegroundColor White

Write-Host "`n🌐 Service URLs:" -ForegroundColor Yellow
Write-Host "  API Server: http://10.2.1.27:3000" -ForegroundColor Cyan
Write-Host "  Web App:    http://10.2.1.27:5173" -ForegroundColor Cyan

# Test connectivity
Write-Host "`n🔍 Testing Connectivity..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://10.2.1.27:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ API Server: Responding" -ForegroundColor Green
} catch {
    Write-Host "  ❌ API Server: Not responding" -ForegroundColor Red
}

try {
    $webResponse = Invoke-WebRequest -Uri "http://10.2.1.27:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Web App: Responding" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Web App: Not responding" -ForegroundColor Red
}

