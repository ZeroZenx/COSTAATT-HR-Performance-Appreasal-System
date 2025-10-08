import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import { createReadStream, createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  title: string;
  department: string;
  division: string;
  employmentType: string;
  employmentCategory: string;
  contractStartDate: string;
  contractEndDate: string;
  expectedAppraisalMonth: string;
  expectedAppraisalDay: string;
  supervisorEmail?: string;
}

interface ReconciliationReport {
  missingInSystem: EmployeeData[];
  presentInSystem: EmployeeData[];
  extraInSystem: any[];
  changedInSystem: Array<{
    employee: any;
    changes: Record<string, { old: any; new: any }>;
  }>;
}

async function readEmployeeData(filePath: string): Promise<EmployeeData[]> {
  return new Promise((resolve, reject) => {
    const employees: EmployeeData[] = [];
    
    createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        // Normalize email to lowercase
        const normalizedRow = {
          ...row,
          email: row.email?.toLowerCase().trim(),
          supervisorEmail: row.supervisorEmail?.toLowerCase().trim()
        };
        employees.push(normalizedRow);
      })
      .on('end', () => {
        console.log(`📊 Read ${employees.length} employees from CSV`);
        resolve(employees);
      })
      .on('error', reject);
  });
}

async function getExistingEmployees() {
  const employees = await prisma.employee.findMany({
    include: {
      user: true,
      supervisor: {
        include: {
          user: true
        }
      }
    }
  });
  
  console.log(`📊 Found ${employees.length} existing employees in database`);
  return employees;
}

async function normalizeEmail(email: string): Promise<string> {
  return email?.toLowerCase().trim() || '';
}

async function findSupervisorByEmail(supervisorEmail: string, allEmployees: EmployeeData[]): Promise<string | null> {
  if (!supervisorEmail) return null;
  
  const normalizedSupervisorEmail = supervisorEmail.toLowerCase().trim();
  const supervisor = allEmployees.find(emp => 
    emp.email.toLowerCase().trim() === normalizedSupervisorEmail
  );
  
  return supervisor ? supervisor.email : null;
}

async function reconcileEmployees() {
  console.log('🔄 Starting employee reconciliation process...');
  
  try {
    // Read employee data from CSV
    const csvEmployees = await readEmployeeData('data/employees_master.csv');
    
    // Get existing employees from database
    const existingEmployees = await getExistingEmployees();
    
    // Create lookup maps
    const existingByEmail = new Map();
    existingEmployees.forEach(emp => {
      existingByEmail.set(emp.user.email.toLowerCase(), emp);
    });
    
    const csvByEmail = new Map();
    csvEmployees.forEach(emp => {
      csvByEmail.set(emp.email.toLowerCase(), emp);
    });
    
    // Initialize reports
    const report: ReconciliationReport = {
      missingInSystem: [],
      presentInSystem: [],
      extraInSystem: [],
      changedInSystem: []
    };
    
    // Find missing employees (in CSV but not in DB)
    for (const csvEmp of csvEmployees) {
      const normalizedEmail = csvEmp.email.toLowerCase().trim();
      if (!existingByEmail.has(normalizedEmail)) {
        report.missingInSystem.push(csvEmp);
      } else {
        report.presentInSystem.push(csvEmp);
      }
    }
    
    // Find extra employees (in DB but not in CSV)
    for (const existingEmp of existingEmployees) {
      const normalizedEmail = existingEmp.user.email.toLowerCase().trim();
      if (!csvByEmail.has(normalizedEmail)) {
        report.extraInSystem.push(existingEmp);
      }
    }
    
    // Find changed employees
    for (const csvEmp of csvEmployees) {
      const normalizedEmail = csvEmp.email.toLowerCase().trim();
      const existingEmp = existingByEmail.get(normalizedEmail);
      
      if (existingEmp) {
        const changes: Record<string, { old: any; new: any }> = {};
        
        // Check for changes in various fields
        if (existingEmp.user.firstName !== csvEmp.firstName) {
          changes.firstName = { old: existingEmp.user.firstName, new: csvEmp.firstName };
        }
        if (existingEmp.user.lastName !== csvEmp.lastName) {
          changes.lastName = { old: existingEmp.user.lastName, new: csvEmp.lastName };
        }
        if (existingEmp.user.title !== csvEmp.title) {
          changes.title = { old: existingEmp.user.title, new: csvEmp.title };
        }
        if (existingEmp.dept !== csvEmp.department) {
          changes.department = { old: existingEmp.dept, new: csvEmp.department };
        }
        if (existingEmp.division !== csvEmp.division) {
          changes.division = { old: existingEmp.division, new: csvEmp.division };
        }
        if (existingEmp.employmentType !== csvEmp.employmentType) {
          changes.employmentType = { old: existingEmp.employmentType, new: csvEmp.employmentType };
        }
        if (existingEmp.employmentCategory !== csvEmp.employmentCategory) {
          changes.employmentCategory = { old: existingEmp.employmentCategory, new: csvEmp.employmentCategory };
        }
        
        if (Object.keys(changes).length > 0) {
          report.changedInSystem.push({
            employee: existingEmp,
            changes
          });
        }
      }
    }
    
    console.log(`📈 Reconciliation Summary:`);
    console.log(`   Missing in system: ${report.missingInSystem.length}`);
    console.log(`   Present in system: ${report.presentInSystem.length}`);
    console.log(`   Extra in system: ${report.extraInSystem.length}`);
    console.log(`   Changed in system: ${report.changedInSystem.length}`);
    
    // Create reports directory
    mkdirSync('reports/reconciliation', { recursive: true });
    
    // Write reports
    await writeReport('missing_in_system.csv', report.missingInSystem);
    await writeReport('present_in_system.csv', report.presentInSystem);
    await writeReport('extra_in_system.csv', report.extraInSystem);
    await writeReport('changed_in_system.csv', report.changedInSystem);
    
    // Write log
    const logContent = `Employee Reconciliation Report
Generated: ${new Date().toISOString()}

Summary:
- Missing in system: ${report.missingInSystem.length}
- Present in system: ${report.presentInSystem.length}
- Extra in system: ${report.extraInSystem.length}
- Changed in system: ${report.changedInSystem.length}

Missing employees:
${report.missingInSystem.map(emp => `- ${emp.firstName} ${emp.lastName} (${emp.email})`).join('\n')}

Changed employees:
${report.changedInSystem.map(item => 
  `- ${item.employee.user.firstName} ${item.employee.user.lastName} (${item.employee.user.email}): ${Object.keys(item.changes).join(', ')}`
).join('\n')}
`;
    
    await writeFile('log.txt', logContent);
    
    // Now process the reconciliation
    console.log('🔄 Processing reconciliation...');
    
    // Insert missing employees
    for (const csvEmp of report.missingInSystem) {
      try {
        // Create user first
        const user = await prisma.user.create({
          data: {
            email: csvEmp.email,
            passwordHash: '$2b$10$dummy.hash.for.new.employees', // Default password
            role: csvEmp.role as any,
            firstName: csvEmp.firstName,
            lastName: csvEmp.lastName,
            dept: csvEmp.department,
            title: csvEmp.title,
            active: true
          }
        });
        
        // Create employee record
        const employee = await prisma.employee.create({
          data: {
            userId: user.id,
            dept: csvEmp.department,
            division: csvEmp.division,
            employmentType: csvEmp.employmentType,
            employmentCategory: csvEmp.employmentCategory as any,
            contractStartDate: csvEmp.contractStartDate ? new Date(csvEmp.contractStartDate) : null,
            contractEndDate: csvEmp.contractEndDate ? new Date(csvEmp.contractEndDate) : null,
            expectedAppraisalMonth: csvEmp.expectedAppraisalMonth,
            expectedAppraisalDay: csvEmp.expectedAppraisalDay ? parseInt(csvEmp.expectedAppraisalDay) : null
          }
        });
        
        console.log(`✅ Created employee: ${csvEmp.firstName} ${csvEmp.lastName} (${csvEmp.email})`);
      } catch (error) {
        console.error(`❌ Error creating employee ${csvEmp.email}:`, error);
      }
    }
    
    // Update changed employees
    for (const changeItem of report.changedInSystem) {
      try {
        const { employee, changes } = changeItem;
        
        // Update user record
        const userUpdateData: any = {};
        if (changes.firstName) userUpdateData.firstName = changes.firstName.new;
        if (changes.lastName) userUpdateData.lastName = changes.lastName.new;
        if (changes.title) userUpdateData.title = changes.title.new;
        if (changes.department) userUpdateData.dept = changes.department.new;
        
        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: employee.userId },
            data: userUpdateData
          });
        }
        
        // Update employee record
        const employeeUpdateData: any = {};
        if (changes.department) employeeUpdateData.dept = changes.department.new;
        if (changes.division) employeeUpdateData.division = changes.division.new;
        if (changes.employmentType) employeeUpdateData.employmentType = changes.employmentType.new;
        if (changes.employmentCategory) employeeUpdateData.employmentCategory = changes.employmentCategory.new;
        
        if (Object.keys(employeeUpdateData).length > 0) {
          await prisma.employee.update({
            where: { id: employee.id },
            data: employeeUpdateData
          });
        }
        
        console.log(`✅ Updated employee: ${employee.user.firstName} ${employee.user.lastName} (${employee.user.email})`);
      } catch (error) {
        console.error(`❌ Error updating employee ${changeItem.employee.user.email}:`, error);
      }
    }
    
    // Rebuild supervisor relationships
    console.log('🔄 Rebuilding supervisor relationships...');
    
    // Clear existing supervisor scope
    await prisma.supervisorScope.deleteMany();
    
    // Get all employees with their relationships
    const allEmployees = await prisma.employee.findMany({
      include: {
        user: true,
        supervisor: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Build supervisor scope recursively
    for (const employee of allEmployees) {
      if (employee.supervisorId) {
        await buildSupervisorScope(employee.id, employee.supervisorId, 1);
      }
    }
    
    console.log('✅ Employee reconciliation completed successfully!');
    
    // Check for specific employees
    const varune = await prisma.employee.findFirst({
      where: {
        user: {
          OR: [
            { firstName: { contains: 'Varune', mode: 'insensitive' } },
            { lastName: { contains: 'Ramrattan', mode: 'insensitive' } }
          ]
        }
      },
      include: { user: true }
    });
    
    const varick = await prisma.employee.findFirst({
      where: {
        user: {
          OR: [
            { firstName: { contains: 'Varick', mode: 'insensitive' } },
            { lastName: { contains: 'Dhannie', mode: 'insensitive' } }
          ]
        }
      },
      include: { user: true }
    });
    
    console.log('\n🔍 Specific Employee Check:');
    console.log(`Varune Ramrattan: ${varune ? `✅ Found (${varune.user.firstName} ${varune.user.lastName})` : '❌ Not found'}`);
    console.log(`Varick Dhannie: ${varick ? `✅ Found (${varick.user.firstName} ${varick.user.lastName})` : '❌ Not found'}`);
    
  } catch (error) {
    console.error('❌ Error during reconciliation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function buildSupervisorScope(employeeId: string, supervisorId: string, level: number) {
  try {
    await prisma.supervisorScope.create({
      data: {
        supervisorId,
        reportId: employeeId,
        level
      }
    });
    
    // Find the supervisor's supervisor and build the chain
    const supervisor = await prisma.employee.findUnique({
      where: { id: supervisorId },
      select: { supervisorId: true }
    });
    
    if (supervisor?.supervisorId) {
      await buildSupervisorScope(employeeId, supervisor.supervisorId, level + 1);
    }
  } catch (error) {
    // Ignore duplicate key errors
    if (!error.message?.includes('Unique constraint')) {
      console.error(`Error building supervisor scope: ${error.message}`);
    }
  }
}

async function writeReport(filename: string, data: any[]) {
  const filePath = join('reports/reconciliation', filename);
  const stream = createWriteStream(filePath);
  
  if (data.length === 0) {
    stream.write('No data\n');
    stream.end();
    return;
  }
  
  // Write CSV header
  const headers = Object.keys(data[0]);
  stream.write(headers.join(',') + '\n');
  
  // Write data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return `"${String(value || '').replace(/"/g, '""')}"`;
    });
    stream.write(values.join(',') + '\n');
  }
  
  stream.end();
  console.log(`📄 Written report: ${filename}`);
}

async function writeFile(filename: string, content: string) {
  const filePath = join('reports/reconciliation', filename);
  const stream = createWriteStream(filePath);
  stream.write(content);
  stream.end();
  console.log(`📄 Written file: ${filename}`);
}

// Run the reconciliation
reconcileEmployees().catch(console.error);