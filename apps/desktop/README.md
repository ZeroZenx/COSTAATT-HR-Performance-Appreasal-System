# COSTAATT HR Performance Gateway - Desktop Application

This is the desktop version of the COSTAATT HR Performance Gateway, built with Electron.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Development
```bash
# Install dependencies
npm install

# Start development server (web app)
npm run dev --workspace=@costaatt/web

# In another terminal, start desktop app
npm start
```

### Building Installers

#### Windows Installer
```bash
# Build web app and create Windows installer
npm run build-desktop
npm run build-win
```

#### macOS Installer
```bash
# Build web app and create macOS installer
npm run build-desktop
npm run build-mac
```

#### Linux AppImage
```bash
# Build web app and create Linux AppImage
npm run build-desktop
npm run build-linux
```

## 📦 Output Files

After building, you'll find installers in the `dist/` directory:

- **Windows**: `COSTAATT HR Performance Gateway Setup.exe`
- **macOS**: `COSTAATT HR Performance Gateway.dmg`
- **Linux**: `COSTAATT HR Performance Gateway.AppImage`

## 🔧 Configuration

The desktop app automatically:
- ✅ Bundles the web application
- ✅ Includes all 347+ staff members
- ✅ Includes all appraisal templates
- ✅ Creates Windows Start Menu shortcuts
- ✅ Creates desktop shortcuts
- ✅ Handles auto-updates
- ✅ Provides native menus and keyboard shortcuts

## 🛠️ Customization

Edit `main.js` to customize:
- Window size and behavior
- Menu items
- Keyboard shortcuts
- Auto-update settings

## 📋 Features

- **Native Desktop Experience**: Full desktop application with native menus
- **Auto-Updates**: Automatic update checking and installation
- **Offline Capable**: Works without internet connection (with local database)
- **Native Notifications**: System notifications for appraisal events
- **Keyboard Shortcuts**: Native keyboard shortcuts (Ctrl+N for new appraisal)
- **File Associations**: Can handle HR-related file types
- **System Integration**: Proper Windows integration with Start Menu

## 🚀 Deployment

The generated installer will:
1. Install the application to Program Files
2. Create Start Menu shortcuts
3. Create desktop shortcuts
4. Register file associations
5. Set up auto-update checking
6. Configure Windows firewall (if needed)

## 🔐 Security

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Remote module disabled
- ✅ Secure preload script
- ✅ External link handling

## 📞 Support

For technical support:
- **Email**: hr@costaatt.edu.tt
- **Technical Lead**: dheadley@costaatt.edu.tt
