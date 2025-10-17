const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixDemoAccounts() {
  try {
    console.log('🔧 Checking and fixing demo accounts...\n');

    const demoAccounts = [
      {
        email: 'john.doe@costaatt.edu.tt',
        firstName: 'John',
        lastName: 'Doe',
        role: 'SUPERVISOR',
        title: 'Supervisor',
        dept: 'Human Resources'
      },
      {
        email: 'mike.johnson@costaatt.edu.tt',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'EMPLOYEE',
        title: 'Employee',
        dept: 'Human Resources'
      }
    ];

    for (const account of demoAccounts) {
      console.log(`👤 Checking: ${account.firstName} ${account.lastName} (${account.role})`);
      console.log(`   📧 Email: ${account.email}`);

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: account.email },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          passwordHash: true,
          role: true,
          title: true,
          active: true
        }
      });

      if (!user) {
        console.log('   ❌ User not found - creating...');
        
        // Create user
        const passwordHash = await bcrypt.hash('password123', 10);
        
        user = await prisma.user.create({
          data: {
            email: account.email,
            passwordHash: passwordHash,
            firstName: account.firstName,
            lastName: account.lastName,
            role: account.role,
            dept: account.dept,
            title: account.title,
            authProvider: 'LOCAL',
            active: true
          }
        });

        // Create employee record
        await prisma.employee.create({
          data: {
            userId: user.id,
            dept: account.dept,
            division: account.dept,
            employmentType: 'FULL_TIME'
          }
        });

        console.log('   ✅ User created successfully');
      } else {
        console.log('   ✅ User found');
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.active ? 'Yes' : 'No'}`);
        console.log(`   Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);

        // Test password
        if (user.passwordHash) {
          const testPasswords = ['password123', 'P@ssw0rd!', 'P@ssword!'];
          let passwordWorks = false;
          
          for (const password of testPasswords) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (isValid) {
              console.log(`   🔐 Working password: "${password}"`);
              passwordWorks = true;
              break;
            }
          }

          if (!passwordWorks) {
            console.log('   🔧 Resetting password to password123...');
            const newPasswordHash = await bcrypt.hash('password123', 10);
            
            await prisma.user.update({
              where: { email: account.email },
              data: { passwordHash: newPasswordHash }
            });
            
            console.log('   ✅ Password reset successful');
          }
        } else {
          console.log('   🔧 Setting password to password123...');
          const passwordHash = await bcrypt.hash('password123', 10);
          
          await prisma.user.update({
            where: { email: account.email },
            data: { passwordHash: passwordHash }
          });
          
          console.log('   ✅ Password set successfully');
        }

        // Ensure user is active
        if (!user.active) {
          console.log('   🔧 Activating user...');
          await prisma.user.update({
            where: { email: account.email },
            data: { active: true }
          });
          console.log('   ✅ User activated');
        }
      }

      // Test authentication
      console.log('   🧪 Testing authentication...');
      try {
        const response = await fetch('http://10.2.1.27:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: account.email,
            password: 'password123'
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('   ✅ Authentication successful!');
          console.log(`   Token: ${result.data.accessToken.substring(0, 50)}...`);
          console.log(`   User: ${result.data.user.firstName} ${result.data.user.lastName}`);
        } else {
          const error = await response.text();
          console.log('   ❌ Authentication failed!');
          console.log(`   Status: ${response.status}`);
          console.log(`   Error: ${error}`);
        }
      } catch (fetchError) {
        console.log('   ❌ Network error:');
        console.log(`   Error: ${fetchError.message}`);
      }

      console.log(''); // Empty line for readability
    }

    console.log('🔐 DEMO ACCOUNT CREDENTIALS:');
    console.log('=' .repeat(50));
    console.log('Supervisor: john.doe@costaatt.edu.tt / password123');
    console.log('Employee: mike.johnson@costaatt.edu.tt / password123');
    console.log('URL: http://10.2.1.27:5173/login\n');

    // Show all demo users
    console.log('📊 ALL DEMO USERS:');
    const allDemoUsers = await prisma.user.findMany({
      where: { 
        email: { 
          in: ['john.doe@costaatt.edu.tt', 'mike.johnson@costaatt.edu.tt'] 
        } 
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true
      }
    });

    allDemoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error fixing demo accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoAccounts();
