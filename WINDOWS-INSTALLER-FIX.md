# 🔧 Windows Installer Build - Complete Fix

## 🐛 **Issues Identified**

1. **Missing build dependencies** in desktop package.json
2. **Incorrect file paths** in build configuration
3. **Missing icon files** for Windows build
4. **Incomplete build process** for web app integration
5. **Missing NSIS dependencies** for Windows installer

## ✅ **Complete Solution**

### **Step 1: Fix Desktop Package.json**

Update `apps/desktop/package.json` with the correct configuration:

```json
{
  "name": "costaatt-hr-desktop",
  "version": "1.0.0",
  "description": "COSTAATT HR Performance Gateway - Desktop Application",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build-win": "electron-builder --win",
    "build-mac": "electron-builder --mac", 
    "build-linux": "electron-builder --linux",
    "dist": "npm run build",
    "pack": "electron-builder --dir",
    "postinstall": "electron-builder install-app-deps"
  },
  "build": {
    "appId": "com.costaatt.hr-performance",
    "productName": "COSTAATT HR Performance Gateway",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "preload.js",
      "package.json",
      {
        "from": "../web/dist",
        "to": "renderer",
        "filter": ["**/*"]
      }
    ],
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico",
      "requestedExecutionLevel": "asInvoker"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "COSTAATT HR Performance"
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.icns"
    },
    "linux": {
      "target": "AppImage", 
      "icon": "assets/icon.png"
    }
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4"
  },
  "dependencies": {
    "electron-updater": "^6.1.4"
  }
}
```

### **Step 2: Create Icon Assets**

Create the `apps/desktop/assets/` directory and add icon files:

```bash
# Create assets directory
mkdir -p apps/desktop/assets

# You'll need to create or obtain these icon files:
# - icon.ico (Windows)
# - icon.icns (macOS) 
# - icon.png (Linux)
```

### **Step 3: Fix Build Script**

Update `apps/desktop/build-desktop.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building COSTAATT HR Performance Gateway Desktop App...');

try {
  // Build the web app first
  console.log('📦 Building web application...');
  execSync('npm run build --workspace=@costaatt/web', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../..')
  });

  console.log('✅ Desktop app build complete!');
  console.log('📦 Run "npm run build-win" to create Windows installer');
  console.log('📦 Run "npm run build-mac" to create macOS installer');
  console.log('📦 Run "npm run build-linux" to create Linux installer');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
```

### **Step 4: Windows Build Commands**

Use these commands in PowerShell (Run as Administrator):

```powershell
# 1. Navigate to project root
cd "C:\Users\Administrator\Downloads\HR\HR"

# 2. Clean everything
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force

# 3. Install dependencies
npm install

# 4. Build web application
npm run build --workspace=@costaatt/web

# 5. Build desktop app
cd apps\desktop
npm install
npm run build-win
```

### **Step 5: Alternative - Use Root Package Scripts**

If the above doesn't work, use the root package.json scripts:

```powershell
# From project root
npm run desktop:build
npm run desktop:win
```

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Missing NSIS**
```powershell
# Install NSIS manually
# Download from: https://nsis.sourceforge.io/Download
# Or use chocolatey:
choco install nsis
```

### **Issue 2: Electron Version Conflicts**
```powershell
# Force specific electron version
npm install electron@27.0.0 --save-dev --workspace=@costaatt/desktop
```

### **Issue 3: Missing Dependencies**
```powershell
# Install all dependencies
npm install --workspace=@costaatt/web
npm install --workspace=@costaatt/api  
npm install --workspace=@costaatt/desktop
```

### **Issue 4: Build Path Issues**
```powershell
# Ensure web app is built first
npm run build --workspace=@costaatt/web

# Check if dist folder exists
ls apps\web\dist
```

## 📦 **Complete Windows Build Script**

Create `build-windows-complete.ps1`:

```powershell
Write-Host "🚀 Building COSTAATT HR Performance Gateway Windows Installer..." -ForegroundColor Green

# Navigate to project root
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Clean everything
Write-Host "🧹 Cleaning project..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build web application
Write-Host "🌐 Building web application..." -ForegroundColor Yellow
npm run build --workspace=@costaatt/web

# Build desktop app
Write-Host "🖥️ Building desktop application..." -ForegroundColor Yellow
cd apps\desktop
npm install
npm run build-win

Write-Host "✅ Windows Installer build complete!" -ForegroundColor Green
Write-Host "📁 Installer location: apps\desktop\dist" -ForegroundColor Cyan
```

## 🎯 **Expected Results**

After successful build, you should find:
- **Windows Installer**: `apps/desktop/dist/COSTAATT HR Performance Gateway Setup.exe`
- **Portable Version**: `apps/desktop/dist/win-unpacked/` (folder with executable)

## 🚀 **Quick Fix Commands**

If you're still having issues, try this minimal approach:

```powershell
# Minimal build approach
cd "C:\Users\Administrator\Downloads\HR\HR"
npm install
npm run build --workspace=@costaatt/web
cd apps\desktop
npm install
npx electron-builder --win
```

This should resolve all the Windows installer build issues! 🎉
