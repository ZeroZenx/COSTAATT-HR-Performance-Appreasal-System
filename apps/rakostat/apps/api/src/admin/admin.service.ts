import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Campus, UserRole, BookingStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      activeBookings,
      totalTechnologies,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.room.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      }),
      this.prisma.technology.count(),
    ]);

    return {
      totalUsers,
      totalRooms,
      totalBookings,
      activeBookings,
      totalTechnologies,
    };
  }

  async getCampusStats() {
    const campuses = Object.values(Campus);
    const stats = await Promise.all(
      campuses.map(async (campus) => {
        const [rooms, bookings, users] = await Promise.all([
          this.prisma.room.count({ where: { campus } }),
          this.prisma.booking.count({
            where: {
              room: { campus },
              status: { in: ['PENDING', 'CONFIRMED'] },
            },
          }),
          this.prisma.user.count({ where: { campus } }),
        ]);

        return {
          campus,
          rooms,
          bookings,
          users,
        };
      }),
    );

    return stats;
  }

  async getBookingTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        status: true,
        room: {
          select: {
            campus: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const trends = bookings.reduce((acc, booking) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0, confirmed: 0, pending: 0, cancelled: 0 };
      }
      acc[date].total++;
      acc[date][booking.status.toLowerCase()]++;
      return acc;
    }, {});

    return Object.values(trends);
  }

  async getRoomUtilization() {
    const rooms = await this.prisma.room.findMany({
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
              },
            },
          },
        },
      },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      campus: room.campus,
      capacity: room.capacity,
      bookingCount: room._count.bookings,
      utilization: room._count.bookings > 0 ? (room._count.bookings / 30) * 100 : 0, // Assuming 30 days period
    }));
  }

  async getTopBookedRooms(limit: number = 10) {
    const rooms = await this.prisma.room.findMany({
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
              },
            },
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      campus: room.campus,
      bookingCount: room._count.bookings,
    }));
  }

  async getUserActivity() {
    const users = await this.prisma.user.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        bookings: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      campus: user.campus,
      bookingCount: user._count.bookings,
    }));
  }
}
