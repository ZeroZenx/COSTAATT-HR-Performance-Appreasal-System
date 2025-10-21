module.exports = {
  apps: [
    {
      name: 'hr-backend',
      script: 'apps/api/src/simple-server.js',
      cwd: 'C:\\HR\\HR',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/hr-backend-error.log',
      out_file: 'logs/hr-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'hr-frontend',
      script: 'start-frontend.js',
      cwd: 'C:\\HR\\HR\\apps\\web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: 'C:\\HR\\HR\\logs\\hr-frontend-error.log',
      out_file: 'C:\\HR\\HR\\logs\\hr-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};

