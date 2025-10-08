const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building COSTAATT HR Performance Gateway Desktop App...');

// Build the web app first
console.log('📦 Building web application...');
execSync('npm run build --workspace=@costaatt/web', { stdio: 'inherit' });

// Copy built files to desktop app
console.log('📁 Copying web build to desktop app...');
const webDistPath = path.join(__dirname, '../web/dist');
const desktopRendererPath = path.join(__dirname, 'renderer');

// Create renderer directory if it doesn't exist
if (!fs.existsSync(desktopRendererPath)) {
  fs.mkdirSync(desktopRendererPath, { recursive: true });
}

// Copy all files from web dist to desktop renderer
execSync(`cp -r ${webDistPath}/* ${desktopRendererPath}/`, { stdio: 'inherit' });

console.log('✅ Desktop app build complete!');
console.log('📦 Run "npm run build-win" to create Windows installer');
console.log('📦 Run "npm run build-mac" to create macOS installer');
console.log('📦 Run "npm run build-linux" to create Linux installer');
