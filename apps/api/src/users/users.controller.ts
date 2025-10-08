import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@costaatt/shared';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Get()
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get all users (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query('role') role?: UserRole,
    @Query('dept') dept?: string,
    @Query('active') active?: boolean,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ role, dept, active, search });
  }

  @Get('subordinates')
  @Roles(UserRole.SUPERVISOR, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get subordinates (Supervisor/HR Admin only)' })
  @ApiResponse({ status: 200, description: 'Subordinates retrieved successfully' })
  async getSubordinates(@Request() req) {
    return this.usersService.getSubordinates(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const canAccess = await this.usersService.canAccessUser(req.user.sub, id, req.user.role);
    if (!canAccess) {
      throw new Error('Forbidden');
    }
    return this.usersService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update user (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateData: {
      firstName?: string;
      lastName?: string;
      dept?: string;
      title?: string;
      managerId?: string;
      active?: boolean;
    },
  ) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Delete user (HR Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

