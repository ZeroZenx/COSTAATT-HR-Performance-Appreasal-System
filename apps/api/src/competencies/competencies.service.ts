import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompetencyCluster } from '@costaatt/shared';

@Injectable()
export class CompetenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    cluster?: CompetencyCluster;
    department?: string;
    active?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters.cluster) {
      where.cluster = filters.cluster;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { definition: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.competency.findMany({
      where,
      orderBy: [
        { cluster: 'asc' },
        { department: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async findById(id: string) {
    const competency = await this.prisma.competency.findUnique({
      where: { id },
    });

    if (!competency) {
      throw new NotFoundException('Competency not found');
    }

    return competency;
  }

  async create(data: {
    code: string;
    title: string;
    cluster: CompetencyCluster;
    department: string;
    definition: string;
    behaviorsBasic: string;
    behaviorsAbove: string;
    behaviorsOutstanding: string;
  }) {
    // Check if code already exists
    const existing = await this.prisma.competency.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new BadRequestException('Competency code already exists');
    }

    return this.prisma.competency.create({
      data,
    });
  }

  async update(id: string, data: {
    code?: string;
    title?: string;
    cluster?: CompetencyCluster;
    department?: string;
    definition?: string;
    behaviorsBasic?: string;
    behaviorsAbove?: string;
    behaviorsOutstanding?: string;
    active?: boolean;
  }) {
    const competency = await this.prisma.competency.findUnique({
      where: { id },
    });

    if (!competency) {
      throw new NotFoundException('Competency not found');
    }

    // Check if new code already exists (if changing code)
    if (data.code && data.code !== competency.code) {
      const existing = await this.prisma.competency.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new BadRequestException('Competency code already exists');
      }
    }

    return this.prisma.competency.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const competency = await this.prisma.competency.findUnique({
      where: { id },
      include: {
        selections: true,
      },
    });

    if (!competency) {
      throw new NotFoundException('Competency not found');
    }

    // Check if competency is being used in appraisals
    if (competency.selections.length > 0) {
      throw new BadRequestException('Cannot delete competency that is being used in appraisals');
    }

    return this.prisma.competency.delete({
      where: { id },
    });
  }

  async getDepartments() {
    const departments = await this.prisma.competency.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });

    return departments.map(d => d.department);
  }

  async getCompetencyStats() {
    const total = await this.prisma.competency.count();
    const active = await this.prisma.competency.count({ where: { active: true } });
    const inactive = total - active;

    const byCluster = await this.prisma.competency.groupBy({
      by: ['cluster'],
      _count: { cluster: true },
    });

    const byDepartment = await this.prisma.competency.groupBy({
      by: ['department'],
      _count: { department: true },
    });

    return {
      total,
      active,
      inactive,
      byCluster: byCluster.reduce((acc, item) => {
        acc[item.cluster] = item._count.cluster;
        return acc;
      }, {} as Record<string, number>),
      byDepartment: byDepartment.reduce((acc, item) => {
        acc[item.department] = item._count.department;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async bulkCreate(competencies: Array<{
    code: string;
    title: string;
    cluster: CompetencyCluster;
    department: string;
    definition: string;
    behaviorsBasic: string;
    behaviorsAbove: string;
    behaviorsOutstanding: string;
  }>) {
    // Check for duplicate codes
    const codes = competencies.map(c => c.code);
    const existingCodes = await this.prisma.competency.findMany({
      where: { code: { in: codes } },
      select: { code: true },
    });

    if (existingCodes.length > 0) {
      throw new BadRequestException(`Duplicate codes found: ${existingCodes.map(c => c.code).join(', ')}`);
    }

    return this.prisma.competency.createMany({
      data: competencies,
    });
  }
}

