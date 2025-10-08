import { Request, Response } from 'express';
import { PrismaClient, AuthProvider, UserRole } from '@prisma/client';
import { hashPassword, validatePassword, generatePassword } from '../utils/password';
import { recordLoginAttempt } from '../services/loginAttemptService';

const prisma = new PrismaClient();

/**
 * Create a new local user (HR_ADMIN only)
 */
export const createLocalUser = async (req: Request, res: Response) => {
  try {
    // Check if local auth is enabled
    if (process.env.ALLOW_LOCAL_AUTH !== 'true') {
      return res.status(400).json({ 
        success: false, 
        message: 'Local authentication is disabled' 
      });
    }

    const { email, firstName, lastName, role, password, mustChangePassword = false } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !role || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, first name, last name, role, and password are required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, Number(process.env.PASSWORD_MIN_LENGTH || 10));
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.authProvider === AuthProvider.SSO) {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is used by SSO. Choose another email.' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: role as UserRole,
        authProvider: AuthProvider.LOCAL,
        passwordHash,
        mustChangePassword,
        dept: 'Human Resources', // Default department
        title: 'Employee', // Default title
        active: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        authProvider: true,
        mustChangePassword: true,
        createdAt: true
      }
    });

    // Log the creation
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        action: 'CREATE',
        entity: 'user',
        entityId: user.id,
        newValues: {
          email: user.email,
          role: user.role,
          authProvider: user.authProvider
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error creating local user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Reset user password (HR_ADMIN only)
 */
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required' 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password, Number(process.env.PASSWORD_MIN_LENGTH || 10));
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if user exists and is LOCAL
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.authProvider !== AuthProvider.LOCAL) {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only reset passwords for local users' 
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true // Force password change on next login
      }
    });

    // Log the password reset
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        action: 'UPDATE',
        entity: 'user',
        entityId: user.id,
        newValues: {
          passwordReset: true,
          mustChangePassword: true
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get all users (HR_ADMIN only)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        authProvider: true,
        active: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Toggle user active status (HR_ADMIN only)
 */
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        active: !user.active
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        authProvider: true,
        active: true,
        updatedAt: true
      }
    });

    // Log the status change
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        action: 'UPDATE',
        entity: 'user',
        entityId: user.id,
        oldValues: { active: user.active },
        newValues: { active: updatedUser.active },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
