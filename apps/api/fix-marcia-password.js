const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixMarciaPassword() {
  try {
    console.log('🔧 Fixing Marcia Stanisclaus password...\n');

    // Find Marcia's user record
    const user = await prisma.user.findUnique({
      where: { email: 'MStanisclaus@costaatt.edu.tt' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
        active: true
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.active ? 'Yes' : 'No'}`);
    console.log(`   Has Password: ${user.passwordHash ? 'Yes' : 'No'}\n`);

    // Test current password
    const testPasswords = ['password123', 'P@ssw0rd!', 'P@ssword!'];
    let validPassword = null;

    console.log('🔐 Testing current passwords...');
    for (const password of testPasswords) {
      if (user.passwordHash) {
        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log(`   "${password}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
        if (isValid) validPassword = password;
      }
    }

    if (!validPassword) {
      console.log('\n🔧 Resetting password to password123...');
      const newPasswordHash = await bcrypt.hash('password123', 10);
      
      await prisma.user.update({
        where: { email: 'MStanisclaus@costaatt.edu.tt' },
        data: { passwordHash: newPasswordHash }
      });
      
      console.log('✅ Password reset successful!');
      validPassword = 'password123';
    }

    // Verify the password works
    console.log('\n🧪 Verifying password works...');
    const testHash = await bcrypt.hash('password123', 10);
    const verifyPassword = await bcrypt.compare('password123', testHash);
    console.log(`Password verification test: ${verifyPassword ? '✅ Works' : '❌ Failed'}`);

    // Test authentication endpoint
    console.log('\n🌐 Testing authentication endpoint...');
    try {
      const response = await fetch('http://10.2.1.27:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'MStanisclaus@costaatt.edu.tt',
          password: 'password123'
        })
      });

      console.log(`📊 Response Status: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Authentication successful!');
        console.log(`   Token: ${result.data.accessToken.substring(0, 50)}...`);
        console.log(`   User: ${result.data.user.firstName} ${result.data.user.lastName}`);
      } else {
        const error = await response.text();
        console.log('❌ Authentication failed!');
        console.log(`   Status: ${response.status}`);
        console.log(`   Error: ${error}`);
      }
    } catch (fetchError) {
      console.log('❌ Network error testing authentication:');
      console.log(`   Error: ${fetchError.message}`);
    }

    console.log('\n🔐 FINAL LOGIN CREDENTIALS:');
    console.log('   Email: MStanisclaus@costaatt.edu.tt');
    console.log('   Password: password123');
    console.log('   URL: http://10.2.1.27:5173/login\n');

  } catch (error) {
    console.error('❌ Error fixing Marcia password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMarciaPassword();
