@echo off
echo Starting HR Gateway Services...

echo Starting Backend API...
start "HR Backend" cmd /k "cd /d C:\HR\HR\apps\api && node src\simple-server.js"

echo Waiting 3 seconds...
ping 127.0.0.1 -n 4 >nul

echo Starting Frontend Web App...
start "HR Frontend" cmd /k "cd /d C:\HR\HR\apps\web && npm run dev"

echo Services started!
echo Backend: http://10.2.1.27:3000
echo Frontend: http://10.2.1.27:5173
pause
