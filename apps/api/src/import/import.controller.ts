import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
// import { AuditInterceptor } from '../audit/audit.interceptor';
// import { Audit } from '../audit/audit.decorator';

@ApiTags('Import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('employees')
  @Roles(UserRole.HR_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import employees from XLSX file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Employees imported successfully' })
  async importEmployees(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.importService.importEmployees(file.buffer);
  }

  @Post('templates/general-staff')
  @Roles(UserRole.HR_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import General Staff template from XLSX file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'General Staff template imported successfully' })
  async importGeneralStaffTemplate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.importService.importGeneralStaffTemplate(file.buffer);
  }

  @Post('templates/executive')
  @Roles(UserRole.HR_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import Executive template from XLSX file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Executive template imported successfully' })
  async importExecutiveTemplate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.importService.importExecutiveTemplate(file.buffer);
  }
}

