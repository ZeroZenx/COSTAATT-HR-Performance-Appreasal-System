// Set environment variable
process.env.DATABASE_URL = "mysql://root:@localhost:3306/costaatt_hr";

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('🔗 Using DATABASE_URL:', process.env.DATABASE_URL);
  
  const prisma = new PrismaClient();
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test user query
    const user = await prisma.user.findFirst();
    console.log('✅ User query successful');
    
    // Test specific admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@costaatt.edu.tt' },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        passwordHash: true
      }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active,
        hasPassword: !!adminUser.passwordHash
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Test demo employee user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'mike.johnson@costaatt.edu.tt' },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
        passwordHash: true
      }
    });
    
    if (demoUser) {
      console.log('✅ Demo user found:', {
        email: demoUser.email,
        role: demoUser.role,
        active: demoUser.active,
        hasPassword: !!demoUser.passwordHash
      });
    } else {
      console.log('❌ Demo user not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
