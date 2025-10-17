@echo off
echo ========================================
echo COSTAATT HR - MySQL Database Setup
echo ========================================
echo.

REM Check if MySQL is installed
echo Checking for MySQL installation...
if exist "C:\xampp\mysql\bin\mysql.exe" (
    set MYSQL_PATH=C:\xampp\mysql
    set MYSQL_BIN=%MYSQL_PATH%\bin
    echo ✅ Found XAMPP MySQL at: %MYSQL_PATH%
) else if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
    set MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0
    set MYSQL_BIN=%MYSQL_PATH%\bin
    echo ✅ Found MySQL at: %MYSQL_PATH%
) else (
    echo ❌ MySQL not found! Please install MySQL or XAMPP first.
    echo Download XAMPP from: https://www.apachefriends.org/
    pause
    exit /b 1
)

echo.
echo Creating MySQL database and user...

REM Create the database
echo Creating database 'costaatt_hr'...
"%MYSQL_BIN%\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS costaatt_hr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo ❌ Failed to create database. Please check MySQL is running and root password is correct.
    echo Try: mysql -u root -p
    pause
    exit /b 1
)

echo ✅ Database 'costaatt_hr' created successfully!

REM Create a dedicated user (optional)
echo.
echo Creating dedicated user 'costaatt_user'...
"%MYSQL_BIN%\mysql.exe" -u root -e "CREATE USER IF NOT EXISTS 'costaatt_user'@'localhost' IDENTIFIED BY 'costaatt_password';"
"%MYSQL_BIN%\mysql.exe" -u root -e "GRANT ALL PRIVILEGES ON costaatt_hr.* TO 'costaatt_user'@'localhost';"
"%MYSQL_BIN%\mysql.exe" -u root -e "FLUSH PRIVILEGES;"

echo ✅ User 'costaatt_user' created successfully!

REM Update .env file
echo.
echo Updating environment configuration...
cd /d "%~dp0"

REM Create .env file for MySQL
echo # MySQL Database Configuration > apps\api\.env
echo DATABASE_URL="mysql://root:@localhost:3306/costaatt_hr" >> apps\api\.env
echo. >> apps\api\.env
echo # Alternative with dedicated user: >> apps\api\.env
echo # DATABASE_URL="mysql://costaatt_user:costaatt_password@localhost:3306/costaatt_hr" >> apps\api\.env
echo. >> apps\api\.env
echo # JWT Configuration >> apps\api\.env
echo JWT_SECRET="your-super-secret-jwt-key-change-in-production" >> apps\api\.env
echo JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production" >> apps\api\.env
echo. >> apps\api\.env
echo # Session Configuration >> apps\api\.env
echo SESSION_SECRET="your-session-secret-key" >> apps\api\.env
echo. >> apps\api\.env
echo # Microsoft OAuth Configuration (Optional) >> apps\api\.env
echo MICROSOFT_CLIENT_ID="your-microsoft-client-id" >> apps\api\.env
echo MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret" >> apps\api\.env
echo MICROSOFT_TENANT_ID="your-tenant-id" >> apps\api\.env
echo. >> apps\api\.env
echo # Email Configuration (Optional) >> apps\api\.env
echo EMAIL_ENABLED=false >> apps\api\.env
echo SMTP_HOST="smtp.gmail.com" >> apps\api\.env
echo SMTP_PORT=587 >> apps\api\.env
echo SMTP_USER="noreply@costaatt.edu.tt" >> apps\api\.env
echo SMTP_PASSWORD="your-email-password" >> apps\api\.env
echo FROM_EMAIL="noreply@costaatt.edu.tt" >> apps\api\.env
echo FROM_NAME="COSTAATT HR System" >> apps\api\.env
echo. >> apps\api\.env
echo # App Configuration >> apps\api\.env
echo NODE_ENV="development" >> apps\api\.env
echo PORT=3000 >> apps\api\.env
echo. >> apps\api\.env
echo # SSO Configuration >> apps\api\.env
echo SSO_ENABLED=true >> apps\api\.env

echo ✅ Environment file updated for MySQL!

REM Install MySQL client for Node.js
echo.
echo Installing MySQL client for Node.js...
cd apps\api
npm install mysql2

echo ✅ MySQL client installed!

REM Generate Prisma client for MySQL
echo.
echo Generating Prisma client for MySQL...
npx prisma generate

echo ✅ Prisma client generated for MySQL!

REM Run database migrations
echo.
echo Running database migrations...
npx prisma db push

echo ✅ Database schema created in MySQL!

echo.
echo ========================================
echo MySQL Setup Complete!
echo ========================================
echo.
echo Database Details:
echo   📊 Database: costaatt_hr
echo   👤 User: root (or costaatt_user)
echo   🔗 Connection: mysql://root:@localhost:3306/costaatt_hr
echo.
echo Next steps:
echo 1. Run the data migration script to transfer existing data
echo 2. Test the application with MySQL
echo.
pause
