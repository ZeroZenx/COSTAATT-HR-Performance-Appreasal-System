// Set environment variables before requiring the server
process.env.DATABASE_URL = "mysql://root:@localhost:3306/costaatt_hr";
process.env.JWT_SECRET = "your-super-secret-jwt-key-change-in-production";
process.env.NODE_ENV = "development";
process.env.PORT = "3000";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "your-openai-api-key-here";

console.log('🔧 Environment variables set:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL);
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   PORT:', process.env.PORT);
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('');

// Now start the server
require('./src/simple-server.js');
