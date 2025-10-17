import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, Campus } from '@prisma/client';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createBookingDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'campus', required: false, enum: Campus })
  findAll(@Request() req, @Query('campus') campus?: Campus) {
    return this.bookingsService.findAll(req.user.id, req.user.role, campus);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get bookings for calendar view' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  @ApiQuery({ name: 'campus', required: false, enum: Campus })
  getCalendarBookings(
    @Request() req,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Query('campus') campus?: Campus,
  ) {
    return this.bookingsService.getBookingsByDateRange(
      new Date(startDate),
      new Date(endDate),
      campus,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @Request() req) {
    return this.bookingsService.update(id, updateBookingDto, req.user.id, req.user.role);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(id, req.user.id, req.user.role);
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.REGISTRY)
  @ApiOperation({ summary: 'Confirm booking (Admin/Registry only)' })
  confirm(@Param('id') id: string, @Request() req) {
    return this.bookingsService.confirm(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking' })
  remove(@Param('id') id: string, @Request() req) {
    return this.bookingsService.remove(id, req.user.id, req.user.role);
  }
}
