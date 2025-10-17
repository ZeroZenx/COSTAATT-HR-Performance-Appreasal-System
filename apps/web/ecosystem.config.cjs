module.exports = {
  apps: [
    {
      name: 'costaatt-hr-web',
      script: 'npm',
      args: 'run dev',
      cwd: 'C:\\HR\\HR\\apps\\web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: 'C:\\HR\\HR\\logs\\web-error.log',
      out_file: 'C:\\HR\\HR\\logs\\web-out.log',
      log_file: 'C:\\HR\\HR\\logs\\web-combined.log',
      time: true
    }
  ]
};

