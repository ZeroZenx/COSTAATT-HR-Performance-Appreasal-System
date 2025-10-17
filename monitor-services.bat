@echo off
:loop
echo Checking HR Gateway services...

REM Check if backend is running
netstat -an | findstr :3000 >nul
if errorlevel 1 (
    echo Backend not running, restarting...
    start "HR Backend" cmd /k "cd C:\HR\HR\apps\api && node src\simple-server.js"
    timeout /t 5 /nobreak >nul
)

REM Check if frontend is running
netstat -an | findstr :5173 >nul
if errorlevel 1 (
    echo Frontend not running, restarting...
    start "HR Frontend" cmd /k "cd C:\HR\HR\apps\web && npm run dev"
)

REM Wait 30 seconds before next check
timeout /t 30 /nobreak >nul
goto loop
