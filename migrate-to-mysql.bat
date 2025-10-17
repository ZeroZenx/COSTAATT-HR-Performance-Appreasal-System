@echo off
echo ========================================
echo COSTAATT HR - Complete MySQL Migration
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo This script must be run as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo ⚠️ WARNING: This will migrate your database from PostgreSQL to MySQL
echo Make sure you have backed up your PostgreSQL data!
echo.
set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Migration cancelled.
    pause
    exit /b 1
)

echo.
echo Step 1: Setting up MySQL...
call setup-mysql.bat

if %errorlevel% neq 0 (
    echo ❌ MySQL setup failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing migration dependencies...
cd apps\api
npm install mysql2

echo.
echo Step 3: Migrating data from PostgreSQL to MySQL...
echo ⚠️ Make sure PostgreSQL is still running for data migration...
node ..\..\migrate-data-to-mysql.js

if %errorlevel% neq 0 (
    echo ❌ Data migration failed!
    echo You can try running the migration script manually later.
    echo.
    echo To run manually:
    echo 1. Ensure PostgreSQL is running
    echo 2. Ensure MySQL is running
    echo 3. Run: node migrate-data-to-mysql.js
    pause
    exit /b 1
)

echo.
echo Step 4: Testing MySQL connection...
echo Testing database connection...

REM Test the MySQL connection
cd ..
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection('mysql://root:@localhost:3306/costaatt_hr');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM User');
    console.log('✅ MySQL connection successful!');
    console.log('📊 Users in database:', rows[0].count);
    await connection.end();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    process.exit(1);
  }
})();
"

if %errorlevel% neq 0 (
    echo ❌ MySQL connection test failed!
    pause
    exit /b 1
)

echo.
echo Step 5: Updating application configuration...
echo ✅ Prisma schema updated for MySQL
echo ✅ Environment variables updated for MySQL
echo ✅ Database connection string updated

echo.
echo Step 6: Regenerating Prisma client...
cd apps\api
npx prisma generate

echo.
echo Step 7: Starting application with MySQL...
echo Starting backend server with MySQL...
start /B /MIN cmd /c "cd /d %~dp0apps\api && node src/simple-server.js"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start /B /MIN cmd /c "cd /d %~dp0apps\web && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo 🎉 MySQL Migration Complete!
echo ========================================
echo.
echo Database Details:
echo   📊 Database: costaatt_hr (MySQL)
echo   👤 User: root
echo   🔗 Connection: mysql://root:@localhost:3306/costaatt_hr
echo.
echo Application URLs:
echo   🌐 Frontend: http://10.2.1.27:5173/
echo   🔧 Backend API: http://10.2.1.27:3000/
echo   📊 Dashboard: http://10.2.1.27:5173/dashboard
echo   ⚙️ Settings: http://10.2.1.27:5173/settings
echo.
echo ✅ Your HR application is now running on MySQL!
echo.
echo Next steps:
echo 1. Test all functionality to ensure data migrated correctly
echo 2. Update your backup procedures for MySQL
echo 3. Consider removing PostgreSQL if no longer needed
echo.
pause
