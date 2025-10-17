Write-Host "Starting COSTAATT HR Performance Gateway servers..." -ForegroundColor Green

Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\api; node src\simple-server.js"

Start-Sleep -Seconds 3

Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web; npm run dev"

Write-Host "Servers started! Check the opened windows for status." -ForegroundColor Green
Write-Host "Backend: http://10.2.1.27:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://10.2.1.27:5173" -ForegroundColor Cyan
