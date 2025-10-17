const http = require('http');

function testLogin() {
  console.log('🔐 Testing login endpoint...');
  
  const postData = JSON.stringify({
    email: 'admin@costaatt.edu.tt',
    password: 'password'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('📡 Response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('🔑 Login response:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: Login endpoint is working!');
      } else {
        console.log('❌ FAILED: Login endpoint returned error');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing login:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testLogin();
