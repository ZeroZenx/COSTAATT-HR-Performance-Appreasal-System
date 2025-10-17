const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyAlvinelleLogin() {
  try {
    console.log('🔍 Verifying Alvinelle Matthew login credentials...\n');

    // Find Alvinelle's user record
    const user = await prisma.user.findUnique({
      where: { email: 'AMatthew@costaatt.edu.tt' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
        title: true,
        active: true,
        authProvider: true
      }
    });

    if (!user) {
      console.log('❌ User not found with email: AMatthew@costaatt.edu.tt');
      return;
    }

    console.log('✅ User found:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`   👤 Role: ${user.role}`);
    console.log(`   🏢 Title: ${user.title}`);
    console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}`);
    console.log(`   🔐 Auth Provider: ${user.authProvider}`);
    console.log(`   🔑 Has Password Hash: ${user.passwordHash ? 'Yes' : 'No'}\n`);

    // Test password verification
    const testPasswords = ['P@ssw0rd!', 'password123', 'P@ssword!'];
    
    console.log('🔐 Testing password verification...');
    for (const password of testPasswords) {
      if (user.passwordHash) {
        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log(`   "${password}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      }
    }

    // If no valid password found, reset it
    const validPassword = await bcrypt.compare('P@ssw0rd!', user.passwordHash);
    if (!validPassword) {
      console.log('\n🔧 Resetting password to P@ssw0rd!...');
      const newPasswordHash = await bcrypt.hash('P@ssw0rd!', 10);
      
      await prisma.user.update({
        where: { email: 'AMatthew@costaatt.edu.tt' },
        data: { passwordHash: newPasswordHash }
      });
      
      console.log('✅ Password reset successful!');
    }

    // Check if user has any associated employee record
    const employee = await prisma.employee.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        dept: true,
        division: true,
        employmentType: true
      }
    });

    if (employee) {
      console.log('\n👤 Employee record found:');
      console.log(`   🏢 Department: ${employee.dept}`);
      console.log(`   🏬 Division: ${employee.division}`);
      console.log(`   📋 Employment Type: ${employee.employmentType}`);
    } else {
      console.log('\n⚠️ No employee record found - creating one...');
      await prisma.employee.create({
        data: {
          userId: user.id,
          dept: 'Human Resources',
          division: 'Human Resources',
          employmentType: 'FULL_TIME'
        }
      });
      console.log('✅ Employee record created');
    }

    console.log('\n🔐 FINAL LOGIN CREDENTIALS:');
    console.log('   Email: AMatthew@costaatt.edu.tt');
    console.log('   Password: P@ssw0rd!');
    console.log('   URL: http://10.2.1.27:5173/login\n');

    // Test the authentication endpoint
    console.log('🧪 Testing authentication endpoint...');
    const authTest = await fetch('http://10.2.1.27:3000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'AMatthew@costaatt.edu.tt',
        password: 'P@ssw0rd!'
      })
    });

    if (authTest.ok) {
      const result = await authTest.json();
      console.log('✅ Authentication endpoint working!');
      console.log(`   Status: ${authTest.status}`);
      console.log(`   Response: ${JSON.stringify(result, null, 2)}`);
    } else {
      console.log('❌ Authentication endpoint failed!');
      console.log(`   Status: ${authTest.status}`);
      const error = await authTest.text();
      console.log(`   Error: ${error}`);
    }

  } catch (error) {
    console.error('❌ Error verifying login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAlvinelleLogin();
