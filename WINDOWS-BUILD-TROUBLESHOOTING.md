# 🔧 Windows Installer Build - Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: "npm run build --workspace=@costaatt/web" fails**

**Error**: `npm ERR! Could not resolve dependency`

**Solution**:
```powershell
# Install dependencies for all workspaces
npm install --workspace=@costaatt/web
npm install --workspace=@costaatt/api
npm install --workspace=@costaatt/desktop
```

### **Issue 2: "electron-builder: command not found"**

**Error**: `'electron-builder' is not recognized as an internal or external command`

**Solution**:
```powershell
# Install electron-builder globally
npm install -g electron-builder

# Or install locally in desktop workspace
cd apps\desktop
npm install electron-builder --save-dev
```

### **Issue 3: "NSIS not found"**

**Error**: `NSIS is not installed`

**Solution**:
```powershell
# Option 1: Install NSIS manually
# Download from: https://nsis.sourceforge.io/Download

# Option 2: Use chocolatey
choco install nsis

# Option 3: Use portable version
# Download NSIS portable and add to PATH
```

### **Issue 4: "Icon file not found"**

**Error**: `Icon file not found: assets/icon.ico`

**Solution**:
```powershell
# Create a simple icon file
# Option 1: Use online icon generator
# Option 2: Convert existing image to .ico
# Option 3: Remove icon requirement temporarily

# Edit apps\desktop\package.json and remove icon line:
# "icon": "assets/icon.ico",  # Remove this line
```

### **Issue 5: "Web build not found"**

**Error**: `Cannot find module '../web/dist'`

**Solution**:
```powershell
# Ensure web app is built first
npm run build --workspace=@costaatt/web

# Check if dist folder exists
dir apps\web\dist

# If not, build manually
cd apps\web
npm run build
cd ..\..
```

### **Issue 6: "Permission denied"**

**Error**: `Access is denied`

**Solution**:
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell -> "Run as Administrator"

# Or use elevated permissions
Start-Process powershell -Verb RunAs
```

## 🔧 **Step-by-Step Fix**

### **Step 1: Clean Environment**
```powershell
# Remove all node_modules and lock files
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\desktop\node_modules -ErrorAction SilentlyContinue
npm cache clean --force
```

### **Step 2: Install Dependencies**
```powershell
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspace=@costaatt/web
npm install --workspace=@costaatt/api
npm install --workspace=@costaatt/desktop
```

### **Step 3: Build Web App**
```powershell
# Build web application
npm run build --workspace=@costaatt/web

# Verify build exists
if (Test-Path "apps\web\dist") {
    Write-Host "✅ Web build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Web build failed" -ForegroundColor Red
    exit 1
}
```

### **Step 4: Build Desktop App**
```powershell
# Navigate to desktop directory
cd apps\desktop

# Install desktop dependencies
npm install

# Create assets directory
if (-not (Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets" -Force
}

# Build Windows installer
npm run build-win
```

## 🎯 **Minimal Working Solution**

If all else fails, use this minimal approach:

```powershell
# 1. Clean everything
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 2. Install dependencies
npm install

# 3. Build web app
cd apps\web
npm run build
cd ..

# 4. Build desktop app
cd desktop
npm install
npx electron-builder --win
```

## 📦 **Alternative: Manual Build**

If automated build fails, try manual approach:

```powershell
# 1. Build web app manually
cd apps\web
npm install
npm run build

# 2. Copy web build to desktop
cd ..\desktop
mkdir renderer
xcopy /E /I ..\web\dist renderer

# 3. Build desktop app
npm install
npx electron-builder --win
```

## 🚀 **Quick Fix Commands**

```powershell
# One-liner to fix most issues
npm cache clean --force && npm install && npm run build --workspace=@costaatt/web && cd apps\desktop && npm install && npm run build-win
```

## 📞 **Still Having Issues?**

If you're still encountering problems, please share:

1. **Full error message** from the build process
2. **Node.js version**: `node --version`
3. **npm version**: `npm --version`
4. **Operating system**: Windows version
5. **PowerShell version**: `$PSVersionTable.PSVersion`

This will help me provide more specific solutions! 🎯
