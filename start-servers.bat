@echo off
echo Starting COSTAATT HR Performance Gateway servers...

echo Starting backend server...
start "Backend Server" cmd /k "cd apps\api && node src\simple-server.js"

timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd apps\web && npm run dev"

echo Servers started! Check the opened windows for status.
echo Backend: http://10.2.1.27:3000
echo Frontend: http://10.2.1.27:5173
pause
