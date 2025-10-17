const http = require('http');

function testChatbotWithOpenAI() {
  console.log('🤖 Testing chatbot OpenAI connection...');
  
  const postData = JSON.stringify({
    message: 'Hello, can you help me with HR questions?'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/chatbot/message',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDg2NDAwfQ.test',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log('📡 Response status:', res.statusCode);
    console.log('📋 Response headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('💬 Chatbot response:', data);
      
      // Check if we got a real response or error message
      try {
        const response = JSON.parse(data);
        if (response.reply && !response.reply.includes('Sorry, I encountered an error')) {
          console.log('✅ SUCCESS: Chatbot is connected to OpenAI!');
        } else {
          console.log('❌ FAILED: Chatbot still showing error message');
        }
      } catch (e) {
        console.log('❌ FAILED: Invalid response format');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing chatbot:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testChatbotWithOpenAI();
