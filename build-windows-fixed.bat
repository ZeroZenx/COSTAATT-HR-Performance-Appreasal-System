@echo off
echo 🚀 Building COSTAATT HR Performance Gateway Windows Installer...

REM Navigate to project root
cd /d "%~dp0"

REM Clean everything
echo 🧹 Cleaning project...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm cache clean --force

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build web application
echo 🌐 Building web application...
npm run build --workspace=@costaatt/web

REM Check if web build exists
if not exist "apps\web\dist" (
    echo ❌ Web build failed. Please check the build output above.
    pause
    exit /b 1
)

REM Build desktop app
echo 🖥️ Building desktop application...
cd apps\desktop

REM Install desktop dependencies
npm install

REM Create assets directory if it doesn't exist
if not exist "assets" (
    mkdir assets
    echo 📁 Created assets directory. You may need to add icon files.
)

REM Build Windows installer
echo 🔨 Building Windows installer...
npm run build-win

echo ✅ Windows Installer build complete!
echo 📁 Installer location: apps\desktop\dist

REM List files in dist directory
if exist "dist" (
    echo 📦 Generated files:
    dir /b dist
)

pause
