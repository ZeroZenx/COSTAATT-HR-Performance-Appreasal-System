import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './dto';
import { Booking, BookingStatus, UserRole } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(createBookingDto: CreateBookingDto, userId: string): Promise<Booking> {
    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: createBookingDto.roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check for booking conflicts
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        roomId: createBookingDto.roomId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            startTime: { lt: createBookingDto.endTime },
            endTime: { gt: createBookingDto.startTime },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new ConflictException('Room is already booked during this time period');
    }

    // Check if room is under maintenance
    const maintenance = await this.prisma.maintenance.findFirst({
      where: {
        roomId: createBookingDto.roomId,
        isActive: true,
        startDate: { lte: createBookingDto.endTime },
        endDate: { gte: createBookingDto.startTime },
      },
    });

    if (maintenance) {
      throw new ConflictException('Room is under maintenance during this time period');
    }

    return this.prisma.booking.create({
      data: {
        ...createBookingDto,
        userId,
      },
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: UserRole, campus?: string): Promise<Booking[]> {
    const where: any = {};

    // Apply role-based filtering
    if (userRole === UserRole.CAMPUS_DEAN && campus) {
      where.room = {
        campus: campus as any,
      };
    } else if (userRole === UserRole.STAFF) {
      where.userId = userId;
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check permissions
    if (userRole === UserRole.STAFF && booking.userId !== userId) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.findOne(id, userId, userRole);

    // Check if user can modify this booking
    if (userRole === UserRole.STAFF && booking.userId !== userId) {
      throw new ForbiddenException('You can only modify your own bookings');
    }

    // If changing time, check for conflicts
    if (updateBookingDto.startTime || updateBookingDto.endTime) {
      const startTime = updateBookingDto.startTime || booking.startTime;
      const endTime = updateBookingDto.endTime || booking.endTime;

      const conflictingBooking = await this.prisma.booking.findFirst({
        where: {
          roomId: booking.roomId,
          id: { not: id },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new ConflictException('Room is already booked during this time period');
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.findOne(id, userId, userRole);

    // Check if user can delete this booking
    if (userRole === UserRole.STAFF && booking.userId !== userId) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async cancel(id: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.findOne(id, userId, userRole);

    // Check if user can cancel this booking
    if (userRole === UserRole.STAFF && booking.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });
  }

  async confirm(id: string, userId: string, userRole: UserRole): Promise<Booking> {
    const booking = await this.findOne(id, userId, userRole);

    // Only admins and registry can confirm bookings
    if (![UserRole.ADMIN, UserRole.REGISTRY].includes(userRole)) {
      throw new ForbiddenException('You do not have permission to confirm bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CONFIRMED },
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
    });
  }

  async getBookingsByDateRange(startDate: Date, endDate: Date, campus?: string): Promise<Booking[]> {
    const where: any = {
      startTime: { gte: startDate },
      endTime: { lte: endDate },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    };

    if (campus) {
      where.room = {
        campus: campus as any,
      };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        user: true,
        room: {
          include: {
            technologies: {
              include: {
                technology: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
