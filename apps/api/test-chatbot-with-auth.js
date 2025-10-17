const jwt = require('jsonwebtoken');
const http = require('http');

// Create a test JWT token
const token = jwt.sign(
  { sub: 'test-user-id', email: 'test@costaatt.edu.tt' },
  'your-super-secret-jwt-key-change-in-production',
  { expiresIn: '1h' }
);

function testChatbotWithAuth() {
  console.log('🤖 Testing chatbot endpoint with valid auth...');
  console.log('Token:', token.substring(0, 50) + '...');
  
  const postData = JSON.stringify({
    message: 'Hello, can you help me?'
  });
  
  const options = {
    hostname: '10.2.1.27',
    port: 3000,
    path: '/api/chatbot/message',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('Response status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
    });
  });
  
  req.on('error', (error) => {
    console.error('Error testing chatbot:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testChatbotWithAuth();
