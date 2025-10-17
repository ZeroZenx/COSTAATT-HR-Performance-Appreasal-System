const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'HR Performance Management System',
  description: 'COSTAATT HR Performance Management System API Server',
  script: 'C:\\HR\\HR\\apps\\api\\src\\simple-server.js',
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
  console.log('✅ HR Performance Management System installed as Windows Service');
  console.log('🔄 Starting service...');
  svc.start();
});

svc.on('start', function() {
  console.log('🚀 HR Performance Management System started successfully!');
  console.log('🌐 Access the system at: http://localhost:3000');
});

svc.on('error', function(err) {
  console.error('❌ Service error:', err);
});

console.log('📦 Installing HR Performance Management System as Windows Service...');
svc.install();
