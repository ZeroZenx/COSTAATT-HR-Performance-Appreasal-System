import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppraisalCyclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appraisalCycle.findMany({
      orderBy: { periodStart: 'desc' },
    });
  }

  async findById(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
      include: {
        appraisals: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            template: true,
          },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    return cycle;
  }

  async create(data: {
    name: string;
    periodStart: Date;
    periodEnd: Date;
    status?: string;
  }) {
    // Validate that period start is before period end
    if (data.periodStart >= data.periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }

    // Check for overlapping cycles
    const overlappingCycle = await this.prisma.appraisalCycle.findFirst({
      where: {
        OR: [
          {
            periodStart: {
              lte: data.periodEnd,
            },
            periodEnd: {
              gte: data.periodStart,
            },
          },
        ],
      },
    });

    if (overlappingCycle) {
      throw new BadRequestException('Overlapping appraisal cycle already exists');
    }

    return this.prisma.appraisalCycle.create({
      data: {
        ...data,
        status: data.status || 'PLANNED',
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    periodStart?: Date;
    periodEnd?: Date;
    status?: string;
  }) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    // Validate period dates if provided
    if (data.periodStart && data.periodEnd && data.periodStart >= data.periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }

    // Check for overlapping cycles (excluding current cycle)
    if (data.periodStart || data.periodEnd) {
      const startDate = data.periodStart || cycle.periodStart;
      const endDate = data.periodEnd || cycle.periodEnd;

      const overlappingCycle = await this.prisma.appraisalCycle.findFirst({
        where: {
          id: { not: id },
          OR: [
            {
              periodStart: {
                lte: endDate,
              },
              periodEnd: {
                gte: startDate,
              },
            },
          ],
        },
      });

      if (overlappingCycle) {
        throw new BadRequestException('Overlapping appraisal cycle already exists');
      }
    }

    return this.prisma.appraisalCycle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
      include: {
        appraisals: true,
      },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    // Check if cycle has appraisals
    if (cycle.appraisals.length > 0) {
      throw new BadRequestException('Cannot delete cycle with existing appraisals');
    }

    return this.prisma.appraisalCycle.delete({
      where: { id },
    });
  }

  async getActiveCycle() {
    const now = new Date();
    return this.prisma.appraisalCycle.findFirst({
      where: {
        status: 'ACTIVE',
        periodStart: { lte: now },
        periodEnd: { gte: now },
      },
    });
  }

  async activateCycle(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    // Deactivate all other cycles
    await this.prisma.appraisalCycle.updateMany({
      where: {
        status: 'ACTIVE',
      },
      data: {
        status: 'CLOSED',
      },
    });

    // Activate the selected cycle
    return this.prisma.appraisalCycle.update({
      where: { id },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  async closeCycle(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    return this.prisma.appraisalCycle.update({
      where: { id },
      data: {
        status: 'CLOSED',
      },
    });
  }

  async getCycleStats(id: string) {
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id },
      include: {
        appraisals: {
          include: {
            employee: {
              include: {
                user: {
                  select: {
                    dept: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    const totalAppraisals = cycle.appraisals.length;
    const completedAppraisals = cycle.appraisals.filter(a => a.status === 'CLOSED').length;
    const inProgressAppraisals = cycle.appraisals.filter(a => 
      ['DRAFT', 'IN_REVIEW', 'EMP_ACK', 'APPROVED'].includes(a.status)
    ).length;

    // Department breakdown
    const deptStats = cycle.appraisals.reduce((acc, appraisal) => {
      const dept = appraisal.employee.user.dept;
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0, inProgress: 0 };
      }
      acc[dept].total++;
      if (appraisal.status === 'CLOSED') {
        acc[dept].completed++;
      } else if (['DRAFT', 'IN_REVIEW', 'EMP_ACK', 'APPROVED'].includes(appraisal.status)) {
        acc[dept].inProgress++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number; inProgress: number }>);

    return {
      cycle,
      stats: {
        totalAppraisals,
        completedAppraisals,
        inProgressAppraisals,
        completionRate: totalAppraisals > 0 ? (completedAppraisals / totalAppraisals) * 100 : 0,
        deptStats,
      },
    };
  }
}

