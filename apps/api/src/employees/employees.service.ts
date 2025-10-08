import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    dept?: string;
    division?: string;
    employmentType?: string;
    supervisorId?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters.dept) {
      where.dept = filters.dept;
    }

    if (filters.division) {
      where.division = filters.division;
    }

    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }

    if (filters.supervisorId) {
      where.supervisorId = filters.supervisorId;
    }

    if (filters.search) {
      where.user = {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    return this.prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            division: true,
            title: true,
            active: true,
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: { lastName: 'asc' },
      },
    });
  }

  async findById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            division: true,
            title: true,
            active: true,
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        subordinates: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async create(data: {
    userId: string;
    dept: string;
    division: string;
    employmentType: string;
    supervisorId?: string;
    contractTerm?: string;
  }) {
    return this.prisma.employee.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            division: true,
            title: true,
            active: true,
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: {
    dept?: string;
    division?: string;
    employmentType?: string;
    supervisorId?: string;
    contractTerm?: string;
  }) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            division: true,
            title: true,
            active: true,
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async getSubordinates(employeeId: string) {
    return this.prisma.employee.findMany({
      where: { supervisorId: employeeId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            division: true,
            title: true,
            active: true,
          },
        },
      },
      orderBy: {
        user: { lastName: 'asc' },
      },
    });
  }

  async getDepartments() {
    const departments = await this.prisma.employee.findMany({
      select: { division: true },
      distinct: ['division'],
      orderBy: { division: 'asc' },
    });

    return departments.map(d => d.division);
  }

  async getDivisions() {
    const divisions = await this.prisma.employee.findMany({
      select: { division: true },
      distinct: ['division'],
      orderBy: { division: 'asc' },
    });

    return divisions.map(d => d.division);
  }

  async getEmploymentTypes() {
    const types = await this.prisma.employee.findMany({
      select: { employmentType: true },
      distinct: ['employmentType'],
      orderBy: { employmentType: 'asc' },
    });

    return types.map(t => t.employmentType);
  }
}

