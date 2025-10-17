# COSTAATT HR Performance Gateway - Service Stop Script

Write-Host "🛑 Stopping COSTAATT HR Performance Gateway Services..." -ForegroundColor Red

# Stop PM2 processes
pm2 stop all
pm2 delete all

# Kill any remaining Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process pm2 -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✅ All services stopped successfully!" -ForegroundColor Green

