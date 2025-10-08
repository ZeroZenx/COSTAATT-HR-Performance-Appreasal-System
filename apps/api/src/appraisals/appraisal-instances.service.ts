import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './scoring.service';

@Injectable()
export class AppraisalInstancesService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  async findAll(filters: {
    employeeId?: string;
    templateId?: string;
    cycleId?: string;
    status?: string;
    dept?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.templateId) {
      where.templateId = filters.templateId;
    }

    if (filters.cycleId) {
      where.cycleId = filters.cycleId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dept) {
      where.employee = {
        dept: filters.dept,
      };
    }

    if (filters.search) {
      where.employee = {
        ...where.employee,
        user: {
          OR: [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        },
      };
    }

    return this.prisma.appraisalInstance.findMany({
      where,
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                division: true,
                title: true,
              },
            },
          },
        },
        template: true,
        cycle: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const instance = await this.prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                division: true,
                title: true,
              },
            },
          },
        },
        template: true,
        cycle: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException('Appraisal instance not found');
    }

    return instance;
  }

  async create(data: {
    employeeId: string;
    templateId: string;
    cycleId: string;
    createdBy: string;
    options?: {
      selfAssessment?: boolean;
      peerFeedback?: boolean;
      studentEvaluations?: boolean;
      projectsEnabled?: boolean;
    };
  }) {
    // Validate employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate template exists
    const template = await this.prisma.appraisalTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Validate cycle exists
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id: data.cycleId },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    // Validate creator exists
    const creator = await this.prisma.user.findUnique({
      where: { id: data.createdBy },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Check if appraisal already exists for this employee/cycle/template combination
    const existingInstance = await this.prisma.appraisalInstance.findFirst({
      where: {
        employeeId: data.employeeId,
        cycleId: data.cycleId,
        templateId: data.templateId,
      },
    });

    if (existingInstance) {
      throw new BadRequestException('Appraisal instance already exists for this employee, cycle, and template combination');
    }

    // Create appraisal instance
    const instance = await this.prisma.appraisalInstance.create({
      data: {
        employeeId: data.employeeId,
        templateId: data.templateId,
        cycleId: data.cycleId,
        createdBy: data.createdBy,
        status: 'DRAFT',
        options: data.options || {},
        sections: [], // Initialize with empty sections
      },
    });

    return this.findById(instance.id);
  }

  async updateSections(id: string, sections: any[]) {
    const instance = await this.prisma.appraisalInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      throw new NotFoundException('Appraisal instance not found');
    }

    // Update sections
    const updatedInstance = await this.prisma.appraisalInstance.update({
      where: { id },
      data: { sections },
    });

    // Calculate scores
    const scores = await this.scoringService.calculateAppraisalScore(id);
    
    // Update with calculated scores
    return this.prisma.appraisalInstance.update({
      where: { id },
      data: {
        finalScore: scores.finalScore,
        finalBand: scores.ratingBand,
      },
    });
  }

  async submitForReview(id: string) {
    const instance = await this.prisma.appraisalInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      throw new NotFoundException('Appraisal instance not found');
    }

    if (instance.status !== 'DRAFT') {
      throw new BadRequestException('Appraisal must be in draft status to submit');
    }

    return this.prisma.appraisalInstance.update({
      where: { id },
      data: { status: 'MANAGER_REVIEW' },
    });
  }

  async finalize(id: string) {
    const instance = await this.prisma.appraisalInstance.findUnique({
      where: { id },
    });

    if (!instance) {
      throw new NotFoundException('Appraisal instance not found');
    }

    if (instance.status !== 'MANAGER_REVIEW') {
      throw new BadRequestException('Appraisal must be in manager review status to finalize');
    }

    return this.prisma.appraisalInstance.update({
      where: { id },
      data: { status: 'FINAL' },
    });
  }

  async getTemplates() {
    return this.prisma.appraisalTemplate.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        displayName: true,
        version: true,
      },
    });
  }

  async getCycles() {
    return this.prisma.appraisalCycle.findMany({
      select: {
        id: true,
        name: true,
        periodStart: true,
        periodEnd: true,
        status: true,
      },
      orderBy: { periodStart: 'desc' },
    });
  }
}
