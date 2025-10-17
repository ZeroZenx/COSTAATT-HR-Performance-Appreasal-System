@echo off
echo Installing HR Performance Management System as Windows Service...

REM Create the scheduled task
schtasks /create /tn "HR Performance Management" /tr "C:\HR\HR\apps\api\start-hr-server.bat" /sc onstart /ru "SYSTEM" /f

echo.
echo ✅ HR Performance Management System will now start automatically with Windows
echo.
echo To manage the service:
echo   - View: Task Scheduler → Task Scheduler Library → HR Performance Management
echo   - Run manually: schtasks /run /tn "HR Performance Management"
echo   - Delete: schtasks /delete /tn "HR Performance Management" /f
echo.
pause
