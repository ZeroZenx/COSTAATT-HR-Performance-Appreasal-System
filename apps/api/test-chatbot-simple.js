const http = require('http');

function testChatbotSimple() {
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
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbWdpeWl5dW0wMDAwMTI3aXlxOXdsbm1jIiwiZW1haWwiOiJhZG1pbkBjb3N0YWF0dC5lZHUudHQiLCJpYXQiOjE3MzkyNzE3MzcsImV4cCI6MTczOTI3NTMzN30.6KJhZQ8mY9vX2nLpR3sT1uW4xE7yA0bC5dF8gH2jM6nP9qS3vY7zB1eG4hK8mN0pR6tU9wX2zA5cF8iL1oQ4sV7yB0eH3kM6nP9rT2uW5xZ8',
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
      
      try {
        const response = JSON.parse(data);
        if (response.success) {
          console.log('✅ Chatbot is working!');
          console.log('🤖 Reply:', response.reply);
        } else {
          console.log('❌ Chatbot error:', response.message);
        }
      } catch (e) {
        console.log('❌ Failed to parse response');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error testing chatbot:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testChatbotSimple();
