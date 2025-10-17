// Import employees from CSV file to MySQL database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Function to parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Function to clean and format data
function cleanData(value) {
  if (!value || value === '' || value === 'null') return null;
  return value.replace(/^"(.*)"$/, '$1').trim();
}

// Function to map employment category
function mapEmploymentCategory(category) {
  if (!category) return 'GENERAL_STAFF';
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('faculty') || categoryLower.includes('lecturer') || categoryLower.includes('instructor')) {
    return 'FACULTY';
  } else if (categoryLower.includes('dean') || categoryLower.includes('director') || categoryLower.includes('executive')) {
    return 'EXECUTIVE';
  } else if (categoryLower.includes('clinical')) {
    return 'CLINICAL';
  } else {
    return 'GENERAL_STAFF';
  }
}

async function importEmployees() {
  console.log('🚀 Starting employee import from CSV...');
  
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, 'data', 'authoritative_list.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header row
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    
    console.log(`📊 Found ${dataLines.length} employees to import`);
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;
      
      try {
        const columns = parseCSVLine(line);
        
        // Extract data from CSV columns
        const firstName = cleanData(columns[0]);
        const lastName = cleanData(columns[1]);
        const email = cleanData(columns[2]);
        const employeeId = cleanData(columns[3]);
        const jobTitle = cleanData(columns[4]);
        const department = cleanData(columns[5]);
        const campus = cleanData(columns[6]);
        const employmentCategory = cleanData(columns[7]);
        const supervisorEmail = cleanData(columns[8]);
        const supervisorName = cleanData(columns[9]);
        
        // Skip if essential data is missing
        if (!firstName || !lastName || !email) {
          console.log(`⚠️ Skipping row ${i + 2}: Missing essential data`);
          errorCount++;
          continue;
        }
        
        // Create user first
        const user = await prisma.user.upsert({
          where: { email: email },
          update: {
            firstName: firstName,
            lastName: lastName,
            role: 'EMPLOYEE',
            dept: department || 'Unknown',
            title: jobTitle || 'Employee',
            authProvider: 'LOCAL',
            active: true
          },
          create: {
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: 'EMPLOYEE',
            passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // default password: password
            dept: department || 'Unknown',
            title: jobTitle || 'Employee',
            authProvider: 'LOCAL',
            active: true
          }
        });
        
        // Create employee record
        await prisma.employee.upsert({
          where: { userId: user.id },
          update: {
            dept: department || 'Unknown',
            division: campus || 'Main Campus',
            employmentType: 'FULL_TIME',
            employmentCategory: mapEmploymentCategory(employmentCategory)
          },
          create: {
            userId: user.id,
            dept: department || 'Unknown',
            division: campus || 'Main Campus',
            employmentType: 'FULL_TIME',
            employmentCategory: mapEmploymentCategory(employmentCategory)
          }
        });
        
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`✅ Imported ${importedCount} employees...`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing employee at row ${i + 2}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Employee import completed!');
    console.log(`✅ Successfully imported: ${importedCount} employees`);
    console.log(`❌ Errors encountered: ${errorCount} employees`);
    
    // Update admin user to have HR_ADMIN role
    await prisma.user.update({
      where: { email: 'admin@costaatt.edu.tt' },
      data: { role: 'HR_ADMIN' }
    });
    
    console.log('✅ Admin user role updated to HR_ADMIN');
    
    // Create some supervisors
    console.log('\n👥 Creating supervisor roles...');
    const supervisors = await prisma.user.findMany({
      where: {
        title: {
          contains: 'Manager'
        }
      },
      take: 5
    });
    
    for (const supervisor of supervisors) {
      await prisma.user.update({
        where: { id: supervisor.id },
        data: { role: 'SUPERVISOR' }
      });
    }
    
    console.log(`✅ Updated ${supervisors.length} users to supervisor role`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importEmployees();
