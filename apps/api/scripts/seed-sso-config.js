const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSSOConfig() {
  try {
    console.log('🚀 Starting SSO configuration seeding...');
    
    // Check existing SSO config
    const existingConfig = await prisma.sSOConfig.findFirst();
    
    const ssoConfig = {
      isEnabled: true,
      clientId: '7911cfad-b0d5-419c-83b2-62aab8833a66',
      clientSecret: process.env.AZURE_CLIENT_SECRET || 'your-client-secret-here',
      tenantId: '023c2cf6-b378-495b-a3cd-591490b7f6e1',
      redirectUri: 'http://localhost:5173/auth/sso/microsoft/callback'
    };
    
    if (existingConfig) {
      // Update existing config
      await prisma.sSOConfig.update({
        where: { id: existingConfig.id },
        data: ssoConfig
      });
      console.log('🔄 Updated existing SSO configuration');
    } else {
      // Create new config
      await prisma.sSOConfig.create({
        data: ssoConfig
      });
      console.log('✅ Created SSO configuration');
    }
    
    console.log('🎉 SSO configuration seeding completed!');
    console.log('\n📋 SSO Configuration:');
    console.log(`- Client ID: ${ssoConfig.clientId}`);
    console.log(`- Tenant ID: ${ssoConfig.tenantId}`);
    console.log(`- Redirect URI: ${ssoConfig.redirectUri}`);
    console.log(`- Status: ${ssoConfig.isEnabled ? 'Enabled' : 'Disabled'}`);
    
  } catch (error) {
    console.error('❌ Fatal error during SSO seeding:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedSSOConfig();
