import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('campus-stats')
  @ApiOperation({ summary: 'Get statistics by campus' })
  getCampusStats() {
    return this.adminService.getCampusStats();
  }

  @Get('booking-trends')
  @ApiOperation({ summary: 'Get booking trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  getBookingTrends(@Query('days') days?: number) {
    return this.adminService.getBookingTrends(days);
  }

  @Get('room-utilization')
  @ApiOperation({ summary: 'Get room utilization statistics' })
  getRoomUtilization() {
    return this.adminService.getRoomUtilization();
  }

  @Get('top-booked-rooms')
  @ApiOperation({ summary: 'Get most booked rooms' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getTopBookedRooms(@Query('limit') limit?: number) {
    return this.adminService.getTopBookedRooms(limit);
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity statistics' })
  getUserActivity() {
    return this.adminService.getUserActivity();
  }
}
