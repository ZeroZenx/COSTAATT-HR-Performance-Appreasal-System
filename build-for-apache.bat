@echo off
echo Building COSTAATT HR Performance Gateway for Apache...

REM Build the frontend for production
echo Building frontend...
cd apps\web
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

REM Copy built files to Apache htdocs
echo Copying files to Apache htdocs...
xcopy /E /Y dist\* C:\xampp\htdocs\costaatt-hr\
if %errorlevel% neq 0 (
    echo Failed to copy files to Apache!
    pause
    exit /b 1
)

echo.
echo ✅ Build complete!
echo.
echo Your HR application is now available at:
echo   http://localhost/costaatt-hr/
echo   http://10.2.1.27/costaatt-hr/
echo.
echo Note: You'll still need to run the backend API server on port 3000
echo.
pause
