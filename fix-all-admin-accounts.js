const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixAllAdminAccounts() {
  try {
    console.log('🔧 Checking and fixing all Admin and Final Approver accounts...\n');

    // Find all admin and final approver users
    const adminUsers = await prisma.user.findMany({
      where: { 
        role: { 
          in: ['HR_ADMIN', 'FINAL_APPROVER'] 
        } 
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
        title: true,
        active: true
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' }
      ]
    });

    console.log(`📊 Found ${adminUsers.length} Admin/Final Approver users:\n`);

    const standardPassword = 'P@ssw0rd!';
    const fixedUsers = [];
    const workingUsers = [];

    for (const user of adminUsers) {
      console.log(`👤 ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}`);
      console.log(`   🔑 Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);

      if (!user.active) {
        console.log('   ⚠️  User is inactive - activating...');
        await prisma.user.update({
          where: { email: user.email },
          data: { active: true }
        });
        console.log('   ✅ User activated');
      }

      // Test current password
      let passwordWorks = false;
      if (user.passwordHash) {
        const testPasswords = ['P@ssw0rd!', 'password123', 'P@ssword!'];
        
        for (const password of testPasswords) {
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (isValid) {
            passwordWorks = true;
            console.log(`   🔐 Password works: "${password}"`);
            break;
          }
        }
      }

      if (!passwordWorks) {
        console.log(`   🔧 Resetting password to "${standardPassword}"...`);
        const newPasswordHash = await bcrypt.hash(standardPassword, 10);
        
        await prisma.user.update({
          where: { email: user.email },
          data: { passwordHash: newPasswordHash }
        });
        
        console.log('   ✅ Password reset successful');
        fixedUsers.push({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          password: standardPassword
        });
      } else {
        // Determine which password works
        let workingPassword = '';
        if (user.passwordHash) {
          const testPasswords = ['P@ssw0rd!', 'password123', 'P@ssword!'];
          for (const password of testPasswords) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (isValid) {
              workingPassword = password;
              break;
            }
          }
        }
        
        workingUsers.push({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          password: workingPassword
        });
        console.log(`   ✅ Password already works: "${workingPassword}"`);
      }

      // Test authentication endpoint
      console.log('   🧪 Testing authentication...');
      try {
        const testPassword = fixedUsers.find(u => u.email === user.email)?.password || 
                           workingUsers.find(u => u.email === user.email)?.password;
        
        const response = await fetch('http://10.2.1.27:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: testPassword
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('   ✅ Authentication test successful');
        } else {
          console.log(`   ❌ Authentication test failed: ${response.status}`);
        }
      } catch (fetchError) {
        console.log('   ❌ Authentication test error:', fetchError.message);
      }

      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('📋 SUMMARY REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Admin/Final Approver Users: ${adminUsers.length}`);
    console.log(`Users Fixed: ${fixedUsers.length}`);
    console.log(`Users Already Working: ${workingUsers.length}\n`);

    if (fixedUsers.length > 0) {
      console.log('🔧 FIXED USERS (Password reset to P@ssw0rd!):');
      fixedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.role})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}\n`);
      });
    }

    console.log('✅ WORKING USERS:');
    workingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}\n`);
    });

    // Test a few key accounts
    console.log('🧪 TESTING KEY ACCOUNTS:');
    const testAccounts = [
      { email: 'MStanisclaus@costaatt.edu.tt', name: 'Marcia Stanisclaus' },
      { email: 'LJunkere@costaatt.edu.tt', name: 'Liselle Junkere' },
      { email: 'AMatthew@costaatt.edu.tt', name: 'Alvinelle Matthew' }
    ];

    for (const account of testAccounts) {
      const user = adminUsers.find(u => u.email === account.email);
      if (user) {
        const password = fixedUsers.find(u => u.email === account.email)?.password || 
                        workingUsers.find(u => u.email === account.email)?.password;
        
        if (password) {
          console.log(`✅ ${account.name}: ${account.email} / ${password}`);
        }
      }
    }

    console.log('\n🔐 LOGIN INSTRUCTIONS:');
    console.log('1. Go to: http://10.2.1.27:5173/login');
    console.log('2. Use the credentials listed above');
    console.log('3. All accounts should now work properly\n');

  } catch (error) {
    console.error('❌ Error fixing admin accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllAdminAccounts();
