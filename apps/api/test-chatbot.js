const http = require('http');

function testChatbot() {
  console.log('🤖 Testing chatbot endpoint...');
  
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
      'Authorization': 'Bearer test',
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

testChatbot();
