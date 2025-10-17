@echo off
echo Starting COSTAATT HR Performance Gateway with Apache integration...

REM Check if Apache is running
echo Checking Apache status...
sc query Apache2.4 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Apache service is running
) else (
    echo ⚠️ Apache service not found, checking XAMPP...
    if exist "C:\xampp\apache\bin\httpd.exe" (
        echo Starting XAMPP Apache...
        start "" "C:\xampp\xampp-control.exe"
        timeout /t 5 /nobreak >nul
    ) else (
        echo ❌ Apache not found! Please install XAMPP or Apache first.
        pause
        exit /b 1
    )
)

REM Start the backend server in the background
echo Starting backend server...
start /B /MIN cmd /c "cd /d %~dp0apps\api && node src/simple-server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start the frontend server in the background
echo Starting frontend server...
start /B /MIN cmd /c "cd /d %~dp0apps\web && npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ✅ COSTAATT HR Performance Gateway is starting...
echo.
echo Your application will be available at:
echo   🌐 Frontend: http://10.2.1.27:5173/
echo   🔧 Backend API: http://10.2.1.27:3000/
echo   📊 Dashboard: http://10.2.1.27:5173/dashboard
echo   ⚙️ Settings: http://10.2.1.27:5173/settings
echo.
echo If you've configured Apache reverse proxy, you can also access via:
echo   🌐 Apache: http://10.2.1.27/costaatt-hr/
echo.
echo Press any key to open the application in your browser...
pause >nul
start http://10.2.1.27:5173/dashboard

echo.
echo Servers are running in the background.
echo To stop them, close the terminal windows or use Task Manager.
echo.
