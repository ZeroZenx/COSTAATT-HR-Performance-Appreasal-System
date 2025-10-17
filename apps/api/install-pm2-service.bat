@echo off
echo Installing PM2 and setting up HR Performance Management System...

REM Install PM2 globally
npm install -g pm2

REM Create PM2 ecosystem file
echo { > ecosystem.config.js
echo   "apps": [ >> ecosystem.config.js
echo     { >> ecosystem.config.js
echo       "name": "hr-performance-management", >> ecosystem.config.js
echo       "script": "src/simple-server.js", >> ecosystem.config.js
echo       "cwd": "C:\HR\HR\apps\api", >> ecosystem.config.js
echo       "instances": 1, >> ecosystem.config.js
echo       "autorestart": true, >> ecosystem.config.js
echo       "watch": false, >> ecosystem.config.js
echo       "max_memory_restart": "1G", >> ecosystem.config.js
echo       "env": { >> ecosystem.config.js
echo         "NODE_ENV": "production" >> ecosystem.config.js
echo       } >> ecosystem.config.js
echo     } >> ecosystem.config.js
echo   ] >> ecosystem.config.js
echo } >> ecosystem.config.js

REM Start the application with PM2
pm2 start ecosystem.config.js

REM Save PM2 configuration
pm2 save

REM Install PM2 startup script for Windows
pm2-startup install

echo.
echo ✅ HR Performance Management System installed with PM2
echo.
echo To manage the service:
echo   - Status: pm2 status
echo   - Restart: pm2 restart hr-performance-management
echo   - Stop: pm2 stop hr-performance-management
echo   - Logs: pm2 logs hr-performance-management
echo.
pause
