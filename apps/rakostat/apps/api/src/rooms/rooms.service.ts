import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, AddTechnologyDto } from './dto';
import { Room, Campus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const existingRoom = await this.prisma.room.findFirst({
      where: {
        name: createRoomDto.name,
        campus: createRoomDto.campus,
      },
    });

    if (existingRoom) {
      throw new ConflictException('Room with this name already exists in this campus');
    }

    const room = await this.prisma.room.create({
      data: {
        name: createRoomDto.name,
        campus: createRoomDto.campus,
        capacity: createRoomDto.capacity,
        technologies: {
          create: createRoomDto.technologyIds?.map(techId => ({
            technologyId: techId,
          })) || [],
        },
      },
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
      },
    });

    return room;
  }

  async findAll(campus?: Campus): Promise<Room[]> {
    return this.prisma.room.findMany({
      where: campus ? { campus } : undefined,
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: [
        { campus: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);

    if (updateRoomDto.name && updateRoomDto.campus) {
      const existingRoom = await this.prisma.room.findFirst({
        where: {
          name: updateRoomDto.name,
          campus: updateRoomDto.campus,
          id: { not: id },
        },
      });

      if (existingRoom) {
        throw new ConflictException('Room with this name already exists in this campus');
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Room> {
    const room = await this.findOne(id);
    
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async addTechnology(id: string, addTechnologyDto: AddTechnologyDto): Promise<Room> {
    const room = await this.findOne(id);

    const existingRelation = await this.prisma.roomTechnology.findUnique({
      where: {
        roomId_technologyId: {
          roomId: id,
          technologyId: addTechnologyDto.technologyId,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictException('Technology already added to this room');
    }

    await this.prisma.roomTechnology.create({
      data: {
        roomId: id,
        technologyId: addTechnologyDto.technologyId,
      },
    });

    return this.findOne(id);
  }

  async removeTechnology(id: string, technologyId: string): Promise<Room> {
    const room = await this.findOne(id);

    await this.prisma.roomTechnology.delete({
      where: {
        roomId_technologyId: {
          roomId: id,
          technologyId,
        },
      },
    });

    return this.findOne(id);
  }

  async getAvailableRooms(
    campus?: Campus,
    capacity?: number,
    technologyIds?: string[],
    startTime?: Date,
    endTime?: Date,
  ): Promise<Room[]> {
    const where: any = {
      isActive: true,
    };

    if (campus) {
      where.campus = campus;
    }

    if (capacity) {
      where.capacity = { gte: capacity };
    }

    if (technologyIds && technologyIds.length > 0) {
      where.technologies = {
        some: {
          technologyId: { in: technologyIds },
        },
      };
    }

    if (startTime && endTime) {
      where.NOT = {
        bookings: {
          some: {
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
        },
      };
    }

    return this.prisma.room.findMany({
      where,
      include: {
        technologies: {
          include: {
            technology: true,
          },
        },
      },
      orderBy: [
        { campus: 'asc' },
        { name: 'asc' },
      ],
    });
  }
}
