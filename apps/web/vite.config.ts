import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Listen on all network interfaces
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '10.2.1.27',
      'hrpmg.costaatt.edu.tt',
      '.costaatt.edu.tt' // Allow all subdomains
    ],
    cors: true, // Enable CORS for network access
    hmr: {
      clientPort: 5173 // Ensure HMR works with network access
    }
  }
})