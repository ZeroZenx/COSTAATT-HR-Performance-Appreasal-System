@echo off
echo ========================================
echo COSTAATT HR - Apache Integration Setup
echo ========================================
echo.

REM Check if Apache is installed
echo Checking for Apache installation...
if exist "C:\xampp\apache\bin\httpd.exe" (
    set APACHE_PATH=C:\xampp\apache
    set APACHE_CONF=%APACHE_PATH%\conf\extra\
    echo ✅ Found XAMPP Apache at: %APACHE_PATH%
) else if exist "C:\Apache24\bin\httpd.exe" (
    set APACHE_PATH=C:\Apache24
    set APACHE_CONF=%APACHE_PATH%\conf\extra\
    echo ✅ Found Apache at: %APACHE_PATH%
) else (
    echo ❌ Apache not found! Please install XAMPP or Apache first.
    echo Download XAMPP from: https://www.apachefriends.org/
    pause
    exit /b 1
)

echo.
echo Choose your integration method:
echo 1. Apache Reverse Proxy (Recommended)
echo 2. Static Build for Apache
echo 3. Windows Service + Apache
echo 4. PM2 Process Manager + Apache
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto reverse_proxy
if "%choice%"=="2" goto static_build
if "%choice%"=="3" goto windows_service
if "%choice%"=="4" goto pm2_setup
goto invalid_choice

:reverse_proxy
echo.
echo Setting up Apache Reverse Proxy...
echo.

REM Copy Apache configuration
echo Copying Apache configuration...
copy "costaatt-hr.conf" "%APACHE_CONF%costaatt-hr.conf"

REM Add include to httpd.conf
echo Adding configuration to Apache...
findstr /C:"Include conf/extra/costaatt-hr.conf" "%APACHE_PATH%\conf\httpd.conf" >nul
if %errorlevel% neq 0 (
    echo Include conf/extra/costaatt-hr.conf >> "%APACHE_PATH%\conf\httpd.conf"
    echo ✅ Configuration added to httpd.conf
) else (
    echo ✅ Configuration already exists in httpd.conf
)

REM Enable required modules
echo Enabling required Apache modules...
findstr /C:"LoadModule proxy_module" "%APACHE_PATH%\conf\httpd.conf" >nul
if %errorlevel% neq 0 (
    echo LoadModule proxy_module modules/mod_proxy.so >> "%APACHE_PATH%\conf\httpd.conf"
    echo LoadModule proxy_http_module modules/mod_proxy_http.so >> "%APACHE_PATH%\conf\httpd.conf"
    echo ✅ Proxy modules enabled
)

echo.
echo ✅ Apache Reverse Proxy setup complete!
echo.
echo Your HR application will be accessible at:
echo   http://localhost/costaatt-hr/
echo   http://10.2.1.27/costaatt-hr/
echo.
echo Start your Node.js servers with: npm run dev
echo Then restart Apache to apply changes.
goto end

:static_build
echo.
echo Building static files for Apache...
call build-for-apache.bat
goto end

:windows_service
echo.
echo Setting up Windows Service...
call install-hr-service.bat
goto end

:pm2_setup
echo.
echo Setting up PM2 Process Manager...
echo Installing PM2...
npm install -g pm2
echo.
echo Starting applications with PM2...
pm2 start ecosystem.config.js
pm2 save
pm2 startup
echo.
echo ✅ PM2 setup complete!
echo Your applications are now managed by PM2 and will auto-restart.
goto end

:invalid_choice
echo Invalid choice! Please run the script again.
pause
exit /b 1

:end
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart Apache
echo 2. Start your Node.js servers (if using reverse proxy)
echo 3. Access your application through Apache
echo.
pause
