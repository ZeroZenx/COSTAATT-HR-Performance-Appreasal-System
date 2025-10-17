const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importStaffDirectory() {
  console.log('🌱 Starting Staff Directory Import...');
  
  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../../../data/authoritative_list.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Remove header and empty lines
    const dataLines = lines.slice(1).filter(line => line.trim() && !line.includes('Mass Upload Sheet'));
    
    console.log(`📊 Found ${dataLines.length} employee records to import`);
    
    // Create a map to track supervisors by name and email
    const supervisorMap = new Map();
    const importedUsers = new Map();
    
    // First pass: Import all users and build supervisor map
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue;
      
      const columns = parseCSVLine(line);
      if (columns.length < 10) continue;
      
      const [
        firstName,
        lastName,
        email,
        employeeId,
        jobTitle,
        department,
        campus,
        employmentCategory,
        supervisorEmail,
        supervisorNameRaw
      ] = columns;
      
      // Skip if no email or name
      if (!email || !firstName || !lastName) {
        console.log(`⚠️  Skipping row ${i + 2}: Missing email or name`);
        continue;
      }
      
      // Clean up the data
      const fullName = `${firstName.trim()} ${lastName.trim()}`.replace(/"/g, '');
      const cleanEmail = email.trim().toLowerCase();
      const cleanJobTitle = jobTitle.trim() || 'Staff Member';
      const cleanDepartment = department.trim() || 'General';
      const cleanSupervisorName = supervisorNameRaw.trim();
      const cleanSupervisorEmail = supervisorEmail.trim();
      
      // Determine role based on job title and department
      let role = 'EMPLOYEE';
      if (jobTitle.toLowerCase().includes('dean') || 
          jobTitle.toLowerCase().includes('director') ||
          jobTitle.toLowerCase().includes('vice president') ||
          jobTitle.toLowerCase().includes('president')) {
        role = 'EXECUTIVE';
      } else if (jobTitle.toLowerCase().includes('supervisor') ||
                 jobTitle.toLowerCase().includes('manager') ||
                 jobTitle.toLowerCase().includes('coordinator') ||
                 jobTitle.toLowerCase().includes('head')) {
        role = 'SUPERVISOR';
      } else if (jobTitle.toLowerCase().includes('hr') ||
                 jobTitle.toLowerCase().includes('admin')) {
        role = 'HR_ADMIN';
      }
      
      try {
        // Create user
        const user = await prisma.user.upsert({
          where: { email: cleanEmail },
          update: {
            firstName: firstName.trim().replace(/"/g, ''),
            lastName: lastName.trim().replace(/"/g, ''),
            dept: cleanDepartment,
            role: role,
            title: cleanJobTitle
          },
          create: {
            email: cleanEmail,
            firstName: firstName.trim().replace(/"/g, ''),
            lastName: lastName.trim().replace(/"/g, ''),
            dept: cleanDepartment,
            role: role,
            title: cleanJobTitle,
            active: true
          }
        });
        
        importedUsers.set(cleanEmail, user);
        
        // Store supervisor information for later linking
        if (cleanSupervisorName || cleanSupervisorEmail) {
          supervisorMap.set(cleanEmail, {
            supervisorName: cleanSupervisorName,
            supervisorEmail: cleanSupervisorEmail
          });
        }
        
        console.log(`✅ Imported: ${fullName} (${cleanEmail}) - ${cleanJobTitle}`);
        
      } catch (error) {
        console.error(`❌ Error importing ${fullName} (${cleanEmail}):`, error.message);
      }
    }
    
    console.log(`\n🔗 Linking supervisors...`);
    
    // Second pass: Link supervisors
    let supervisorLinksCreated = 0;
    for (const [userEmail, supervisorInfo] of supervisorMap) {
      const user = importedUsers.get(userEmail);
      if (!user) continue;
      
      let supervisor = null;
      
      // Try to find supervisor by email first
      if (supervisorInfo.supervisorEmail) {
        supervisor = importedUsers.get(supervisorInfo.supervisorEmail.toLowerCase());
      }
      
      // If not found by email, try by name
      if (!supervisor && supervisorInfo.supervisorName) {
        const supervisorName = supervisorInfo.supervisorName.trim();
        for (const [email, potentialSupervisor] of importedUsers) {
          const fullName = `${potentialSupervisor.firstName} ${potentialSupervisor.lastName}`;
          if (fullName.toLowerCase().includes(supervisorName.toLowerCase()) ||
              supervisorName.toLowerCase().includes(fullName.toLowerCase())) {
            supervisor = potentialSupervisor;
            break;
          }
        }
      }
      
      if (supervisor) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              supervisorId: supervisor.id,
              // Update role to SUPERVISOR if they have supervisees
              role: user.role === 'EMPLOYEE' ? 'SUPERVISOR' : user.role
            }
          });
          supervisorLinksCreated++;
          console.log(`🔗 Linked: ${user.firstName} ${user.lastName} → ${supervisor.firstName} ${supervisor.lastName}`);
        } catch (error) {
          console.error(`❌ Error linking supervisor for ${user.firstName} ${user.lastName}:`, error.message);
        }
      } else {
        console.log(`⚠️  Could not find supervisor for ${user.firstName} ${user.lastName}`);
      }
    }
    
    // Generate summary statistics
    const totalUsers = await prisma.user.count();
    const executives = await prisma.user.count({ where: { role: 'EXECUTIVE' } });
    const supervisors = await prisma.user.count({ where: { role: 'SUPERVISOR' } });
    const employees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
    const hrAdmins = await prisma.user.count({ where: { role: 'HR_ADMIN' } });
    
    console.log('\n📊 IMPORT SUMMARY:');
    console.log(`✅ Total Users Imported: ${totalUsers}`);
    console.log(`👔 Executives: ${executives}`);
    console.log(`👨‍💼 Supervisors: ${supervisors}`);
    console.log(`👥 Employees: ${employees}`);
    console.log(`🔧 HR Admins: ${hrAdmins}`);
    console.log(`🔗 Supervisor Links Created: ${supervisorLinksCreated}`);
    
    // Department breakdown
    const departments = await prisma.user.groupBy({
      by: ['dept'],
      _count: { dept: true }
    });
    
    console.log('\n📋 DEPARTMENT BREAKDOWN:');
    departments.forEach(dept => {
      console.log(`   ${dept.dept}: ${dept._count.dept} employees`);
    });
    
    console.log('\n🎉 Staff Directory Import Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Error importing staff directory:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

if (require.main === module) {
  importStaffDirectory()
    .then(() => {
      console.log('🎉 Staff directory import completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importStaffDirectory };
