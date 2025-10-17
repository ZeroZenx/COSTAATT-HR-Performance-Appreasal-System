// Enhanced local data integration for chatbot
// This shows how to add more local data sources

class EnhancedChatbotData {
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get comprehensive user context
   */
  async getUserContext(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: {
          include: {
            supervisor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    title: true
                  }
                }
              }
            },
            appraisalInstances: {
              where: {
                status: {
                  in: ['DRAFT', 'IN_REVIEW', 'AWAITING_HR', 'COMPLETED']
                }
              },
              include: {
                template: true,
                cycle: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            }
          }
        }
      }
    });

    return user;
  }

  /**
   * Get appraisal-related data
   */
  async getAppraisalData(userId) {
    const appraisals = await this.prisma.appraisalInstance.findMany({
      where: {
        OR: [
          { employeeId: userId }, // User's own appraisals
          { createdBy: userId }   // Appraisals created by user
        ]
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        template: true,
        cycle: true,
        sections: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return appraisals;
  }

  /**
   * Get department and organizational data
   */
  async getDepartmentData(deptName = null) {
    // Get employees by department name since we don't have a separate Department model
    const employees = await this.prisma.employee.findMany({
      where: deptName ? { dept: deptName } : {},
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            title: true
          }
        },
        supervisor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                title: true
              }
            }
          }
        }
      }
    });

    return employees;
  }

  /**
   * Get current appraisal cycles and templates
   */
  async getCurrentAppraisalInfo() {
    const currentDate = new Date();
    
    const activeCycles = await this.prisma.appraisalCycle.findMany({
      where: {
        AND: [
          { periodStart: { lte: currentDate } },
          { periodEnd: { gte: currentDate } }
        ]
      },
      include: {
        appraisalInstances: {
          include: {
            template: true
          }
        }
      }
    });

    const upcomingCycles = await this.prisma.appraisalCycle.findMany({
      where: {
        periodStart: { gt: currentDate }
      },
      orderBy: {
        periodStart: 'asc'
      },
      take: 3
    });

    return {
      active: activeCycles,
      upcoming: upcomingCycles
    };
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers = await this.prisma.user.count({
      where: { active: true }
    });
    
    const totalAppraisals = await this.prisma.appraisalInstance.count();
    const pendingAppraisals = await this.prisma.appraisalInstance.count({
      where: {
        status: {
          in: ['DRAFT', 'IN_REVIEW', 'AWAITING_HR']
        }
      }
    });

    const completedAppraisals = await this.prisma.appraisalInstance.count({
      where: { status: 'COMPLETED' }
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers
      },
      appraisals: {
        total: totalAppraisals,
        pending: pendingAppraisals,
        completed: completedAppraisals
      }
    };
  }

  /**
   * Build comprehensive context for chatbot
   */
  async buildChatbotContext(userId) {
    const userContext = await this.getUserContext(userId);
    
    const [
      appraisalData,
      departmentData,
      appraisalInfo,
      systemStats
    ] = await Promise.all([
      this.getAppraisalData(userId),
      this.getDepartmentData(userContext?.employee?.dept),
      this.getCurrentAppraisalInfo(),
      this.getSystemStats()
    ]);

    return {
      user: userContext,
      appraisals: appraisalData,
      departments: departmentData,
      appraisalCycles: appraisalInfo,
      systemStats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate context-aware system prompt
   */
  async generateSystemPrompt(userId) {
    const context = await this.buildChatbotContext(userId);
    
    const user = context.user;
    const employee = user?.employee;
    
    let systemPrompt = `You are the COSTAATT HR Digital Assistant, an AI-powered chatbot designed to help staff with HR-related questions and tasks.

## USER CONTEXT:
- Name: ${user?.firstName} ${user?.lastName}
- Role: ${user?.role}
- Email: ${user?.email}
- Department: ${employee?.dept || 'Not assigned'}
- Position: ${user?.title || 'Not specified'}
- Supervisor: ${employee?.supervisor?.user ? `${employee.supervisor.user.firstName} ${employee.supervisor.user.lastName}` : 'Not assigned'}

## CURRENT APPRAISAL STATUS:
`;

    if (employee?.appraisalInstances?.length > 0) {
      const latestAppraisal = employee.appraisalInstances[0];
      systemPrompt += `- Latest Appraisal: ${latestAppraisal.status} (${latestAppraisal.template?.name || 'Unknown template'})
- Cycle: ${latestAppraisal.cycle?.name || 'Unknown cycle'}
- Created: ${new Date(latestAppraisal.createdAt).toLocaleDateString()}
`;
    } else {
      systemPrompt += `- No recent appraisals found
`;
    }

    systemPrompt += `
## ACTIVE APPRAISAL CYCLES:
`;

    if (context.appraisalCycles.active.length > 0) {
      context.appraisalCycles.active.forEach(cycle => {
        systemPrompt += `- ${cycle.name}: ${new Date(cycle.periodStart).toLocaleDateString()} to ${new Date(cycle.periodEnd).toLocaleDateString()}
`;
      });
    } else {
      systemPrompt += `- No active appraisal cycles
`;
    }

    systemPrompt += `
## SYSTEM STATISTICS:
- Total Users: ${context.systemStats.users.total}
- Active Users: ${context.systemStats.users.active}
- Total Appraisals: ${context.systemStats.appraisals.total}
- Pending Appraisals: ${context.systemStats.appraisals.pending}
- Completed Appraisals: ${context.systemStats.appraisals.completed}

## CAPABILITIES:
You can help with:
1. Appraisal-related questions and guidance
2. User account and profile information
3. Department and organizational structure
4. HR policies and procedures
5. System navigation and troubleshooting
6. General HR inquiries

## IMPORTANT NOTES:
- Always maintain professionalism and confidentiality
- Provide accurate information based on the user's context
- If you don't know something, suggest contacting HR directly
- Be helpful and concise in your responses
- Use the user's name and context to personalize responses

Current date and time: ${new Date().toLocaleString()}`;

    return systemPrompt;
  }
}

module.exports = EnhancedChatbotData;
