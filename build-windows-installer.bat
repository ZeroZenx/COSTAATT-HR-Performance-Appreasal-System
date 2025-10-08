@echo off
echo ========================================
echo COSTAATT HR Performance Gateway
echo Windows Installer Builder
echo ========================================
echo.

echo [1/4] Installing desktop dependencies...
cd apps\desktop
call npm install
cd ..\..

echo.
echo [2/4] Building web application...
call npm run build --workspace=@costaatt/web

echo.
echo [3/4] Building desktop application...
call npm run desktop:build

echo.
echo [4/4] Creating Windows installer...
cd apps\desktop
call npm run build-win
cd ..\..

echo.
echo ========================================
echo ✅ BUILD COMPLETE!
echo ========================================
echo.
echo Your Windows installer is ready at:
echo apps\desktop\dist\COSTAATT HR Performance Gateway Setup.exe
echo.
echo This installer includes:
echo - Complete HR Performance Gateway
echo - All 347+ staff members
echo - All appraisal templates
echo - Desktop shortcuts
echo - Start Menu integration
echo - Auto-update capability
echo.
pause
