import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  async findAll(
    @Query('dept') dept?: string,
    @Query('division') division?: string,
    @Query('employmentType') employmentType?: string,
    @Query('supervisorId') supervisorId?: string,
    @Query('search') search?: string,
  ) {
    return this.employeesService.findAll({
      dept,
      division,
      employmentType,
      supervisorId,
      search,
    });
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async getDepartments() {
    return this.employeesService.getDepartments();
  }

  @Get('divisions')
  @ApiOperation({ summary: 'Get all divisions' })
  @ApiResponse({ status: 200, description: 'Divisions retrieved successfully' })
  async getDivisions() {
    return this.employeesService.getDivisions();
  }

  @Get('employment-types')
  @ApiOperation({ summary: 'Get all employment types' })
  @ApiResponse({ status: 200, description: 'Employment types retrieved successfully' })
  async getEmploymentTypes() {
    return this.employeesService.getEmploymentTypes();
  }

  @Get(':id')
  @Roles(UserRole.HR_ADMIN, UserRole.SUPERVISOR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findById(id);
  }

  @Post()
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Create new employee (HR Admin only)' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(@Body() createData: {
    userId: string;
    dept: string;
    division: string;
    employmentType: string;
    supervisorId?: string;
    contractTerm?: string;
  }) {
    return this.employeesService.create(createData);
  }

  @Put(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update employee (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: {
      dept?: string;
      division?: string;
      employmentType?: string;
      supervisorId?: string;
      contractTerm?: string;
    },
  ) {
    return this.employeesService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete employee (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async delete(@Param('id') id: string) {
    return this.employeesService.delete(id);
  }
}

