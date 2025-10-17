// Test the exact same request the frontend makes
async function testFrontendAuth() {
  try {
    console.log('🧪 Testing frontend authentication request...\n');

    const response = await fetch('http://10.2.1.27:3000/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://10.2.1.27:5173'
      },
      body: JSON.stringify({ 
        email: 'AMatthew@costaatt.edu.tt', 
        password: 'P@ssw0rd!' 
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Authentication successful!');
      console.log(`   Token: ${data.data.accessToken.substring(0, 50)}...`);
      console.log(`   User: ${data.data.user.firstName} ${data.data.user.lastName}`);
    } else {
      console.log('❌ Authentication failed!');
      console.log(`   Message: ${data.message}`);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testFrontendAuth();
