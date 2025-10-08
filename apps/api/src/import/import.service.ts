import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupervisorService } from '../supervisor/supervisor.service';
import * as XLSX from 'xlsx';
import { UserRole } from '@costaatt/shared';

export interface ImportResult {
  totalRows: number;
  processedRows: number;
  createdUsers: number;
  updatedUsers: number;
  skippedRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  duration: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ImportWarning {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface EmployeeImportData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  employmentCategory: string;
  supervisorEmail?: string;
  campus?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  expectedAppraisalMonth?: number;
  expectedAppraisalDay?: number;
}

@Injectable()
export class ImportService {
  constructor(
    private prisma: PrismaService,
    private supervisorService: SupervisorService,
  ) {}

  /**
   * Import employees from Excel file with chunked processing
   */
  async importEmployees(
    fileBuffer: Buffer,
    chunkSize: number = 500,
    maxRows: number = 10000,
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      totalRows: 0,
      processedRows: 0,
      createdUsers: 0,
      updatedUsers: 0,
      skippedRows: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawData.length === 0) {
        throw new BadRequestException('Excel file is empty');
      }

      // Get headers and validate
      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1) as any[][];
      
      result.totalRows = dataRows.length;

      if (result.totalRows > maxRows) {
        throw new BadRequestException(
          `File contains ${result.totalRows} rows, maximum allowed is ${maxRows}`
        );
      }

      // Validate headers
      const requiredHeaders = [
        'EmployeeID',
        'FirstName', 
        'LastName',
        'Email',
        'JobTitle',
        'Department',
        'EmploymentCategory'
      ];

      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Missing required headers: ${missingHeaders.join(', ')}`
        );
      }

      // Process data in chunks
      const chunks = this.chunkArray(dataRows, chunkSize);
      const pendingSupervisorMappings = new Map<string, string>(); // email -> userId

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];

        const chunkResult = await this.processChunk(
          chunk,
          headers,
          chunkIndex * chunkSize + 2, // +2 for header row and 1-based indexing
          pendingSupervisorMappings
        );

        result.processedRows += chunkResult.processedRows;
        result.createdUsers += chunkResult.createdUsers;
        result.updatedUsers += chunkResult.updatedUsers;
        result.skippedRows += chunkResult.skippedRows;
        result.errors.push(...chunkResult.errors);
        result.warnings.push(...chunkResult.warnings);
      }

      // Process pending supervisor mappings
      await this.processPendingSupervisorMappings(pendingSupervisorMappings);

      // Rebuild supervisor hierarchy
      await this.supervisorService.buildSupervisorHierarchy();

      result.duration = Date.now() - startTime;

      return result;

    } catch (error) {
      result.duration = Date.now() - startTime;
      result.errors.push({
        row: 0,
        field: 'file',
        value: 'file',
        message: error.message,
      });
      return result;
    }
  }

  /**
   * Process a chunk of employee data
   */
  private async processChunk(
    chunk: any[][],
    headers: string[],
    startRow: number,
    pendingSupervisorMappings: Map<string, string>
  ): Promise<Partial<ImportResult>> {
    const result: Partial<ImportResult> = {
      processedRows: 0,
      createdUsers: 0,
      updatedUsers: 0,
      skippedRows: 0,
      errors: [],
      warnings: [],
    };

    for (let i = 0; i < chunk.length; i++) {
      const row = chunk[i];
      const rowNumber = startRow + i;

      try {
        // Parse row data
        const employeeData = this.parseEmployeeRow(row, headers, rowNumber);
        
        if (!employeeData) {
          result.skippedRows++;
          continue;
        }

        // Validate employee data
        const validationErrors = this.validateEmployeeData(employeeData, rowNumber);
        if (validationErrors.length > 0) {
          result.errors.push(...validationErrors);
          result.skippedRows++;
          continue;
        }

        // Process employee
        const employeeResult = await this.processEmployee(employeeData, pendingSupervisorMappings);
        
        if (employeeResult.created) {
          result.createdUsers++;
        } else if (employeeResult.updated) {
          result.updatedUsers++;
        }

        result.processedRows++;

      } catch (error) {
        result.errors.push({
          row: rowNumber,
          field: 'row',
          value: row.join(', '),
          message: error.message,
        });
        result.skippedRows++;
      }
    }

    return result;
  }

  /**
   * Parse a single row of employee data
   */
  private parseEmployeeRow(row: any[], headers: string[], rowNumber: number): EmployeeImportData | null {
    if (!row || row.length === 0) {
      return null;
    }

    const data: any = {};
    headers.forEach((header, index) => {
      data[header] = row[index] || '';
    });

    // Skip empty rows
    if (!data.EmployeeID && !data.Email) {
      return null;
    }

    return {
      employeeId: String(data.EmployeeID || '').trim(),
      firstName: String(data.FirstName || '').trim(),
      lastName: String(data.LastName || '').trim(),
      email: String(data.Email || '').trim().toLowerCase(),
      jobTitle: String(data.JobTitle || '').trim(),
      department: String(data.Department || '').trim(),
      employmentCategory: String(data.EmploymentCategory || '').trim(),
      supervisorEmail: data.SupervisorEmail ? String(data.SupervisorEmail).trim().toLowerCase() : undefined,
      campus: data.Campus ? String(data.Campus).trim() : undefined,
      contractStartDate: data.ContractStartDate ? String(data.ContractStartDate).trim() : undefined,
      contractEndDate: data.ContractEndDate ? String(data.ContractEndDate).trim() : undefined,
      expectedAppraisalMonth: data.ExpectedAppraisalMonth ? parseInt(String(data.ExpectedAppraisalMonth)) : undefined,
      expectedAppraisalDay: data.ExpectedAppraisalDay ? parseInt(String(data.ExpectedAppraisalDay)) : undefined,
    };
  }

  /**
   * Validate employee data
   */
  private validateEmployeeData(data: EmployeeImportData, rowNumber: number): ImportError[] {
    const errors: ImportError[] = [];

    // Required fields
    if (!data.employeeId) {
      errors.push({
        row: rowNumber,
        field: 'EmployeeID',
        value: data.employeeId,
        message: 'Employee ID is required',
      });
    }

    if (!data.firstName) {
      errors.push({
        row: rowNumber,
        field: 'FirstName',
        value: data.firstName,
        message: 'First name is required',
      });
    }

    if (!data.lastName) {
      errors.push({
        row: rowNumber,
        field: 'LastName',
        value: data.lastName,
        message: 'Last name is required',
      });
    }

    if (!data.email) {
      errors.push({
        row: rowNumber,
        field: 'Email',
        value: data.email,
        message: 'Email is required',
      });
    } else if (!this.isValidEmail(data.email)) {
      errors.push({
        row: rowNumber,
        field: 'Email',
        value: data.email,
        message: 'Invalid email format',
      });
    }

    if (!data.jobTitle) {
      errors.push({
        row: rowNumber,
        field: 'JobTitle',
        value: data.jobTitle,
        message: 'Job title is required',
      });
    }

    if (!data.department) {
      errors.push({
        row: rowNumber,
        field: 'Department',
        value: data.department,
        message: 'Department is required',
      });
    }

    if (!data.employmentCategory) {
      errors.push({
        row: rowNumber,
        field: 'EmploymentCategory',
        value: data.employmentCategory,
        message: 'Employment category is required',
      });
    } else if (!this.isValidEmploymentCategory(data.employmentCategory)) {
      errors.push({
        row: rowNumber,
        field: 'EmploymentCategory',
        value: data.employmentCategory,
        message: 'Invalid employment category. Must be one of: DEAN, FACULTY, CLINICAL, GENERAL_STAFF, EXECUTIVE',
      });
    }

    // Validate supervisor email if provided
    if (data.supervisorEmail && !this.isValidEmail(data.supervisorEmail)) {
      errors.push({
        row: rowNumber,
        field: 'SupervisorEmail',
        value: data.supervisorEmail,
        message: 'Invalid supervisor email format',
      });
    }

    // Validate dates if provided
    if (data.contractStartDate && !this.isValidDate(data.contractStartDate)) {
      errors.push({
        row: rowNumber,
        field: 'ContractStartDate',
        value: data.contractStartDate,
        message: 'Invalid contract start date format',
      });
    }

    if (data.contractEndDate && !this.isValidDate(data.contractEndDate)) {
      errors.push({
        row: rowNumber,
        field: 'ContractEndDate',
        value: data.contractEndDate,
        message: 'Invalid contract end date format',
      });
    }

    return errors;
  }

  /**
   * Process a single employee
   */
  private async processEmployee(
    data: EmployeeImportData,
    pendingSupervisorMappings: Map<string, string>
  ): Promise<{ created: boolean; updated: boolean }> {
    let created = false;
    let updated = false;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { employee: true },
    });

    if (existingUser) {
      // Update existing user
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dept: data.department,
          title: data.jobTitle,
        },
      });

      // Update employee record
      if (existingUser.employee) {
        await this.prisma.employee.update({
          where: { id: existingUser.employee.id },
          data: {
            dept: data.department,
            division: data.department, // Use department as division for now
            employmentType: 'FULL_TIME', // Default employment type
            employmentCategory: data.employmentCategory as any,
            contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
            contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
            expectedAppraisalMonth: data.expectedAppraisalMonth?.toString() as any,
            expectedAppraisalDay: data.expectedAppraisalDay,
          },
        });
      } else {
        // Create employee record
        await this.prisma.employee.create({
          data: {
            userId: existingUser.id,
            dept: data.department,
            division: data.department, // Use department as division for now
            employmentType: 'FULL_TIME', // Default employment type
            employmentCategory: data.employmentCategory as any,
            contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
            contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
            expectedAppraisalMonth: data.expectedAppraisalMonth?.toString() as any,
            expectedAppraisalDay: data.expectedAppraisalDay,
          },
        });
      }

      updated = true;
    } else {
      // Create new user
      const hashedPassword = await this.generateDefaultPassword();
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          dept: data.department,
          title: data.jobTitle,
          role: this.determineUserRole(data.employmentCategory),
          active: true,
        },
      });

      // Create employee record
      await this.prisma.employee.create({
        data: {
          userId: user.id,
          dept: data.department,
          division: data.department, // Use department as division for now
          employmentType: 'FULL_TIME', // Default employment type
          employmentCategory: data.employmentCategory as any,
          contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
          contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
          expectedAppraisalMonth: data.expectedAppraisalMonth?.toString() as any,
          expectedAppraisalDay: data.expectedAppraisalDay,
        },
      });

      created = true;
    }

    // Handle supervisor mapping
    if (data.supervisorEmail) {
      const supervisor = await this.prisma.user.findUnique({
        where: { email: data.supervisorEmail },
      });

      if (supervisor) {
        // Update user's manager
        await this.prisma.user.update({
          where: { email: data.email },
          data: { managerId: supervisor.id },
        });
      } else {
        // Add to pending mappings
        const user = await this.prisma.user.findUnique({
          where: { email: data.email },
        });
        if (user) {
          pendingSupervisorMappings.set(data.supervisorEmail, user.id);
        }
      }
    }

    return { created, updated };
  }

  /**
   * Process pending supervisor mappings
   */
  private async processPendingSupervisorMappings(
    pendingMappings: Map<string, string>
  ): Promise<void> {

    for (const [supervisorEmail, userId] of pendingMappings) {
      const supervisor = await this.prisma.user.findUnique({
        where: { email: supervisorEmail },
      });

      if (supervisor) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { managerId: supervisor.id },
        });
      } else {
      }
    }
  }

  /**
   * Utility methods
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  private isValidEmploymentCategory(category: string): boolean {
    const validCategories = ['DEAN', 'FACULTY', 'CLINICAL', 'GENERAL_STAFF', 'EXECUTIVE'];
    return validCategories.includes(category.toUpperCase());
  }

  private determineUserRole(employmentCategory: string): UserRole {
    // Auto-assign roles based on employment category
    switch (employmentCategory.toUpperCase()) {
      case 'DEAN':
      case 'EXECUTIVE':
        return UserRole.SUPERVISOR;
      default:
        return UserRole.EMPLOYEE;
    }
  }

  private async generateDefaultPassword(): Promise<string> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash('TempPassword123!', 10);
  }

  /**
   * Import General Staff template from XLSX file
   */
  async importGeneralStaffTemplate(file: Express.Multer.File): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      totalRows: 0,
      processedRows: 0,
      createdUsers: 0,
      updatedUsers: 0,
      skippedRows: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) {
        throw new BadRequestException('File must contain at least a header row and one data row');
      }

      const headers = data[0] as string[];
      const dataRows = data.slice(1) as any[][];

      result.totalRows = dataRows.length;

      // Required headers for General Staff template
      const requiredHeaders = [
        'Section',
        'Item',
        'Weight',
        'Scale',
        'Description',
        'Behavioral_Level_1',
        'Behavioral_Level_2',
        'Behavioral_Level_3',
        'Behavioral_Level_4',
        'Behavioral_Level_5'
      ];

      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Missing required headers: ${missingHeaders.join(', ')}`
        );
      }

      // Process template data
      const templateData = this.parseGeneralStaffTemplate(dataRows, headers);
      
      // Create or update General Staff template
      const existingTemplate = await this.prisma.appraisalTemplate.findFirst({
        where: { type: 'GENERAL_STAFF' }
      });

      if (existingTemplate) {
        await this.prisma.appraisalTemplate.update({
          where: { id: existingTemplate.id },
          data: {
            configJson: {
              weights: templateData.weights,
              divisors: templateData.divisors,
              scales: templateData.scales,
              finalBands: templateData.finalBands,
            }
          }
        });
        result.updatedUsers = 1;
      } else {
        await this.prisma.appraisalTemplate.create({
          data: {
            name: 'General Staff Template',
            displayName: 'General Staff Performance Appraisal',
            type: 'GENERAL_STAFF',
            configJson: {
              weights: templateData.weights,
              divisors: templateData.divisors,
              scales: templateData.scales,
              finalBands: templateData.finalBands,
            },
            isActive: true,
          }
        });
        result.createdUsers = 1;
      }

      result.processedRows = dataRows.length;
      result.duration = Date.now() - startTime;

      return result;

    } catch (error) {
      result.duration = Date.now() - startTime;
      result.errors.push({
        row: 0,
        field: 'file',
        value: 'file',
        message: error.message,
      });
      return result;
    }
  }

  /**
   * Import Executive template from XLSX file
   */
  async importExecutiveTemplate(file: Express.Multer.File): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      totalRows: 0,
      processedRows: 0,
      createdUsers: 0,
      updatedUsers: 0,
      skippedRows: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) {
        throw new BadRequestException('File must contain at least a header row and one data row');
      }

      const headers = data[0] as string[];
      const dataRows = data.slice(1) as any[][];

      result.totalRows = dataRows.length;

      // Required headers for Executive template
      const requiredHeaders = [
        'Section',
        'Item',
        'Weight',
        'Scale',
        'Description',
        'Behavioral_Level_1',
        'Behavioral_Level_2',
        'Behavioral_Level_3',
        'Behavioral_Level_4',
        'Behavioral_Level_5'
      ];

      const missingHeaders = requiredHeaders.filter(
        header => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Missing required headers: ${missingHeaders.join(', ')}`
        );
      }

      // Process template data
      const templateData = this.parseExecutiveTemplate(dataRows, headers);
      
      // Create or update Executive template
      const existingTemplate = await this.prisma.appraisalTemplate.findFirst({
        where: { type: 'EXECUTIVE' }
      });

      if (existingTemplate) {
        await this.prisma.appraisalTemplate.update({
          where: { id: existingTemplate.id },
          data: {
            configJson: {
              weights: templateData.weights,
              divisors: templateData.divisors,
              scales: templateData.scales,
              finalBands: templateData.finalBands,
            }
          }
        });
        result.updatedUsers = 1;
      } else {
        await this.prisma.appraisalTemplate.create({
          data: {
            name: 'Executive Template',
            displayName: 'Executive Performance Appraisal',
            type: 'EXECUTIVE',
            configJson: {
              weights: templateData.weights,
              divisors: templateData.divisors,
              scales: templateData.scales,
              finalBands: templateData.finalBands,
            },
            isActive: true,
          }
        });
        result.createdUsers = 1;
      }

      result.processedRows = dataRows.length;
      result.duration = Date.now() - startTime;

      return result;

    } catch (error) {
      result.duration = Date.now() - startTime;
      result.errors.push({
        row: 0,
        field: 'file',
        value: 'file',
        message: error.message,
      });
      return result;
    }
  }

  /**
   * Parse General Staff template data from XLSX rows
   */
  private parseGeneralStaffTemplate(dataRows: any[][], headers: string[]): any {
    const sections: any[] = [];
    const weights: any = {};
    const divisors: any = {};
    const scales: any = {};
    const finalBands: any = {};

    // Group items by section
    const sectionMap = new Map<string, any[]>();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const sectionName = row[headers.indexOf('Section')];
      const itemName = row[headers.indexOf('Item')];
      const weight = parseFloat(row[headers.indexOf('Weight')]) || 0;
      const scale = row[headers.indexOf('Scale')];
      const description = row[headers.indexOf('Description')];

      if (!sectionName || !itemName) continue;

      const behavioralLevels = {
        1: row[headers.indexOf('Behavioral_Level_1')] || '',
        2: row[headers.indexOf('Behavioral_Level_2')] || '',
        3: row[headers.indexOf('Behavioral_Level_3')] || '',
        4: row[headers.indexOf('Behavioral_Level_4')] || '',
        5: row[headers.indexOf('Behavioral_Level_5')] || '',
      };

      const item = {
        key: `${sectionName.toLowerCase().replace(/\s+/g, '_')}_${itemName.toLowerCase().replace(/\s+/g, '_')}`,
        title: itemName,
        description,
        weight,
        scale,
        behavioralLevels,
      };

      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, []);
      }
      sectionMap.get(sectionName)!.push(item);
    }

    // Convert to sections array
    let sectionWeight = 1 / sectionMap.size;
    for (const [sectionName, items] of sectionMap) {
      const section = {
        key: sectionName.toLowerCase().replace(/\s+/g, '_'),
        title: sectionName,
        weight: sectionWeight,
        items,
      };
      sections.push(section);
      weights[section.key] = sectionWeight;
      divisors[section.key] = 1;
      scales[section.key] = '1-5';
    }

    // Set final bands
    finalBands.outstanding = 4.5;
    finalBands.exceedsExpectations = 3.5;
    finalBands.meetsExpectations = 2.5;
    finalBands.belowExpectations = 1.5;
    finalBands.unsatisfactory = 0;

    return {
      sections,
      weights,
      divisors,
      scales,
      finalBands,
    };
  }

  /**
   * Parse Executive template data from XLSX rows
   */
  private parseExecutiveTemplate(dataRows: any[][], headers: string[]): any {
    const sections: any[] = [];
    const weights: any = {};
    const divisors: any = {};
    const scales: any = {};
    const finalBands: any = {};

    // Group items by section
    const sectionMap = new Map<string, any[]>();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const sectionName = row[headers.indexOf('Section')];
      const itemName = row[headers.indexOf('Item')];
      const weight = parseFloat(row[headers.indexOf('Weight')]) || 0;
      const scale = row[headers.indexOf('Scale')];
      const description = row[headers.indexOf('Description')];

      if (!sectionName || !itemName) continue;

      const behavioralLevels = {
        1: row[headers.indexOf('Behavioral_Level_1')] || '',
        2: row[headers.indexOf('Behavioral_Level_2')] || '',
        3: row[headers.indexOf('Behavioral_Level_3')] || '',
        4: row[headers.indexOf('Behavioral_Level_4')] || '',
        5: row[headers.indexOf('Behavioral_Level_5')] || '',
      };

      const item = {
        key: `${sectionName.toLowerCase().replace(/\s+/g, '_')}_${itemName.toLowerCase().replace(/\s+/g, '_')}`,
        title: itemName,
        description,
        weight,
        scale,
        behavioralLevels,
      };

      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, []);
      }
      sectionMap.get(sectionName)!.push(item);
    }

    // Convert to sections array
    let sectionWeight = 1 / sectionMap.size;
    for (const [sectionName, items] of sectionMap) {
      const section = {
        key: sectionName.toLowerCase().replace(/\s+/g, '_'),
        title: sectionName,
        weight: sectionWeight,
        items,
      };
      sections.push(section);
      weights[section.key] = sectionWeight;
      divisors[section.key] = 1;
      scales[section.key] = '1-5';
    }

    // Set final bands
    finalBands.outstanding = 4.5;
    finalBands.exceedsExpectations = 3.5;
    finalBands.meetsExpectations = 2.5;
    finalBands.belowExpectations = 1.5;
    finalBands.unsatisfactory = 0;

    return {
      sections,
      weights,
      divisors,
      scales,
      finalBands,
    };
  }
}
