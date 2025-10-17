# HR Performance Gateway Auto-Start Script
Write-Host "Starting HR Performance Gateway..." -ForegroundColor Green

# Change to project directory
Set-Location "C:\HR\HR"

# Start backend with PM2
Write-Host "Starting backend API server with PM2..." -ForegroundColor Yellow
Set-Location "apps\api"
Start-Process -FilePath "pm2" -ArgumentList "start", "ecosystem.config.js" -WindowStyle Hidden -WorkingDirectory (Get-Location)
Start-Sleep -Seconds 2

# Start frontend
Write-Host "Starting frontend web application..." -ForegroundColor Yellow
Set-Location "..\web"
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\HR\HR\apps\web"
    npm run dev
}

# Wait a moment for services to start
Start-Sleep -Seconds 5

# Show status
Write-Host ""
Write-Host "✅ HR Performance Gateway started!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend Web: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are running in the background." -ForegroundColor Yellow
Write-Host "Check Task Manager for node.exe processes." -ForegroundColor Yellow
Write-Host ""

# Keep the script running to maintain the frontend job
try {
    while ($frontendJob.State -eq "Running") {
        Start-Sleep -Seconds 10
    }
} catch {
    Write-Host "Frontend service stopped." -ForegroundColor Red
}
