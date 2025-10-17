import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnologyDto, UpdateTechnologyDto } from './dto';
import { Technology } from '@prisma/client';

@Injectable()
export class TechnologiesService {
  constructor(private prisma: PrismaService) {}

  async create(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    const existingTechnology = await this.prisma.technology.findUnique({
      where: { name: createTechnologyDto.name },
    });

    if (existingTechnology) {
      throw new ConflictException('Technology with this name already exists');
    }

    return this.prisma.technology.create({
      data: createTechnologyDto,
    });
  }

  async findAll(): Promise<Technology[]> {
    return this.prisma.technology.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Technology> {
    const technology = await this.prisma.technology.findUnique({
      where: { id },
      include: {
        rooms: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!technology) {
      throw new NotFoundException('Technology not found');
    }

    return technology;
  }

  async update(id: string, updateTechnologyDto: UpdateTechnologyDto): Promise<Technology> {
    const technology = await this.findOne(id);

    if (updateTechnologyDto.name && updateTechnologyDto.name !== technology.name) {
      const existingTechnology = await this.prisma.technology.findUnique({
        where: { name: updateTechnologyDto.name },
      });

      if (existingTechnology) {
        throw new ConflictException('Technology with this name already exists');
      }
    }

    return this.prisma.technology.update({
      where: { id },
      data: updateTechnologyDto,
    });
  }

  async remove(id: string): Promise<Technology> {
    const technology = await this.findOne(id);
    
    return this.prisma.technology.delete({
      where: { id },
    });
  }
}
