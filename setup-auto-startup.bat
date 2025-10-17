@echo off
echo Setting up HR Performance Gateway auto-startup...

REM Create a Windows Task Scheduler task to start the HR app on system startup
schtasks /create /tn "HR Performance Gateway" /tr "C:\HR\HR\start-hr-app.bat" /sc onstart /ru "SYSTEM" /f

if %errorlevel% equ 0 (
    echo ✅ Successfully created Windows startup task!
    echo The HR Performance Gateway will now start automatically when Windows boots.
    echo.
    echo To test: Restart your computer and the app should start automatically.
    echo To remove: Run 'schtasks /delete /tn "HR Performance Gateway" /f'
) else (
    echo ❌ Failed to create startup task. Please run as Administrator.
)

echo.
pause
