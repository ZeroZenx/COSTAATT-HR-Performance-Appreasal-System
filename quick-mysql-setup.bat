@echo off
echo ========================================
echo COSTAATT HR - Quick MySQL Setup
echo ========================================
echo.

REM Stop existing Node.js processes
echo Stopping existing servers...
taskkill /f /im node.exe 2>nul

echo.
echo Setting up MySQL configuration...

REM Create .env file for MySQL
echo Creating MySQL environment configuration...
cd /d "%~dp0"

REM Backup existing .env if it exists
if exist "apps\api\.env" (
    copy "apps\api\.env" "apps\api\.env.backup"
    echo ✅ Backed up existing .env file
)

REM Create new .env for MySQL
echo # MySQL Database Configuration > apps\api\.env
echo DATABASE_URL="mysql://root:@localhost:3306/costaatt_hr" >> apps\api\.env
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

echo ✅ Environment file created for MySQL!

REM Install MySQL client
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

REM Try to create database (will work if MySQL is running)
echo.
echo Attempting to create MySQL database...
npx prisma db push

if %errorlevel% equ 0 (
    echo ✅ Database schema created in MySQL!
) else (
    echo ⚠️ Could not create database schema. Please ensure MySQL is running.
    echo.
    echo To start MySQL manually:
    echo 1. Open XAMPP Control Panel
    echo 2. Start MySQL service
    echo 3. Run: npx prisma db push
)

echo.
echo Starting application with MySQL configuration...
cd ..

REM Start backend server
echo Starting backend server...
start /B /MIN cmd /c "cd /d %~dp0apps\api && node src/simple-server.js"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting frontend server...
start /B /MIN cmd /c "cd /d %~dp0apps\web && npm run dev"

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo MySQL Setup Complete!
echo ========================================
echo.
echo Configuration:
echo   📊 Database: MySQL (costaatt_hr)
echo   🔗 Connection: mysql://root:@localhost:3306/costaatt_hr
echo.
echo Application URLs:
echo   🌐 Frontend: http://10.2.1.27:5173/
echo   🔧 Backend API: http://10.2.1.27:3000/
echo   📊 Dashboard: http://10.2.1.27:5173/dashboard
echo   ⚙️ Settings: http://10.2.1.27:5173/settings
echo.
echo Next steps:
echo 1. Ensure MySQL is running (via XAMPP or MySQL service)
echo 2. Run: npx prisma db push (to create database schema)
echo 3. Test the application
echo.
echo If you need to migrate existing data from PostgreSQL:
echo 1. Ensure PostgreSQL is still running
echo 2. Run: node migrate-data-to-mysql.js
echo.
pause
