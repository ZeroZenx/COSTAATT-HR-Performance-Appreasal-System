// PM2 Configuration for Multiple Apps
// This file makes it easy to manage multiple applications on the same server

module.exports = {
  apps: [
    // ===================================
    // HR PERFORMANCE MANAGEMENT SYSTEM
    // ===================================
    {
      name: 'hr-backend',
      script: 'apps/api/src/simple-server.js',
      cwd: 'C:\\HR\\HR',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'mysql://root:@localhost:3306/costaatt_hr',
        JWT_SECRET: 'your-super-secret-jwt-key-change-in-production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/hr-backend-error.log',
      out_file: './logs/hr-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'hr-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: 'C:\\HR\\HR\\apps\\web',
      env: {
        NODE_ENV: 'development',
        PORT: 5173
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/hr-frontend-error.log',
      out_file: './logs/hr-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },

    // ===================================
    // NEW APP TEMPLATE (Uncomment and configure when ready)
    // ===================================
    /*
    {
      name: 'newapp-backend',
      script: 'server.js',  // Path to your new app's server file
      cwd: 'C:\\Path\\To\\NewApp\\backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,  // Different port from HR app
        DATABASE_URL: 'mysql://root:@localhost:3306/newapp_db',  // Different database
        JWT_SECRET: 'different-secret-for-new-app'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/newapp-backend-error.log',
      out_file: './logs/newapp-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'newapp-frontend',
      script: 'npm',
      args: 'run dev',
      cwd: 'C:\\Path\\To\\NewApp\\frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 5174  // Different port from HR app
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/newapp-frontend-error.log',
      out_file: './logs/newapp-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
    */
  ]
};

/*
USAGE:

1. Install PM2 globally:
   npm install -g pm2

2. Start all apps defined in this config:
   pm2 start pm2-multi-app.config.js

3. View all running apps:
   pm2 list

4. View logs for specific app:
   pm2 logs hr-backend
   pm2 logs newapp-backend

5. Restart an app:
   pm2 restart hr-backend

6. Stop an app:
   pm2 stop newapp-frontend

7. Delete an app from PM2:
   pm2 delete newapp-backend

8. Save configuration (persist across reboots):
   pm2 save

9. Setup auto-start on system boot:
   pm2 startup

10. Monitor apps in real-time:
    pm2 monit

ADDING A NEW APP:

1. Uncomment the "NEW APP TEMPLATE" section above
2. Update the following values:
   - name: Unique name for your app
   - script: Path to your server file
   - cwd: Working directory for your app
   - PORT: Unique port number (e.g., 3001, 3002, 5174, 5175)
   - DATABASE_URL: Separate database for the new app
   
3. Save this file

4. Reload PM2 with the new configuration:
   pm2 delete newapp-backend newapp-frontend  (if previously existed)
   pm2 start pm2-multi-app.config.js

5. Save the new configuration:
   pm2 save

TIPS:

- Each app should have its own unique PORT
- Each app should have its own DATABASE
- Use PM2 logs to debug issues: pm2 logs [app-name]
- Memory limit can be adjusted with max_memory_restart
- Set watch: true during development to auto-reload on file changes
- Use instances: 'max' for production load balancing (cluster mode)

COMMON PORTS USED:
- 3000: HR Backend (API)
- 5173: HR Frontend (Vite)
- 3306: MySQL Database
- 3001: (Available for new app backend)
- 5174: (Available for new app frontend)
- 3002: (Available for another app backend)
- 5175: (Available for another app frontend)
*/

