const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUserLogins() {
  try {
    console.log('🔍 Checking user login credentials...\n');

    const usersToCheck = [
      'LJunkere@costaatt.edu.tt',
      'MStanisclaus@costaatt.edu.tt'
    ];

    for (const email of usersToCheck) {
      console.log(`\n📧 Checking: ${email}`);
      console.log('=' .repeat(50));

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
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
        console.log('❌ User not found!');
        continue;
      }

      console.log('✅ User found:');
      console.log(`   👤 Name: ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}`);
      console.log(`   🔐 Auth Provider: ${user.authProvider}`);
      console.log(`   🔑 Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);

      // Test password verification
      if (user.passwordHash) {
        const testPasswords = ['P@ssw0rd!', 'password123', 'P@ssword!'];
        let validPassword = null;

        console.log('\n🔐 Testing password verification...');
        for (const password of testPasswords) {
          const isValid = await bcrypt.compare(password, user.passwordHash);
          console.log(`   "${password}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
          if (isValid) validPassword = password;
        }

        if (!validPassword) {
          console.log('\n🔧 Resetting password to P@ssw0rd!...');
          const newPasswordHash = await bcrypt.hash('P@ssw0rd!', 10);
          
          await prisma.user.update({
            where: { email },
            data: { passwordHash: newPasswordHash }
          });
          
          console.log('✅ Password reset successful!');
          validPassword = 'P@ssw0rd!';
        }

        // Test authentication endpoint
        console.log('\n🧪 Testing authentication endpoint...');
        try {
          const response = await fetch('http://10.2.1.27:3000/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              password: validPassword
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Authentication successful!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Token: ${result.data.accessToken.substring(0, 50)}...`);
          } else {
            console.log('❌ Authentication failed!');
            console.log(`   Status: ${response.status}`);
            const error = await response.text();
            console.log(`   Error: ${error}`);
          }
        } catch (fetchError) {
          console.log('❌ Network error testing authentication:');
          console.log(`   Error: ${fetchError.message}`);
        }

        console.log('\n🔐 LOGIN CREDENTIALS:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${validPassword}`);
        console.log(`   URL: http://10.2.1.27:5173/login\n`);

      } else {
        console.log('❌ No password hash found!');
      }
    }

    // Show all admin users for reference
    console.log('\n📊 All HR Admin Users:');
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
    console.error('❌ Error checking user logins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserLogins();
