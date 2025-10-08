# 🚀 COSTAATT HR Performance Gateway - Windows Installer Guide

## 📦 **QUICK START - Create Windows Installer**

### **Option 1: Simple Batch File (Recommended)**
```bash
# Double-click this file in Windows Explorer:
build-windows-installer.bat
```

### **Option 2: PowerShell Script (Advanced)**
```powershell
# Right-click and "Run with PowerShell":
.\build-windows-installer.ps1
```

### **Option 3: Manual Commands**
```bash
# Install desktop dependencies
cd apps/desktop
npm install

# Build web application
npm run build --workspace=@costaatt/web

# Build desktop application
npm run desktop:build

# Create Windows installer
npm run build-win
```

## 🎯 **WHAT YOU GET**

After building, you'll have a complete Windows installer:

**📁 Location**: `apps/desktop/dist/COSTAATT HR Performance Gateway Setup.exe`

**✨ Features**:
- ✅ **Complete HR System** - All 347+ staff members
- ✅ **All Appraisal Templates** - Executive, General Staff, Faculty, Dean, Clinical
- ✅ **Desktop Application** - Native Windows app with menus
- ✅ **Start Menu Integration** - Appears in Windows Start Menu
- ✅ **Desktop Shortcuts** - Quick access from desktop
- ✅ **Auto-Updates** - Automatic update checking
- ✅ **Offline Capable** - Works without internet
- ✅ **Native Notifications** - Windows system notifications
- ✅ **Keyboard Shortcuts** - Ctrl+N for new appraisal, etc.

## 🔧 **INSTALLER FEATURES**

### **Installation Process**
1. **Welcome Screen** - Professional installer interface
2. **License Agreement** - Standard software license
3. **Installation Directory** - Choose where to install
4. **Desktop Shortcut** - Optional desktop shortcut
5. **Start Menu** - Automatic Start Menu integration
6. **Installation Progress** - Visual progress bar
7. **Completion** - Launch application option

### **System Integration**
- **Program Files Installation** - Installs to `C:\Program Files\COSTAATT HR Performance Gateway\`
- **Start Menu Entry** - "COSTAATT HR Performance Gateway"
- **Desktop Shortcut** - Optional desktop icon
- **File Associations** - Can handle HR-related files
- **Uninstaller** - Proper Windows uninstall support
- **Auto-Updates** - Background update checking

## 🚀 **DEPLOYMENT OPTIONS**

### **Single Computer Installation**
1. Run the installer on target computer
2. Follow installation wizard
3. Launch application from Start Menu

### **Network Deployment**
1. Copy installer to network share
2. Deploy via Group Policy
3. Silent installation: `Setup.exe /S`

### **USB Distribution**
1. Copy installer to USB drive
2. Run on target computers
3. No internet required for installation

## 📋 **SYSTEM REQUIREMENTS**

### **Minimum Requirements**
- **OS**: Windows 10 (64-bit) or Windows 11
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Display**: 1024x768 resolution

### **Recommended Requirements**
- **OS**: Windows 11 (64-bit)
- **RAM**: 8 GB
- **Storage**: 2 GB free space
- **Display**: 1920x1080 resolution
- **Network**: For auto-updates and email features

## 🔐 **SECURITY FEATURES**

- ✅ **Code Signing Ready** - Can be signed with your certificate
- ✅ **Windows Defender Compatible** - No false positives
- ✅ **Secure Installation** - Validates file integrity
- ✅ **User Permissions** - Respects Windows security model
- ✅ **Data Protection** - Local data encryption support

## 📊 **WHAT'S INCLUDED**

### **Complete Application**
- **Frontend**: React-based user interface
- **Backend**: Node.js API server
- **Database**: SQLite (embedded) or PostgreSQL connection
- **Assets**: All images, icons, and resources

### **Staff Data**
- **347+ Staff Members** - Complete employee directory
- **Department Assignments** - Correct department mapping
- **Role Categories** - Executive, General Staff, Faculty, Dean, Clinical
- **Contact Information** - Email addresses and titles

### **Appraisal System**
- **5 Appraisal Templates** - Role-specific forms
- **Performance Cycles** - Flexible review periods
- **Competency Framework** - Performance standards
- **Scoring System** - Automated calculations

## 🛠️ **CUSTOMIZATION**

### **Branding**
Edit `apps/desktop/main.js` to customize:
- Application name and version
- Window title and icon
- Menu items and shortcuts
- About dialog content

### **Configuration**
Edit `apps/desktop/package.json` to modify:
- Installer settings
- File associations
- Auto-update behavior
- System integration

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues**

**❌ "Node.js not found"**
- Install Node.js 18+ from https://nodejs.org
- Restart command prompt
- Try running as administrator

**❌ "Build failed"**
- Check internet connection
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall

**❌ "Installer not created"**
- Check build logs for errors
- Ensure sufficient disk space
- Try running as administrator

### **Getting Help**
- **Email**: hr@costaatt.edu.tt
- **Technical Lead**: dheadley@costaatt.edu.tt
- **GitHub Issues**: https://github.com/ZeroZenx/costaatt-hr-performance/issues

## 🎉 **SUCCESS!**

Once built, you'll have a professional Windows installer that:
- ✅ Installs like any commercial software
- ✅ Integrates with Windows seamlessly
- ✅ Provides native desktop experience
- ✅ Includes all your HR data and features
- ✅ Supports auto-updates
- ✅ Works offline

**Your COSTAATT HR Performance Gateway is now ready for Windows deployment!** 🚀
