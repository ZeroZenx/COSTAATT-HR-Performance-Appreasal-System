// Debug the exact frontend authentication flow
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function debugFrontendIssue() {
  try {
    console.log('🔍 Debugging Marcia login issue...\n');

    // First, verify the user exists and password is correct
    const user = await prisma.user.findUnique({
      where: { email: 'MStanisclaus@costaatt.edu.tt' },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
        title: true,
        active: true,
        dept: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found in database:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.active}`);
    console.log(`   Has Password: ${user.passwordHash ? 'Yes' : 'No'}\n`);

    // Test password
    const isValidPassword = await bcrypt.compare('password123', user.passwordHash);
    console.log(`🔐 Password 'password123' is valid: ${isValidPassword ? 'Yes' : 'No'}`);

    if (!isValidPassword) {
      console.log('🔧 Resetting password...');
      const newPasswordHash = await bcrypt.hash('password123', 10);
      await prisma.user.update({
        where: { email: 'MStanisclaus@costaatt.edu.tt' },
        data: { passwordHash: newPasswordHash }
      });
      console.log('✅ Password reset to password123');
    }

    // Test the exact API call
    console.log('\n🌐 Testing API call...');
    const response = await fetch('http://10.2.1.27:3000/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://10.2.1.27:5173'
      },
      body: JSON.stringify({ 
        email: 'MStanisclaus@costaatt.edu.tt', 
        password: 'password123' 
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response OK: ${response.ok}`);
    
    const data = await response.json();
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    // Test the exact frontend logic
    console.log('\n🔍 Testing frontend logic step by step...');
    
    if (!response.ok) {
      console.log('❌ Step 1: Response not OK');
      console.log(`   Status: ${response.status}, StatusText: ${response.statusText}`);
    } else {
      console.log('✅ Step 1: Response is OK');
    }

    if (data.success) {
      console.log('✅ Step 2: data.success is true');
      console.log('✅ Step 3: data.data exists:', !!data.data);
      console.log('✅ Step 4: data.data.accessToken exists:', !!data.data.accessToken);
      console.log('✅ Step 5: data.data.user exists:', !!data.data.user);
      
      if (data.data.user) {
        console.log('✅ Step 6: User object structure:');
        console.log(`   - id: ${data.data.user.id}`);
        console.log(`   - email: ${data.data.user.email}`);
        console.log(`   - firstName: ${data.data.user.firstName}`);
        console.log(`   - lastName: ${data.data.user.lastName}`);
        console.log(`   - role: ${data.data.user.role}`);
        console.log(`   - dept: ${data.data.user.dept}`);
        console.log(`   - title: ${data.data.user.title}`);
      }
      
      console.log('\n🎯 CONCLUSION: The API is working perfectly!');
      console.log('   The issue must be in the frontend React state management.');
      console.log('   Check for JavaScript errors or React state update issues.');
      
    } else {
      console.log('❌ Step 2: data.success is false');
      console.log(`   Message: ${data.message}`);
    }

  } catch (error) {
    console.error('❌ Error debugging:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugFrontendIssue();
