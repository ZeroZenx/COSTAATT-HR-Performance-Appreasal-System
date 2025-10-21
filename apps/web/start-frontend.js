const { spawn } = require('child_process');
const path = require('path');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

vite.on('error', (error) => {
  console.error(`Error starting frontend: ${error.message}`);
  process.exit(1);
});

vite.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  process.exit(code);
});

// Handle termination
process.on('SIGTERM', () => {
  vite.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  vite.kill();
  process.exit(0);
});

