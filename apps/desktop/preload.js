const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu actions
  onMenuNewAppraisal: (callback) => {
    ipcRenderer.on('menu-new-appraisal', callback);
  },

  // Platform info
  platform: process.platform,
  
  // App info
  appVersion: process.env.npm_package_version || '1.0.0',
  
  // Security: Only expose what's needed
  isElectron: true
});
