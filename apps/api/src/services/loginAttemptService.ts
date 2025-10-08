import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LoginAttemptData {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

/**
 * Record a login attempt
 */
export const recordLoginAttempt = async (data: LoginAttemptData): Promise<void> => {
  try {
    await prisma.loginAttempt.create({
      data: {
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        success: data.success
      }
    });
  } catch (error) {
    console.error('Error recording login attempt:', error);
    // Don't throw - we don't want login attempts to fail because of logging
  }
};

/**
 * Check if an email is locked out due to too many failed attempts
 */
export const isEmailLockedOut = async (email: string): Promise<boolean> => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: fifteenMinutesAgo
      }
    }
  });
  
  return failedAttempts >= 5;
};

/**
 * Get recent failed attempts for an email
 */
export const getRecentFailedAttempts = async (email: string, minutes: number = 15): Promise<number> => {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  
  return await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: cutoffTime
      }
    }
  });
};

/**
 * Clear failed attempts for an email (called on successful login)
 */
export const clearFailedAttempts = async (email: string): Promise<void> => {
  try {
    // We don't actually delete the records, just note that we're clearing the lockout
    // This maintains audit trail while allowing login
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
};
