@echo off
cd /d C:\HR\HR

REM Set environment variables for SendGrid
set SENDGRID_API_KEY=SG.test-key-for-development
set SENDGRID_FROM_EMAIL=hr@costaatt.edu.tt
set SENDGRID_FROM_NAME=COSTAATT HR Gateway

REM Start Backend API with proper environment variables
start "HR Backend" cmd /k "cd apps\api && node start-server-with-env.js"

REM Wait 5 seconds for backend to start
ping 127.0.0.1 -n 6 >nul

REM Start Frontend Web
start "HR Frontend" cmd /k "cd apps\web && npm run dev"

echo HR Gateway services started successfully!
echo Backend: http://10.2.1.27:3000
echo Frontend: http://10.2.1.27:5173
