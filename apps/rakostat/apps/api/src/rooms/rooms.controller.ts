import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, AddTechnologyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, Campus } from '@prisma/client';

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new room (Admin only)' })
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all rooms' })
  @ApiQuery({ name: 'campus', required: false, enum: Campus })
  @ApiQuery({ name: 'capacity', required: false, type: Number })
  @ApiQuery({ name: 'technologyIds', required: false, type: [String] })
  @ApiQuery({ name: 'startTime', required: false, type: Date })
  @ApiQuery({ name: 'endTime', required: false, type: Date })
  findAll(
    @Query('campus') campus?: Campus,
    @Query('capacity') capacity?: number,
    @Query('technologyIds') technologyIds?: string[],
    @Query('startTime') startTime?: Date,
    @Query('endTime') endTime?: Date,
  ) {
    if (startTime && endTime) {
      return this.roomsService.getAvailableRooms(campus, capacity, technologyIds, new Date(startTime), new Date(endTime));
    }
    return this.roomsService.findAll(campus);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available rooms for booking' })
  @ApiQuery({ name: 'campus', required: false, enum: Campus })
  @ApiQuery({ name: 'capacity', required: false, type: Number })
  @ApiQuery({ name: 'technologyIds', required: false, type: [String] })
  @ApiQuery({ name: 'startTime', required: true, type: Date })
  @ApiQuery({ name: 'endTime', required: true, type: Date })
  getAvailableRooms(
    @Query('campus') campus?: Campus,
    @Query('capacity') capacity?: number,
    @Query('technologyIds') technologyIds?: string[],
    @Query('startTime') startTime?: Date,
    @Query('endTime') endTime?: Date,
  ) {
    return this.roomsService.getAvailableRooms(
      campus,
      capacity,
      technologyIds,
      new Date(startTime),
      new Date(endTime),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update room (Admin only)' })
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Post(':id/technologies')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add technology to room (Admin only)' })
  addTechnology(@Param('id') id: string, @Body() addTechnologyDto: AddTechnologyDto) {
    return this.roomsService.addTechnology(id, addTechnologyDto);
  }

  @Delete(':id/technologies/:technologyId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove technology from room (Admin only)' })
  removeTechnology(@Param('id') id: string, @Param('technologyId') technologyId: string) {
    return this.roomsService.removeTechnology(id, technologyId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete room (Admin only)' })
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
