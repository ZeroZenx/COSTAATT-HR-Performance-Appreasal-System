import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './scoring.service';
import { UserRole, AppraisalStatus, CompetencyCluster } from '@costaatt/shared';

@Injectable()
export class AppraisalsService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  async findAll(filters: {
    employeeId?: string;
    supervisorId?: string;
    cycleId?: string;
    templateId?: string;
    status?: AppraisalStatus;
    dept?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.supervisorId) {
      where.supervisorId = filters.supervisorId;
    }

    if (filters.cycleId) {
      where.cycleId = filters.cycleId;
    }

    if (filters.templateId) {
      where.templateId = filters.templateId;
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

    return this.prisma.appraisal.findMany({
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
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        template: true,
        cycle: true,
        sectionScores: true,
        competencySelections: {
          include: {
            competency: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const appraisal = await this.prisma.appraisal.findUnique({
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
        supervisor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        template: true,
        cycle: true,
        sectionScores: true,
        criterionScores: true,
        goals: true,
        studentEvaluations: true,
        evidence: {
          include: {
            uploadedBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        midYearReview: true,
        signatures: true,
        competencySelections: {
          include: {
            competency: true,
          },
        },
      },
    });

    if (!appraisal) {
      throw new NotFoundException('Appraisal not found');
    }

    return appraisal;
  }

  async create(data: {
    employeeId: string;
    supervisorId: string;
    templateId: string;
    cycleId: string;
    competencyIds: string[];
  }) {
    // Validate employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate supervisor exists
    const supervisor = await this.prisma.user.findUnique({
      where: { id: data.supervisorId },
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    // Validate template exists
    const template = await this.prisma.appraisalTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Validate cycle exists and is active
    const cycle = await this.prisma.appraisalCycle.findUnique({
      where: { id: data.cycleId },
    });

    if (!cycle) {
      throw new NotFoundException('Appraisal cycle not found');
    }

    if (cycle.status !== 'ACTIVE') {
      throw new BadRequestException('Appraisal cycle is not active');
    }

    // Validate competencies
    const competencies = await this.prisma.competency.findMany({
      where: { id: { in: data.competencyIds } },
    });

    if (competencies.length !== data.competencyIds.length) {
      throw new BadRequestException('One or more competencies not found');
    }

    // Validate competency selection limits
    const coreCompetencies = competencies.filter(c => c.cluster === CompetencyCluster.CORE);
    const functionalCompetencies = competencies.filter(c => c.cluster === CompetencyCluster.FUNCTIONAL);

    if (coreCompetencies.length > 4) {
      throw new BadRequestException('Maximum 4 core competencies allowed');
    }

    if (functionalCompetencies.length > 6) {
      throw new BadRequestException('Maximum 6 functional competencies allowed');
    }

    if (competencies.length > 12) {
      throw new BadRequestException('Maximum 12 total competencies allowed');
    }

    // Create appraisal
    const appraisal = await this.prisma.appraisal.create({
      data: {
        employeeId: data.employeeId,
        supervisorId: data.supervisorId,
        templateId: data.templateId,
        cycleId: data.cycleId,
        status: AppraisalStatus.DRAFT,
      },
    });

    // Create competency selections
    await this.prisma.competencySelection.createMany({
      data: competencies.map(comp => ({
        appraisalId: appraisal.id,
        competencyId: comp.id,
        type: comp.cluster,
      })),
    });

    return this.findById(appraisal.id);
  }

  async updateStatus(id: string, status: AppraisalStatus) {
    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id },
    });

    if (!appraisal) {
      throw new NotFoundException('Appraisal not found');
    }

    return this.prisma.appraisal.update({
      where: { id },
      data: { status },
    });
  }

  async submitForAcknowledgment(id: string) {
    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id },
    });

    if (!appraisal) {
      throw new NotFoundException('Appraisal not found');
    }

    if (appraisal.status !== AppraisalStatus.DRAFT) {
      throw new BadRequestException('Appraisal must be in draft status to submit');
    }

    return this.updateStatus(id, AppraisalStatus.IN_REVIEW);
  }

  async signAppraisal(id: string, signerId: string, role: 'EMPLOYEE' | 'SUPERVISOR' | 'REVIEWER') {
    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id },
      include: {
        signatures: true,
      },
    });

    if (!appraisal) {
      throw new NotFoundException('Appraisal not found');
    }

    // Check if already signed by this role
    const existingSignature = appraisal.signatures.find(s => s.role === role);
    if (existingSignature) {
      throw new BadRequestException(`Appraisal already signed by ${role}`);
    }

    // Validate signing order
    if (role === 'EMPLOYEE' && !appraisal.signatures.find(s => s.role === 'SUPERVISOR')) {
      throw new BadRequestException('Supervisor must sign before employee');
    }

    if (role === 'REVIEWER' && !appraisal.signatures.find(s => s.role === 'EMPLOYEE')) {
      throw new BadRequestException('Employee must sign before reviewer');
    }

    const signer = await this.prisma.user.findUnique({
      where: { id: signerId },
    });

    if (!signer) {
      throw new NotFoundException('Signer not found');
    }

    // Generate signature hash (simplified - in production, use proper PDF hash)
    const signatureHash = this.generateSignatureHash(appraisal.id, signer.email);

    const signature = await this.prisma.signature.create({
      data: {
        appraisalId: id,
        role: role as any,
        signerName: `${signer.firstName} ${signer.lastName}`,
        signerEmail: signer.email,
        signedAt: new Date(),
        signatureHash,
      },
    });

    // Update appraisal status based on signatures
    let newStatus = appraisal.status;
    if (role === 'SUPERVISOR') {
      newStatus = AppraisalStatus.IN_REVIEW;
    } else if (role === 'EMPLOYEE') {
      newStatus = AppraisalStatus.EMP_ACK;
    } else if (role === 'REVIEWER') {
      newStatus = AppraisalStatus.APPROVED;
    }

    await this.prisma.appraisal.update({
      where: { id },
      data: { status: newStatus as any },
    });

    return signature;
  }

  private generateSignatureHash(appraisalId: string, signerEmail: string): string {
    // In production, this should hash the actual PDF content
    const crypto = require('crypto');
    const data = `${appraisalId}-${signerEmail}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async canAccessAppraisal(userId: string, userRole: UserRole, appraisalId: string): Promise<boolean> {
    // HR Admin can access all appraisals
    if (userRole === UserRole.HR_ADMIN) {
      return true;
    }

    const appraisal = await this.prisma.appraisal.findUnique({
      where: { id: appraisalId },
      select: {
        employeeId: true,
        supervisorId: true,
        employee: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!appraisal) {
      return false;
    }

    // Supervisors can access their team's appraisals
    if (userRole === UserRole.SUPERVISOR && appraisal.supervisorId === userId) {
      return true;
    }

    // Employees can access their own appraisals
    if (userRole === UserRole.EMPLOYEE && appraisal.employee.userId === userId) {
      return true;
    }

    return false;
  }
}

