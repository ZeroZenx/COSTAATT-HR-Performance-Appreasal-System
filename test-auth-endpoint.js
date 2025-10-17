const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuthEndpoint() {
  try {
    console.log('🧪 Testing authentication endpoint...\n');

    // First, verify the user exists
    const user = await prisma.user.findUnique({
      where: { email: 'AMatthew@costaatt.edu.tt' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        passwordHash: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User verified in database:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`   👤 Role: ${user.role}`);
    console.log(`   ✅ Active: ${user.active}`);
    console.log(`   🔑 Has Password: ${user.passwordHash ? 'Yes' : 'No'}\n`);

    // Test the authentication endpoint
    console.log('🌐 Testing authentication endpoint...');
    
    try {
      const response = await fetch('http://10.2.1.27:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'AMatthew@costaatt.edu.tt',
          password: 'P@ssw0rd!'
        })
      });

      console.log(`📊 Response Status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Authentication successful!');
        console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
      } else {
        const error = await response.text();
        console.log('❌ Authentication failed!');
        console.log(`   Error: ${error}`);
      }

    } catch (fetchError) {
      console.log('❌ Network error testing authentication:');
      console.log(`   Error: ${fetchError.message}`);
      console.log('   This might indicate the backend server is not running or not accessible.');
    }

    console.log('\n🔐 LOGIN INSTRUCTIONS:');
    console.log('1. Go to: http://10.2.1.27:5173/login');
    console.log('2. Email: AMatthew@costaatt.edu.tt');
    console.log('3. Password: P@ssw0rd!');
    console.log('4. Click Sign In\n');

    // Show all admin users for reference
    console.log('📊 All Admin Users:');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'HR_ADMIN' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true
      },
      orderBy: { firstName: 'asc' }
    });

    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
    });

  } catch (error) {
    console.error('❌ Error testing authentication:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthEndpoint();
