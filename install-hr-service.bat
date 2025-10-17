@echo off
echo Installing COSTAATT HR as Windows Service...

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Install node-windows if not already installed
echo Installing node-windows...
npm install -g node-windows

REM Create service installation script
echo Creating service installation script...
cd /d "%~dp0"

REM Create the service wrapper
echo var Service = require('node-windows').Service; > service-install.js
echo. >> service-install.js
echo var svc = new Service({ >> service-install.js
echo   name:'COSTAATT HR Performance Gateway', >> service-install.js
echo   description: 'COSTAATT HR Performance Gateway - Node.js Application', >> service-install.js
echo   script: '%CD%\\apps\\api\\src\\simple-server.js', >> service-install.js
echo   nodeOptions: [ >> service-install.js
echo     '--max_old_space_size=4096' >> service-install.js
echo   ] >> service-install.js
echo }); >> service-install.js
echo. >> service-install.js
echo svc.on('install',function(){ >> service-install.js
echo   svc.start(); >> service-install.js
echo   console.log('COSTAATT HR service installed and started!'); >> service-install.js
echo }); >> service-install.js
echo. >> service-install.js
echo svc.install(); >> service-install.js

echo Installing service...
node service-install.js

echo.
echo ✅ Service installed successfully!
echo.
echo The COSTAATT HR service will now start automatically with Windows.
echo You can manage it through Services.msc or use:
echo   net start "COSTAATT HR Performance Gateway"
echo   net stop "COSTAATT HR Performance Gateway"
echo.
pause
