@echo off
echo Starting HR Performance Gateway...

REM Change to the project directory
cd /d "C:\HR\HR"

REM Start the backend API server
echo Starting backend API server...
cd apps\api
start "HR Backend API" /min cmd /c "node start-server-with-env.js"
cd ..

REM Start the frontend web app
echo Starting frontend web application...
cd apps\web
start "HR Frontend Web" /min cmd /c "npm run dev"
cd ..

REM Wait a moment for services to start
timeout /t 3 /nobreak > nul

REM Show status
echo.
echo HR Performance Gateway started!
echo Backend API: http://localhost:3000
echo Frontend Web: http://localhost:5173
echo.
echo Services are running in minimized windows.
echo Check Task Manager for node.exe processes.
echo.
pause
