const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function checkChatbotUser() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Get a real user from the database
    const user = await prisma.user.findFirst({
      where: { active: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        active: true
      }
    });
    
    if (!user) {
      console.log('❌ No active users found in database');
      return;
    }
    
    console.log('✅ Found user:', user);
    
    // Create a JWT token for this real user
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '1h' }
    );
    
    console.log('🔑 Generated token for user:', user.email);
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Test chatbot with real user
    const http = require('http');
    
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
    
    console.log('🤖 Testing chatbot with real user...');
    
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
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChatbotUser();
