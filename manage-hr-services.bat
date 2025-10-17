@echo off
echo HR Performance Gateway Service Manager
echo =====================================
echo.
echo 1. Start Services
echo 2. Stop Services  
echo 3. Restart Services
echo 4. Check Status
echo 5. Setup Auto-Startup
echo 6. Remove Auto-Startup
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto setup
if "%choice%"=="6" goto remove
goto end

:start
echo Starting HR services...
call "C:\HR\HR\start-hr-app.bat"
goto end

:stop
echo Stopping HR services...
taskkill /f /im node.exe 2>nul
pm2 stop all 2>nul
pm2 delete all 2>nul
echo Services stopped.
goto end

:restart
echo Restarting HR services...
call :stop
timeout /t 3 /nobreak > nul
call :start
goto end

:status
echo Checking HR service status...
echo.
echo PM2 Processes:
pm2 list
echo.
echo Node.js Processes:
tasklist /fi "imagename eq node.exe" 2>nul
goto end

:setup
echo Setting up auto-startup...
call "C:\HR\HR\setup-auto-startup.bat"
goto end

:remove
echo Removing auto-startup...
schtasks /delete /tn "HR Performance Gateway" /f 2>nul
echo Auto-startup removed.
goto end

:end
echo.
pause
