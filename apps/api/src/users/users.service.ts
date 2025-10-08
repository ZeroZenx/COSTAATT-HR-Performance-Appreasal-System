import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@costaatt/shared';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        division: true,
        title: true,
        managerId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        division: true,
        title: true,
        managerId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(filters: {
    role?: UserRole;
    dept?: string;
    active?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.dept) {
      where.dept = filters.dept;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        division: true,
        title: true,
        managerId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    dept?: string;
    title?: string;
    managerId?: string;
    active?: boolean;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        division: true,
        title: true,
        managerId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by setting active to false
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
  }

  async getSubordinates(userId: string) {
    return this.prisma.user.findMany({
      where: { managerId: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        division: true,
        title: true,
        managerId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async canAccessUser(currentUserId: string, targetUserId: string, currentUserRole: UserRole): Promise<boolean> {
    // HR Admin can access anyone
    if (currentUserRole === UserRole.HR_ADMIN) {
      return true;
    }

    // Users can access themselves
    if (currentUserId === targetUserId) {
      return true;
    }

    // Supervisors can access their subordinates
    if (currentUserRole === UserRole.SUPERVISOR) {
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { managerId: true },
      });

      return targetUser?.managerId === currentUserId;
    }

    return false;
  }
}

