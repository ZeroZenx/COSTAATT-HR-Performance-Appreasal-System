const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAlvinelle() {
  try {
    console.log('🔍 Searching for Alvinelle Matthew...\n');

    // Search by email patterns
    const emailSearch = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'matthew' } },
          { email: { contains: 'alvinelle' } },
          { email: { contains: 'knurse' } }
        ]
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        title: true,
        active: true
      }
    });

    console.log(`📊 Found ${emailSearch.length} user(s) by email search:\n`);
    
    emailSearch.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Role: ${user.role}`);
      console.log(`   🏢 Title: ${user.title}`);
      console.log(`   ✅ Active: ${user.active ? 'Yes' : 'No'}\n`);
    });

    // Check if new emails already exist
    console.log('🔍 Checking if new emails already exist...\n');
    
    const amatthewExists = await prisma.user.findUnique({
      where: { email: 'AMatthew@costaatt.edu.tt' }
    });
    
    const mstanisclausExists = await prisma.user.findUnique({
      where: { email: 'MStanisclaus@costaatt.edu.tt' }
    });

    console.log(`AMatthew@costaatt.edu.tt exists: ${amatthewExists ? 'Yes' : 'No'}`);
    if (amatthewExists) {
      console.log(`   Current user: ${amatthewExists.firstName} ${amatthewExists.lastName}`);
    }
    
    console.log(`MStanisclaus@costaatt.edu.tt exists: ${mstanisclausExists ? 'Yes' : 'No'}`);
    if (mstanisclausExists) {
      console.log(`   Current user: ${mstanisclausExists.firstName} ${mstanisclausExists.lastName}`);
    }

  } catch (error) {
    console.error('❌ Error searching:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAlvinelle();
