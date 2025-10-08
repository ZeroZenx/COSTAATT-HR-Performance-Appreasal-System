import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import { createReadStream, createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface AuthoritativeEmployee {
  appraisedPerson: string;
  headOfDepartment: string;
  department: string;
  jobTitle: string;
}

interface EmployeeMatch {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentDepartment: string;
  currentJobTitle: string;
  currentSupervisorId?: string;
  currentSupervisorEmail?: string;
}

interface FixReport {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  field: string;
  currentValue: string;
  newValue: string;
  status: 'PENDING' | 'APPLIED' | 'SKIPPED' | 'ERROR';
  reason?: string;
}

interface ValidationReport {
  totalValidated: number;
  totalCorrected: number;
  totalMissing: number;
  totalSkipped: number;
  totalErrors: number;
  departmentFixes: FixReport[];
  missingInDb: string[];
  ambiguousMatches: Array<{
    name: string;
    matches: EmployeeMatch[];
  }>;
  hodLinkingIssues: Array<{
    employeeName: string;
    hodEmail: string;
    issue: string;
  }>;
}

// Name normalization and matching functions
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Normalize whitespace
}

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  // Handle "Last, First" format
  if (fullName.includes(',')) {
    const [last, first] = fullName.split(',').map(s => s.trim());
    return { firstName: first, lastName: last };
  }
  // Multiple names - first is first name, rest is last name
  return { 
    firstName: parts[0], 
    lastName: parts.slice(1).join(' ') 
  };
}

function calculateNameSimilarity(name1: string, name2: string): number {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  
  if (n1 === n2) return 1.0;
  
  // Jaro-Winkler similarity
  const jaro = jaroWinkler(n1, n2);
  return jaro;
}

function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  if (matchWindow < 0) return 0.0;
  
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Winkler modification
  let prefix = 0;
  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }
  
  return jaro + (0.1 * prefix * (1 - jaro));
}

async function readAuthoritativeData(filePath: string): Promise<AuthoritativeEmployee[]> {
  return new Promise((resolve, reject) => {
    const employees: AuthoritativeEmployee[] = [];
    
    createReadStream(filePath)
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        employees.push({
          appraisedPerson: row['Appraised Person']?.trim(),
          headOfDepartment: row['Head Of Department']?.trim(),
          department: row['Department']?.trim(),
          jobTitle: row['Job Title']?.trim()
        });
      })
      .on('end', () => {
        console.log(`📊 Read ${employees.length} authoritative employees from CSV`);
        resolve(employees);
      })
      .on('error', reject);
  });
}

async function getAllEmployees(): Promise<EmployeeMatch[]> {
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
  
  return employees.map(emp => ({
    id: emp.id,
    firstName: emp.user.firstName,
    lastName: emp.user.lastName,
    email: emp.user.email,
    currentDepartment: emp.dept,
    currentJobTitle: emp.user.title || '',
    currentSupervisorId: emp.supervisorId || undefined,
    currentSupervisorEmail: emp.supervisor?.user.email || undefined
  }));
}

async function findEmployeeByName(name: string, allEmployees: EmployeeMatch[]): Promise<{
  exactMatch?: EmployeeMatch;
  fuzzyMatches: EmployeeMatch[];
  bestMatch?: EmployeeMatch;
}> {
  const { firstName, lastName } = parseFullName(name);
  const fullName = `${firstName} ${lastName}`.trim();
  
  // Exact matches
  const exactMatches = allEmployees.filter(emp => {
    const empFullName = `${emp.firstName} ${emp.lastName}`.trim();
    return normalizeName(empFullName) === normalizeName(fullName) ||
           normalizeName(empFullName) === normalizeName(`${lastName}, ${firstName}`.trim());
  });
  
  // Fuzzy matches with similarity threshold
  const fuzzyMatches = allEmployees
    .map(emp => ({
      employee: emp,
      similarity: Math.max(
        calculateNameSimilarity(fullName, `${emp.firstName} ${emp.lastName}`),
        calculateNameSimilarity(fullName, `${emp.lastName}, ${emp.firstName}`)
      )
    }))
    .filter(match => match.similarity > 0.7)
    .sort((a, b) => b.similarity - a.similarity)
    .map(match => match.employee);
  
  return {
    exactMatch: exactMatches[0],
    fuzzyMatches: fuzzyMatches.slice(0, 3), // Top 3 fuzzy matches
    bestMatch: fuzzyMatches[0]
  };
}

async function findSupervisorByEmail(email: string, allEmployees: EmployeeMatch[]): Promise<EmployeeMatch | null> {
  const normalizedEmail = email.toLowerCase().trim();
  return allEmployees.find(emp => emp.email.toLowerCase() === normalizedEmail) || null;
}

async function validateAndFixEmployees(dryRun: boolean = true): Promise<ValidationReport> {
  console.log(`🔄 Starting employee validation and correction process (${dryRun ? 'DRY RUN' : 'LIVE MODE'})...`);
  
  const report: ValidationReport = {
    totalValidated: 0,
    totalCorrected: 0,
    totalMissing: 0,
    totalSkipped: 0,
    totalErrors: 0,
    departmentFixes: [],
    missingInDb: [],
    ambiguousMatches: [],
    hodLinkingIssues: []
  };
  
  try {
    // Read authoritative data
    const authoritativeEmployees = await readAuthoritativeData('data/authoritative_list.csv');
    
    // Get all employees from database
    const allEmployees = await getAllEmployees();
    
    console.log(`📊 Processing ${authoritativeEmployees.length} authoritative employees...`);
    
    for (const authEmp of authoritativeEmployees) {
      report.totalValidated++;
      
      const { exactMatch, fuzzyMatches, bestMatch } = await findEmployeeByName(
        authEmp.appraisedPerson, 
        allEmployees
      );
      
      if (exactMatch) {
        // Process exact match
        await processEmployeeMatch(exactMatch, authEmp, report, dryRun);
      } else if (fuzzyMatches.length === 1) {
        // Single fuzzy match - likely correct
        await processEmployeeMatch(fuzzyMatches[0], authEmp, report, dryRun);
      } else if (fuzzyMatches.length > 1) {
        // Multiple fuzzy matches - ambiguous
        report.ambiguousMatches.push({
          name: authEmp.appraisedPerson,
          matches: fuzzyMatches
        });
        report.totalSkipped++;
      } else {
        // No match found
        report.missingInDb.push(authEmp.appraisedPerson);
        report.totalMissing++;
      }
    }
    
    // Generate summary
    console.log('\n✅ Validation Complete');
    console.log(`Planned updates: ${report.departmentFixes.length}`);
    console.log(`Updated successfully: ${report.totalCorrected}`);
    console.log(`Missing in DB: ${report.totalMissing}`);
    console.log(`Ambiguous matches: ${report.ambiguousMatches.length}`);
    console.log(`HOD issues: ${report.hodLinkingIssues.length}`);
    
    // Create reports directory
    mkdirSync('reports/fix', { recursive: true });
    
    // Write reports
    await writeFixReport('department_fixes.csv', report.departmentFixes);
    await writeMissingReport('missing_in_db.csv', report.missingInDb);
    await writeAmbiguousReport('ambiguous_matches.csv', report.ambiguousMatches);
    await writeHODIssuesReport('hod_linking_issues.csv', report.hodLinkingIssues);
    
    console.log(`Reports written to: /reports/fix/`);
    
    return report;
    
  } catch (error) {
    console.error('❌ Error during validation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function processEmployeeMatch(
  employee: EmployeeMatch, 
  authEmp: AuthoritativeEmployee, 
  report: ValidationReport, 
  dryRun: boolean
): Promise<void> {
  const fixes: FixReport[] = [];
  
  // Check department
  if (employee.currentDepartment !== authEmp.department) {
    fixes.push({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeEmail: employee.email,
      field: 'department',
      currentValue: employee.currentDepartment,
      newValue: authEmp.department,
      status: 'PENDING',
      reason: 'Department mismatch with authoritative data'
    });
  }
  
  // Check job title
  if (employee.currentJobTitle !== authEmp.jobTitle) {
    fixes.push({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeEmail: employee.email,
      field: 'jobTitle',
      currentValue: employee.currentJobTitle,
      newValue: authEmp.jobTitle,
      status: 'PENDING',
      reason: 'Job title mismatch with authoritative data'
    });
  }
  
  // Check supervisor relationship
  if (authEmp.headOfDepartment) {
    const supervisor = await findSupervisorByEmail(authEmp.headOfDepartment, []);
    if (!supervisor) {
      report.hodLinkingIssues.push({
        employeeName: `${employee.firstName} ${employee.lastName}`,
        hodEmail: authEmp.headOfDepartment,
        issue: 'HOD email not found in database'
      });
    } else if (employee.currentSupervisorId !== supervisor.id) {
      fixes.push({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeEmail: employee.email,
        field: 'supervisorId',
        currentValue: employee.currentSupervisorId || 'None',
        newValue: supervisor.id,
        status: 'PENDING',
        reason: 'Supervisor relationship mismatch'
      });
    }
  }
  
  // Apply fixes if not dry run
  if (!dryRun && fixes.length > 0) {
    for (const fix of fixes) {
      try {
        if (fix.field === 'department') {
          await prisma.employee.update({
            where: { id: fix.employeeId },
            data: { dept: fix.newValue }
          });
          await prisma.user.update({
            where: { id: employee.id },
            data: { dept: fix.newValue }
          });
        } else if (fix.field === 'jobTitle') {
          await prisma.user.update({
            where: { id: employee.id },
            data: { title: fix.newValue }
          });
        } else if (fix.field === 'supervisorId') {
          await prisma.employee.update({
            where: { id: fix.employeeId },
            data: { supervisorId: fix.newValue }
          });
        }
        
        fix.status = 'APPLIED';
        report.totalCorrected++;
      } catch (error: any) {
        fix.status = 'ERROR';
        fix.reason = `Error applying fix: ${error.message}`;
        report.totalErrors++;
      }
    }
  } else if (fixes.length > 0) {
    report.totalSkipped += fixes.length;
  }
  
  report.departmentFixes.push(...fixes);
}

async function writeFixReport(filename: string, fixes: FixReport[]): Promise<void> {
  const filePath = join('reports/fix', filename);
  const stream = createWriteStream(filePath);
  
  if (fixes.length === 0) {
    stream.write('No fixes needed\n');
    stream.end();
    return;
  }
  
  // Write CSV header
  const headers = ['employeeId', 'employeeName', 'employeeEmail', 'field', 'currentValue', 'newValue', 'status', 'reason'];
  stream.write(headers.join(',') + '\n');
  
  // Write data rows
  for (const fix of fixes) {
    const values = headers.map(header => `"${String(fix[header as keyof FixReport] || '').replace(/"/g, '""')}"`);
    stream.write(values.join(',') + '\n');
  }
  
  stream.end();
  console.log(`📄 Written report: ${filename}`);
}

async function writeMissingReport(filename: string, missing: string[]): Promise<void> {
  const filePath = join('reports/fix', filename);
  const stream = createWriteStream(filePath);
  
  stream.write('Missing Employee Names\n');
  for (const name of missing) {
    stream.write(`"${name}"\n`);
  }
  
  stream.end();
  console.log(`📄 Written report: ${filename}`);
}

async function writeAmbiguousReport(filename: string, ambiguous: Array<{name: string; matches: EmployeeMatch[]}>): Promise<void> {
  const filePath = join('reports/fix', filename);
  const stream = createWriteStream(filePath);
  
  stream.write('Employee Name,Match 1,Match 2,Match 3\n');
  for (const item of ambiguous) {
    const matches = item.matches.map(m => `${m.firstName} ${m.lastName} (${m.email})`).join(',');
    stream.write(`"${item.name}","${matches}"\n`);
  }
  
  stream.end();
  console.log(`📄 Written report: ${filename}`);
}

async function writeHODIssuesReport(filename: string, issues: Array<{employeeName: string; hodEmail: string; issue: string}>): Promise<void> {
  const filePath = join('reports/fix', filename);
  const stream = createWriteStream(filePath);
  
  stream.write('Employee Name,HOD Email,Issue\n');
  for (const issue of issues) {
    stream.write(`"${issue.employeeName}","${issue.hodEmail}","${issue.issue}"\n`);
  }
  
  stream.end();
  console.log(`📄 Written report: ${filename}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const applyChanges = args.includes('--apply');
  
  console.log(`🚀 COSTAATT HR Employee Validation and Correction`);
  console.log(`Mode: ${applyChanges ? 'LIVE (changes will be applied)' : 'DRY RUN (no changes will be made)'}`);
  console.log('=' .repeat(60));
  
  try {
    const report = await validateAndFixEmployees(!applyChanges);
    
    console.log('\n📊 Final Summary:');
    console.log(`Total validated: ${report.totalValidated}`);
    console.log(`Total corrected: ${report.totalCorrected}`);
    console.log(`Total missing: ${report.totalMissing}`);
    console.log(`Total skipped: ${report.totalSkipped}`);
    console.log(`Total errors: ${report.totalErrors}`);
    
    if (applyChanges) {
      console.log('\n✅ Changes have been applied to the database');
    } else {
      console.log('\n💡 Run with --apply flag to apply the changes');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
