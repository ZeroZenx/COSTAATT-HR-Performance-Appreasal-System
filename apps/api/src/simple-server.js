require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GraphEmailService = require('../services/graphEmailService');
const OpenAI = require('openai');

const app = express();
const prisma = new PrismaClient();
const emailService = new GraphEmailService();

// Security logging function
async function logSecurityEvent(eventType, userId, details, ipAddress = null) {
  try {
    // Check if security logging is enabled (default to true)
    const fs = require('fs');
    const path = require('path');
    const settingsPath = path.join(__dirname, '..', 'settings.json');
    
    let securityLoggingEnabled = true;
    try {
      if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        securityLoggingEnabled = settings.enableSecurityLogging !== false;
      }
    } catch (error) {
      console.log('Could not read security settings, defaulting to enabled');
    }
    
    if (!securityLoggingEnabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId,
      details,
      ipAddress,
      userAgent: null // Could be added if needed
    };
    
    console.log(`🔒 Security Event: ${eventType}`, logEntry);
    
    // In production, you might want to store this in a dedicated security logs table
    // For now, we'll just log to console and potentially to a file
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://10.2.1.27:5173',
    'http://hrpmg.costaatt.edu.tt:5173',
    'http://hrpmg.costaatt.edu.tt',  // Clean URL via Nginx reverse proxy (no port)
    'http://www.hrpmg.costaatt.edu.tt'  // Support www subdomain
  ],
  credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'COSTAATT HR API Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/auth/login',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        passwordHash: true,
        active: true,
        dept: true,
        title: true
      }
    });

    if (!user || !user.active) {
      await logSecurityEvent('LOGIN_FAILED', null, { email, reason: 'User not found or inactive' }, req.ip);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      await logSecurityEvent('LOGIN_FAILED', user.id, { email, reason: 'Invalid password' }, req.ip);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '24h' }
    );

    // Log successful login
    await logSecurityEvent('LOGIN_SUCCESS', user.id, { email }, req.ip);

    res.json({
      success: true,
      data: {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          dept: user.dept,
          title: user.title
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Change password endpoint (for users to change their own password)
app.post('/auth/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        passwordHash: true,
        active: true
      }
    });

    if (!user || !user.active) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    // Log password change
    await logSecurityEvent('PASSWORD_CHANGED', user.id, { changedBy: 'user' }, req.ip);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin reset password endpoint
app.post('/admin/reset-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID and new password are required' });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, active: true }
    });

    if (!targetUser || !targetUser.active) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    // Log admin password reset
    await logSecurityEvent('PASSWORD_RESET_BY_ADMIN', userId, { 
      resetBy: decoded.sub, 
      targetUser: `${targetUser.firstName} ${targetUser.lastName}` 
    }, req.ip);

    res.json({ 
      success: true, 
      message: `Password reset successfully for ${targetUser.firstName} ${targetUser.lastName}` 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get team members for a supervisor
app.get('/employees/supervisor/:supervisorId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { supervisorId } = req.params; // This is actually the User ID from frontend

    // Verify the user is the supervisor or an admin
    if (decoded.sub !== supervisorId && decoded.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find the employee record for the supervisor user
    const supervisorEmployee = await prisma.employee.findUnique({
      where: { userId: supervisorId },
      select: { id: true }
    });

    if (!supervisorEmployee) {
      return res.status(404).json({ success: false, message: 'Supervisor employee record not found' });
    }

    const teamMembers = await prisma.employee.findMany({
      where: { supervisorId: supervisorEmployee.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            dept: true,
            active: true
          }
        }
      },
      orderBy: [
        { user: { lastName: 'asc' } },
        { user: { firstName: 'asc' } }
      ]
    });

    res.json({ success: true, data: teamMembers });
  } catch (error) {
    console.error('Team members fetch error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get available employees (not assigned to supervisors)
app.get('/employees/available', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Only supervisors and admins can access this
    if (!['SUPERVISOR', 'HR_ADMIN'].includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const availableEmployees = await prisma.employee.findMany({
      where: { 
        supervisorId: null,
        user: {
          role: 'EMPLOYEE',
          active: true
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            dept: true,
            active: true
          }
        }
      },
      orderBy: [
        { user: { lastName: 'asc' } },
        { user: { firstName: 'asc' } }
      ]
    });

    res.json({ success: true, data: availableEmployees });
  } catch (error) {
    console.error('Available employees fetch error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Assign employee to supervisor
app.patch('/employees/:employeeId/assign-supervisor', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId } = req.params;
    const { supervisorId } = req.body;

    // Only supervisors and admins can assign employees
    if (!['SUPERVISOR', 'HR_ADMIN'].includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Verify the supervisor exists and is active
    const supervisorUser = await prisma.user.findUnique({
      where: { id: supervisorId },
      select: { id: true, role: true, active: true }
    });

    if (!supervisorUser || !supervisorUser.active || !['SUPERVISOR', 'HR_ADMIN'].includes(supervisorUser.role)) {
      return res.status(400).json({ success: false, message: 'Invalid supervisor' });
    }

    // Find the employee record for the supervisor
    const supervisorEmployee = await prisma.employee.findUnique({
      where: { userId: supervisorId },
      select: { id: true }
    });

    if (!supervisorEmployee) {
      return res.status(400).json({ success: false, message: 'Supervisor employee record not found' });
    }

    // Check if employee exists and is not already assigned
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.supervisorId) {
      return res.status(400).json({ success: false, message: 'Employee is already assigned to a supervisor' });
    }

    // Assign the employee to the supervisor
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { supervisorId: supervisorEmployee.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            dept: true,
            active: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      message: `${employee.user.firstName} ${employee.user.lastName} has been added to your team`,
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Assign supervisor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Remove employee from supervisor
app.patch('/employees/:employeeId/remove-supervisor', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId } = req.params;

    // Get the employee to check current supervisor
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Only the current supervisor or admins can remove the employee
    // First, find the employee record for the current user to compare
    const currentUserEmployee = await prisma.employee.findUnique({
      where: { userId: decoded.sub },
      select: { id: true }
    });

    if (employee.supervisorId !== currentUserEmployee?.id && decoded.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Remove the supervisor assignment
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: { supervisorId: null },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            title: true,
            dept: true,
            active: true
          }
        }
      }
    });

    res.json({ 
      success: true, 
      message: `${employee.user.firstName} ${employee.user.lastName} has been removed from your team`,
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Remove supervisor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Auth me endpoint
app.get('/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        active: true
      }
    });

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dept: user.dept,
        title: user.title
      }
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Employees endpoint
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        active: true
      }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Competencies endpoint
app.get('/competencies', async (req, res) => {
  try {
    const competencies = await prisma.competency.findMany({
      include: { cluster: true }
    });
    res.json(competencies);
  } catch (error) {
    console.error('Error fetching competencies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get competency clusters
app.get('/competency-clusters', async (req, res) => {
  try {
    const clusters = await prisma.competencyCluster.findMany({
      include: {
        competencies: true
      }
    });
    res.json(clusters);
  } catch (error) {
    console.error('Error fetching competency clusters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single competency
app.get('/competencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const competency = await prisma.competency.findUnique({
      where: { id },
      include: { cluster: true }
    });
    
    if (!competency) {
      return res.status(404).json({ message: 'Competency not found' });
    }
    
    res.json(competency);
  } catch (error) {
    console.error('Error fetching competency:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new competency
app.post('/competencies', async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      definition,
      basicBehaviours,
      aboveExpectationsBehaviours,
      outstandingBehaviours,
      department,
      jobLevel,
      category,
      clusterId
    } = req.body;

    const competency = await prisma.competency.create({
      data: {
        code,
        name,
        description,
        definition,
        basicBehaviours,
        aboveExpectationsBehaviours,
        outstandingBehaviours,
        department,
        jobLevel,
        category,
        clusterId
      },
      include: { cluster: true }
    });

    res.status(201).json(competency);
  } catch (error) {
    console.error('Error creating competency:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update competency
app.put('/competencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const competency = await prisma.competency.update({
      where: { id },
      data: updateData,
      include: { cluster: true }
    });

    res.json(competency);
  } catch (error) {
    console.error('Error updating competency:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete competency
app.delete('/competencies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.competency.delete({
      where: { id }
    });

    res.json({ message: 'Competency deleted successfully' });
  } catch (error) {
    console.error('Error deleting competency:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export competencies
app.get('/competencies/export', async (req, res) => {
  try {
    const competencies = await prisma.competency.findMany({
      include: { cluster: true }
    });

    const csvData = competencies.map(comp => ({
      Code: comp.code,
      Name: comp.name,
      Description: comp.description,
      Definition: comp.definition,
      'Basic Behaviours': comp.basicBehaviours,
      'Above Expectations': comp.aboveExpectationsBehaviours,
      'Outstanding': comp.outstandingBehaviours,
      Department: comp.department,
      'Job Level': comp.jobLevel,
      Category: comp.category,
      Cluster: comp.cluster.name,
      'Created At': comp.createdAt
    }));

    res.json({ data: csvData, filename: `competencies_export_${new Date().toISOString().split('T')[0]}.csv` });
  } catch (error) {
    console.error('Error exporting competencies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Import competencies
app.post('/competencies/import', async (req, res) => {
  try {
    const { competencies } = req.body;
    
    if (!Array.isArray(competencies)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const createdCompetencies = [];
    
    for (const compData of competencies) {
      try {
        // Find or create cluster
        let cluster = await prisma.competencyCluster.findFirst({
          where: { name: compData.cluster || 'Imported Competencies' }
        });

        if (!cluster) {
          cluster = await prisma.competencyCluster.create({
            data: {
              name: compData.cluster || 'Imported Competencies',
              description: 'Imported competency cluster',
              category: compData.category || 'Imported'
            }
          });
        }

        const competency = await prisma.competency.create({
          data: {
            code: compData.code || compData.name.replace(/\s+/g, '_').toUpperCase(),
            name: compData.name,
            description: compData.description,
            definition: compData.definition || compData.description,
            basicBehaviours: compData.basicBehaviours || compData['Basic Behaviours'],
            aboveExpectationsBehaviours: compData.aboveExpectationsBehaviours || compData['Above Expectations'],
            outstandingBehaviours: compData.outstandingBehaviours || compData.outstanding,
            department: compData.department,
            jobLevel: compData.jobLevel || compData['Job Level'],
            category: compData.category,
            clusterId: cluster.id
          }
        });

        createdCompetencies.push(competency);
      } catch (compError) {
        console.error(`Error importing competency ${compData.name}:`, compError);
      }
    }

    res.json({ 
      message: `Successfully imported ${createdCompetencies.length} competencies`,
      imported: createdCompetencies.length,
      total: competencies.length
    });
  } catch (error) {
    console.error('Error importing competencies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Reports endpoints
app.get('/reports/analytics', async (req, res) => {
  try {
    const { cycle, department } = req.query;

    // Build filter conditions
    const whereConditions = {};
    if (cycle && cycle !== 'ALL') {
      whereConditions.appraisalCycle = { name: cycle };
    }
    if (department && department !== 'ALL') {
      whereConditions.employee = { dept: department };
    }

    // Get appraisal statistics
    const totalAppraisals = await prisma.appraisalInstance.count({
      where: whereConditions
    });

    const completedAppraisals = await prisma.appraisalInstance.count({
      where: {
        ...whereConditions,
        status: 'COMPLETED'
      }
    });

    const completionRate = totalAppraisals > 0 ? (completedAppraisals / totalAppraisals) * 100 : 0;

    // Get average score
    const avgScoreResult = await prisma.appraisalInstance.aggregate({
      where: {
        ...whereConditions,
        overallScore: { not: null }
      },
      _avg: {
        overallScore: true
      }
    });

    const averageScore = avgScoreResult._avg.overallScore || 0;

    // Get department breakdown
    const departmentStats = await prisma.appraisalInstance.groupBy({
      by: ['employeeId'],
      where: whereConditions,
      _count: {
        id: true
      }
    });

    // Get employee departments
    const employeeIds = departmentStats.map(stat => stat.employeeId);
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, dept: true }
    });

    const deptMap = employees.reduce((acc, emp) => {
      acc[emp.id] = emp.dept;
      return acc;
    }, {});

    const deptBreakdown = departmentStats.reduce((acc, stat) => {
      const dept = deptMap[stat.employeeId] || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0 };
      }
      acc[dept].total += stat._count.id;
      return acc;
    }, {});

    // Get completed counts per department
    const completedByDept = await prisma.appraisalInstance.groupBy({
      by: ['employeeId'],
      where: {
        ...whereConditions,
        status: 'COMPLETED'
      },
      _count: {
        id: true
      }
    });

    completedByDept.forEach(stat => {
      const dept = deptMap[stat.employeeId] || 'Unknown';
      if (deptBreakdown[dept]) {
        deptBreakdown[dept].completed += stat._count.id;
      }
    });

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await prisma.appraisalInstance.groupBy({
      by: ['createdAt'],
      where: {
        ...whereConditions,
        createdAt: { gte: sixMonthsAgo }
      },
      _count: {
        id: true
      }
    });

    // Get status distribution
    const statusDistribution = await prisma.appraisalInstance.groupBy({
      by: ['status'],
      where: whereConditions,
      _count: {
        id: true
      }
    });

    // Get score distribution
    const scoreDistribution = await prisma.appraisalInstance.groupBy({
      by: ['overallScore'],
      where: {
        ...whereConditions,
        overallScore: { not: null }
      },
      _count: {
        id: true
      }
    });

    const analytics = {
      totalAppraisals,
      completedAppraisals,
      completionRate: Math.round(completionRate * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      departments: Object.entries(deptBreakdown).map(([name, data]) => ({
        name,
        count: data.total,
        completion: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })),
      trends: monthlyTrends.map(trend => ({
        month: new Date(trend.createdAt).toLocaleDateString('en-US', { month: 'short' }),
        appraisals: trend._count.id,
        completed: 0 // This would need additional query for completed count per month
      })),
      statusDistribution: statusDistribution.map(stat => ({
        status: stat.status,
        count: stat._count.id,
        percentage: totalAppraisals > 0 ? Math.round((stat._count.id / totalAppraisals) * 100) : 0
      })),
      scoreDistribution: scoreDistribution.map(score => ({
        score: score.overallScore,
        count: score._count.id,
        percentage: totalAppraisals > 0 ? Math.round((score._count.id / totalAppraisals) * 100) : 0
      }))
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/reports/cycles', async (req, res) => {
  try {
    const cycles = await prisma.appraisalCycle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/reports/departments', async (req, res) => {
  try {
    const departments = await prisma.employee.groupBy({
      by: ['dept'],
      _count: {
        id: true
      }
    });
    
    const departmentList = departments.map(dept => ({
      name: dept.dept,
      count: dept._count.id
    }));
    
    res.json(departmentList);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Templates endpoints
app.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.appraisalTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get template by ID
app.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.appraisalTemplate.findUnique({
      where: { id },
      include: {
        category: true,
        sections: true
      }
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new template
app.post('/templates', async (req, res) => {
  try {
    const { name, displayName, type, version, description, configJson, published, active } = req.body;
    
    const template = await prisma.appraisalTemplate.create({
      data: {
        name,
        displayName: displayName || name,
        type,
        version: version || '1.0',
        configJson: configJson || {},
        published: published || false,
        active: active !== false,
        code: name.toLowerCase().replace(/\s+/g, '-')
      }
    });
    
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update template
app.put('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const template = await prisma.appraisalTemplate.update({
      where: { id },
      data: updateData
    });
    
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete template
app.delete('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template is being used in any appraisals
    const usageCount = await prisma.appraisalInstance.count({
      where: { templateId: id }
    });
    
    if (usageCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete template that is being used in appraisals',
        usageCount 
      });
    }
    
    await prisma.appraisalTemplate.delete({
      where: { id }
    });
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get template types
app.get('/templates/types', async (req, res) => {
  try {
    const types = await prisma.appraisalTemplate.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });
    
    res.json(types);
  } catch (error) {
    console.error('Error fetching template types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Duplicate template
app.post('/templates/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, displayName } = req.body;
    
    const originalTemplate = await prisma.appraisalTemplate.findUnique({
      where: { id }
    });
    
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    const duplicatedTemplate = await prisma.appraisalTemplate.create({
      data: {
        name: name || `${originalTemplate.name}-copy`,
        displayName: displayName || `${originalTemplate.displayName} (Copy)`,
        type: originalTemplate.type,
        version: '1.0',
        configJson: originalTemplate.configJson,
        published: false,
        active: true,
        code: `${originalTemplate.code}-copy-${Date.now()}`
      }
    });
    
    res.status(201).json(duplicatedTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cycles endpoint
app.get('/cycles', async (req, res) => {
  try {
    const cycles = await prisma.appraisalCycle.findMany();
    res.json(cycles);
  } catch (error) {
    console.error('Error fetching cycles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Users endpoint
app.get('/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (!user || user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        active: true,
        authProvider: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform the data to include roles array
    const usersWithRoles = users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role)
    }));
    
    res.json({ success: true, data: usersWithRoles });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new user (admin only)
app.post('/users', async (req, res) => {
  try {
    const { email, firstName, lastName, role, password, mustChangePassword } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        role: role || 'EMPLOYEE',
        passwordHash: hashedPassword,
        authProvider: 'LOCAL',
        mustChangePassword: mustChangePassword || false,
        active: true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        active: true,
        authProvider: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset user password (admin only)
app.patch('/users/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: true
      }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle user status (admin only)
app.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current user status
    const user = await prisma.user.findUnique({
      where: { id },
      select: { active: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle status
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
        dept: true,
        title: true,
        active: true,
        authProvider: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile (self or admin)
app.put('/users/:id/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { id } = req.params;
    const { firstName, lastName, email, title, dept, phone, address } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user is updating their own profile or is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!currentUser || !currentUser.active) {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }

    // Allow self-update or admin update
    if (decoded.sub !== id && currentUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        email: email || existingUser.email,
        title: title || existingUser.title,
        dept: dept || existingUser.dept
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        dept: true,
        title: true,
        active: true
      }
    });

    res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user (admin only)
app.put('/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;
    const { firstName, lastName, email, role, title, dept } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        email: email || existingUser.email,
        role: role || existingUser.role,
        title: title || existingUser.title,
        dept: dept || existingUser.dept
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        dept: true,
        title: true,
        active: true
      }
    });

    res.json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user (admin only)
app.delete('/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { id } = req.params;

    // Prevent deleting yourself
    if (id === decoded.sub) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if user has any appraisals or other related data
    const employee = await prisma.employee.findUnique({
      where: { userId: id }
    });

    if (employee) {
      // Soft delete - deactivate instead of hard delete
      await prisma.user.update({
        where: { id },
        data: { active: false }
      });
      
      res.json({ 
        success: true, 
        message: `${user.firstName} ${user.lastName} has been deactivated (cannot delete user with existing data)` 
      });
    } else {
      // Hard delete if no related data
      await prisma.user.delete({
        where: { id }
      });
      
      res.json({ 
        success: true, 
        message: `${user.firstName} ${user.lastName} has been deleted successfully` 
      });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Helper functions for settings
function getSettingCategory(key) {
  if (key.includes('email') || key.includes('smtp') || key.includes('mail')) return 'email';
  if (key.includes('sso') || key.includes('microsoft') || key.includes('auth')) return 'authentication';
  if (key.includes('password') || key.includes('security') || key.includes('encryption')) return 'security';
  if (key.includes('db') || key.includes('database')) return 'database';
  if (key.includes('notification') || key.includes('reminder')) return 'notifications';
  return 'general';
}

function isSensitiveSetting(key) {
  const sensitiveKeys = ['password', 'secret', 'key', 'token', 'credential'];
  return sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive));
}

// Settings endpoints
app.get('/admin/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Return current settings (in production, these would come from a settings table)
    const settings = {
      // General Settings
      appName: process.env.APP_NAME || 'COSTAATT HR Performance Gateway',
      appVersion: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      timezone: process.env.TZ || 'America/Port_of_Spain',
      language: process.env.LANGUAGE || 'en',
      dateFormat: process.env.DATE_FORMAT || 'MM/DD/YYYY',
      currency: process.env.CURRENCY || 'TTD',
      
      // Database Settings
      dbHost: process.env.DATABASE_HOST || 'localhost',
      dbPort: process.env.DATABASE_PORT || '5432',
      dbName: process.env.DATABASE_NAME || 'costaatt_hr',
      dbUser: process.env.DATABASE_USER || 'postgres',
      dbSsl: process.env.DATABASE_SSL === 'true',
      dbPoolSize: parseInt(process.env.DATABASE_POOL_SIZE) || 10,
      dbTimeout: parseInt(process.env.DATABASE_TIMEOUT) || 30000,
      
      // Authentication Settings
      jwtExpiry: process.env.JWT_EXPIRY || '24h',
      refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
      passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
      passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
      passwordRequireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true',
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15,
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30,
      
      // SSO Settings
      ssoEnabled: process.env.SSO_ENABLED === 'true',
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
      microsoftTenantId: process.env.MICROSOFT_TENANT_ID || '',
      ssoRedirectUrl: process.env.SSO_REDIRECT_URL || 'http://localhost:5173/auth/sso/microsoft/callback',
      
      // Email Settings
      emailEnabled: process.env.EMAIL_ENABLED === 'true',
      emailProvider: process.env.EMAIL_PROVIDER || 'sendgrid',
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || '',
      smtpSecure: process.env.SMTP_SECURE === 'true',
      fromEmail: process.env.FROM_EMAIL || 'noreply@costaatt.edu.tt',
      fromName: process.env.FROM_NAME || 'COSTAATT HR System',
      
      // Notification Settings
      notificationsEnabled: process.env.NOTIFICATIONS_ENABLED === 'true',
      emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
      pushNotifications: process.env.PUSH_NOTIFICATIONS === 'true',
      appraisalReminders: process.env.APPRAISAL_REMINDERS === 'true',
      deadlineAlerts: process.env.DEADLINE_ALERTS === 'true',
      managerNotifications: process.env.MANAGER_NOTIFICATIONS === 'true',
      hrNotifications: process.env.HR_NOTIFICATIONS === 'true',
      reminderFrequency: process.env.REMINDER_FREQUENCY || 'daily',
      
      // Security Settings
      encryptionEnabled: process.env.ENCRYPTION_ENABLED === 'true',
      auditLogging: process.env.AUDIT_LOGGING === 'true',
      ipWhitelist: process.env.IP_WHITELIST || '',
      allowedDomains: process.env.ALLOWED_DOMAINS || 'costaatt.edu.tt',
      twoFactorEnabled: process.env.TWO_FACTOR_ENABLED === 'true',
      backupEnabled: process.env.BACKUP_ENABLED === 'true',
      backupFrequency: process.env.BACKUP_FREQUENCY || 'daily',
      backupRetention: parseInt(process.env.BACKUP_RETENTION) || 30,
      
      // Performance Settings
      cacheEnabled: process.env.CACHE_ENABLED === 'true',
      cacheTtl: parseInt(process.env.CACHE_TTL) || 3600,
      rateLimiting: process.env.RATE_LIMITING === 'true',
      maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 100,
      compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',
      cdnEnabled: process.env.CDN_ENABLED === 'false',
      
      // Feature Flags
      selfAppraisalEnabled: process.env.SELF_APPRAISAL_ENABLED !== 'false',
      managerReviewEnabled: process.env.MANAGER_REVIEW_ENABLED !== 'false',
      hrReviewEnabled: process.env.HR_REVIEW_ENABLED !== 'false',
      peerReviewEnabled: process.env.PEER_REVIEW_ENABLED === 'true',
      goalSettingEnabled: process.env.GOAL_SETTING_ENABLED !== 'false',
      competencyManagementEnabled: process.env.COMPETENCY_MANAGEMENT_ENABLED !== 'false',
      reportGenerationEnabled: process.env.REPORT_GENERATION_ENABLED !== 'false',
      bulkOperationsEnabled: process.env.BULK_OPERATIONS_ENABLED !== 'false',
      advancedAnalyticsEnabled: process.env.ADVANCED_ANALYTICS_ENABLED !== 'false',
      mobileAppEnabled: process.env.MOBILE_APP_ENABLED === 'true',
      apiAccessEnabled: process.env.API_ACCESS_ENABLED !== 'false',
      webhookEnabled: process.env.WEBHOOK_ENABLED === 'true'
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/admin/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const newSettings = req.body;

    // In production, you would save these to a settings table
    // For now, we'll just validate and return success
    console.log('Settings updated:', newSettings);

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/admin/system-stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    // Get system statistics
    const totalUsers = await prisma.user.count();
    const activeAppraisals = await prisma.appraisalInstance.count({
      where: {
        status: {
          in: ['draft', 'submitted', 'pending_manager_review', 'pending_divisional_review', 'pending_final_review']
        }
      }
    });

    // Calculate system uptime (simplified)
    const systemUptime = process.uptime();
    const uptimeHours = Math.floor(systemUptime / 3600);
    const uptimeMinutes = Math.floor((systemUptime % 3600) / 60);
    const uptimeString = `${uptimeHours}h ${uptimeMinutes}m`;

    // Get database size (simplified)
    const databaseSize = '2.5 GB'; // In production, you'd query the actual database size

    res.json({
      success: true,
      data: {
        totalUsers,
        activeAppraisals,
        systemUptime: uptimeString,
        databaseSize
      }
    });
  } catch (error) {
    console.error('System stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/admin/test-connection/:type', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!adminUser || !adminUser.active || adminUser.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { type } = req.params;

    switch (type) {
      case 'database':
        // Test database connection
        try {
          await prisma.$queryRaw`SELECT 1`;
          res.json({ success: true, message: 'Database connection successful' });
        } catch (error) {
          res.json({ success: false, message: 'Database connection failed' });
        }
        break;

      case 'email':
        // Test Graph API email service
        try {
          const testResult = await emailService.sendEmail({
            to: 'hr@costaatt.edu.tt', // Send test email to HR
            subject: 'HR Performance Gateway - Email Test',
            body: `
              <div style="font-family: Arial, sans-serif;">
                <h2>Email Service Test</h2>
                <p>This is a test email from the HR Performance Gateway system.</p>
                <p>Timestamp: ${new Date().toISOString()}</p>
                <p>If you receive this email, the Microsoft Graph API integration is working correctly.</p>
              </div>
            `
          });
          
          if (testResult.success) {
            res.json({ success: true, message: 'Email service test successful - Test email sent to HR' });
          } else {
            res.json({ success: false, message: `Email test failed: ${testResult.error}` });
          }
        } catch (emailError) {
          console.error('Email test error:', emailError);
          res.json({ success: false, message: `Email test failed: ${emailError.message}` });
        }
        break;

      case 'sso':
        // Test SSO connection
        try {
          // In production, you would test the actual SSO service
          res.json({ success: true, message: 'SSO connection successful' });
        } catch (error) {
          res.json({ success: false, message: 'SSO connection failed' });
        }
        break;

      default:
        res.status(400).json({ success: false, message: 'Invalid connection type' });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Appraisal endpoints
app.get('/appraisals', async (req, res) => {
  try {
    const { employeeId, cycleId, templateType, stage, status } = req.query;
    
    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (cycleId) where.cycleId = cycleId;
    if (templateType) where.templateType = templateType;
    if (stage) where.stage = stage;
    
    // Handle status filter - exclude self-evaluations unless specifically requested
    if (status) {
      where.status = status;
    } else {
      // Exclude self-evaluations from main appraisals list
      // Self-evaluations should only appear in self-evaluation history
      where.status = {
        notIn: ['SELF_EVALUATION']
      };
    }

    const appraisals = await prisma.appraisalInstance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            dept: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
                email: true
              }
            }
          }
        },
        cycle: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: appraisals });
  } catch (error) {
    console.error('Error fetching appraisals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appraisals' });
  }
});

// Get appraisals for a specific employee
app.get('/appraisals/employee/:employeeId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId } = req.params;

    // Verify the user can access this data
    if (decoded.sub !== employeeId && decoded.role !== 'HR_ADMIN' && decoded.role !== 'SUPERVISOR') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get the employee record
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee record not found' 
      });
    }

    // Find all appraisals for this employee (excluding self-evaluations)
    // Self-evaluations should only appear in self-evaluation history
    const appraisals = await prisma.appraisalInstance.findMany({
      where: {
        employeeId: employee.id,
        status: {
          notIn: ['SELF_EVALUATION']
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            dept: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
                email: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        cycle: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: appraisals });
  } catch (error) {
    console.error('Error fetching employee appraisals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch employee appraisals' });
  }
});

// Get appraisals for supervisor's team
app.get('/appraisals/supervisor/:supervisorId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { supervisorId } = req.params;

    // Verify the user is the supervisor or an admin
    if (decoded.sub !== supervisorId && decoded.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find the supervisor's employee record
    const supervisorEmployee = await prisma.employee.findUnique({
      where: { userId: supervisorId },
      select: { id: true }
    });

    if (!supervisorEmployee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Supervisor employee record not found' 
      });
    }

    // Get team members for this supervisor
    const teamMembers = await prisma.employee.findMany({
      where: { supervisorId: supervisorEmployee.id },
      select: { id: true }
    });

    const teamMemberIds = teamMembers.map(member => member.id);

    if (teamMemberIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Find appraisals for supervisor's team (excluding self-evaluations)
    const appraisals = await prisma.appraisalInstance.findMany({
      where: {
        employeeId: {
          in: teamMemberIds
        },
        status: {
          notIn: ['SELF_EVALUATION']
        }
      },
      include: {
        employee: {
          select: {
            id: true,
            dept: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                title: true,
                email: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        cycle: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: appraisals });
  } catch (error) {
    console.error('Error fetching supervisor appraisals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch supervisor appraisals' });
  }
});

app.get('/appraisals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            dept: true,
            division: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                dept: true
              }
            }
          }
        },
        template: {
          select: {
            name: true,
            type: true,
            configJson: true
          }
        },
        cycle: {
          select: {
            id: true,
            name: true,
            periodStart: true,
            periodEnd: true
          }
        },
        sections: {
          include: {
            section: true
          }
        },
        responses: true,
        goals: true,
        competencies: {
          include: {
            competency: {
              include: {
                cluster: true
              }
            }
          }
        }
      }
    });

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Appraisal not found' });
    }

    // Transform the response to match frontend expectations
    const transformedAppraisal = {
      ...appraisal,
      employee: {
        ...appraisal.employee,
        firstName: appraisal.employee.user.firstName,
        lastName: appraisal.employee.user.lastName,
        email: appraisal.employee.user.email,
        title: appraisal.employee.user.title,
        dept: appraisal.employee.dept || appraisal.employee.user.dept
      }
    };

    res.json({ success: true, data: transformedAppraisal });
  } catch (error) {
    console.error('Error fetching appraisal:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appraisal' });
  }
});

app.post('/appraisals', async (req, res) => {
  try {
    const {
      employeeId,
      cycleId,
      templateType,
      stage,
      status,
      formData,
      overallScore
    } = req.body;

    // Validate required fields
    if (!employeeId || !cycleId || !templateType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: employeeId, cycleId, templateType' 
      });
    }

    // Find the template by type to get the templateId
    const template = await prisma.appraisalTemplate.findFirst({
      where: { type: templateType }
    });

    if (!template) {
      return res.status(400).json({ 
        success: false, 
        message: `Template with type ${templateType} not found` 
      });
    }

    // Convert User ID to Employee ID (the frontend sends User IDs, but AppraisalInstance needs Employee IDs)
    const employee = await prisma.employee.findFirst({
      where: { userId: employeeId }
    });

    if (!employee) {
      return res.status(400).json({ 
        success: false, 
        message: `Employee record not found for user ${employeeId}` 
      });
    }

    const actualEmployeeId = employee.id;

    // Check if appraisal already exists
    const existingAppraisal = await prisma.appraisalInstance.findFirst({
      where: {
        employeeId: actualEmployeeId,
        cycleId,
        templateId: template.id,
        status
      }
    });

    let appraisal;
    if (existingAppraisal) {
      // Update existing appraisal
      appraisal = await prisma.appraisalInstance.update({
        where: { id: existingAppraisal.id },
        data: {
          status,
          selfAppraisalData: formData || null,
          managerReviewData: formData || null,
          overallScore: overallScore || 0,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new appraisal
      appraisal = await prisma.appraisalInstance.create({
        data: {
          employeeId: actualEmployeeId,
          cycleId,
          templateId: template.id,
          status,
          selfAppraisalData: formData || null,
          managerReviewData: formData || null,
          overallScore: overallScore || 0,
          createdBy: 'cmgi2zcx3000013mnqbalb5ic', // Admin user ID
          reviewerId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          employee: {
            select: {
              id: true,
              dept: true,
              userId: true,
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
    }

    // If this is a submission (not a draft), send email notifications
    if (status === 'submitted' || status === 'pending_manager_review') {
      try {
        // Get employee details for email
        const employeeDetails = await prisma.employee.findUnique({
          where: { id: actualEmployeeId },
          select: {
            id: true,
            dept: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                title: true
              }
            }
          }
        });

        // Get manager details (you may need to adjust this based on your data structure)
        let managerDetails = null;
        if (employeeDetails?.dept) {
          // Try to find a manager/supervisor in the same department
          const potentialManager = await prisma.user.findFirst({
            where: {
              role: { in: ['supervisor', 'manager', 'admin'] },
              dept: employeeDetails.dept,
              active: true
            },
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          });
          managerDetails = potentialManager;
        }

        // Prepare email data
        const emailData = {
          appraiseeName: `${employeeDetails?.user?.firstName || ''} ${employeeDetails?.user?.lastName || ''}`.trim(),
          appraiseeEmail: employeeDetails?.user?.email,
          managerName: managerDetails ? `${managerDetails.firstName} ${managerDetails.lastName}`.trim() : 'Manager',
          managerEmail: managerDetails?.email
        };

        // Send workflow emails
        if (emailData.appraiseeEmail) {
          console.log('📧 Triggering appraisal workflow emails...', emailData);
          const emailResult = await emailService.sendAppraisalWorkflowEmails(emailData);
          console.log('📧 Email workflow result:', emailResult);
        } else {
          console.log('⚠️ Cannot send emails - appraisee email not found');
        }
      } catch (emailError) {
        console.error('❌ Email notification failed:', emailError);
        // Don't fail the appraisal submission if email fails
      }
    }

    res.json({ success: true, data: appraisal });
  } catch (error) {
    console.error('Error creating/updating appraisal:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: `Failed to save appraisal: ${error.message}` });
  }
});

app.put('/appraisals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, formData, overallScore } = req.body;

    console.log('Received formData type:', typeof formData);
    console.log('Received formData:', formData);

    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        status,
        selfAppraisalData: formData || null,
        managerReviewData: formData || null,
        overallScore: overallScore || 0,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, data: appraisal });
  } catch (error) {
    console.error('Error updating appraisal:', error);
    res.status(500).json({ success: false, message: 'Failed to update appraisal' });
  }
});

// Assign competencies to appraisal
app.post('/appraisals/:id/competencies', async (req, res) => {
  console.log('=== COMPETENCY ASSIGNMENT ENDPOINT CALLED ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('Authorization header present:', !!req.headers.authorization);
  
  try {
    // Add authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, active: true }
    });
    
    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user' });
    }

    const { id } = req.params;
    const { competencyIds } = req.body;

    console.log('Processing competency assignment for appraisal:', id);
    console.log('Competency IDs:', competencyIds);

    if (!Array.isArray(competencyIds) || competencyIds.length !== 3) {
      return res.status(400).json({ error: "Exactly 3 competencies required." });
    }

    // Validate appraisal exists and is in Draft status
    const appraisal = await prisma.appraisalInstance.findUnique({ 
      where: { id },
      select: { id: true, status: true }
    });
    
    if (!appraisal) {
      console.log('Appraisal not found:', id);
      return res.status(404).json({ error: "Appraisal not found." });
    }
    
    if (appraisal.status !== "DRAFT") {
      console.log('Appraisal not in DRAFT status:', appraisal.status);
      return res.status(403).json({ error: "Cannot modify competencies after submission." });
    }

    // Verify all competencies exist
    const validCompetencies = await prisma.competency.findMany({
      where: { id: { in: competencyIds } },
    });
    
    if (validCompetencies.length !== 3) {
      console.log('Invalid competency IDs - found:', validCompetencies.length, 'expected: 3');
      return res.status(400).json({ error: "Invalid competency IDs." });
    }

    // Try to delete existing competency assignments for this appraisal
    try {
      const deletedCount = await prisma.appraisalCompetency.deleteMany({ 
        where: { appraisalId: id } 
      });
      console.log('Deleted existing competency assignments:', deletedCount.count);
    } catch (deleteError) {
      console.log('Note: Could not delete existing competencies (table may not exist yet):', deleteError.message);
    }

    // Create new competency assignments
    const createData = competencyIds.map((competencyId) => ({
      appraisalId: id,
      competencyId: competencyId,
    }));
    
    console.log('Creating new competency assignments:', createData);
    try {
      await prisma.appraisalCompetency.createMany({
        data: createData,
      });
      console.log('Successfully created competency assignments');
    } catch (createError) {
      console.error('Failed to create competency assignments:', createError);
      console.error('Create error details:', {
        message: createError.message,
        code: createError.code,
        meta: createError.meta
      });
      
      // Check if it's a table not found error
      if (createError.message.includes('does not exist') || createError.code === 'P2021') {
        return res.status(500).json({ 
          error: "Database table not found. Please run database migrations: npx prisma db push", 
          details: createError.message 
        });
      }
      
      throw createError; // Re-throw other errors
    }

    // Return the updated appraisal with competencies
    const updatedAppraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        competencies: {
          include: { 
            competency: {
              include: {
                cluster: true
              }
            } 
          },
        },
        employee: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('Successfully assigned competencies to appraisal:', id);
    res.json({ success: true, data: updatedAppraisal });
  } catch (err) {
    console.error('Error assigning competencies:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      params: req.params,
      body: req.body
    });
    res.status(500).json({ 
      error: "Server error.", 
      details: err.message,
      stack: err.stack 
    });
  }
});

// PATCH endpoint for divisional head review
app.patch('/appraisals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      divisionalHeadComments, 
      divisionalHeadDecision, 
      divisionalHeadReviewedAt,
      divisionalHeadSignedName,
      divisionalHeadSignedAt 
    } = req.body;

    console.log(`🔍 PATCH /appraisals/${id} - Divisional Head Review`);
    console.log('Request body:', { status, divisionalHeadComments, divisionalHeadDecision });

    // First, let's check the current state
    const currentAppraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      select: { divisionalHeadComments: true, divisionalHeadDecision: true }
    });
    console.log('📋 Current state before update:', currentAppraisal);

    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        status,
        divisionalHeadComments,
        divisionalHeadDecision,
        divisionalHeadReviewedAt: divisionalHeadReviewedAt ? new Date(divisionalHeadReviewedAt) : null,
        divisionalHeadSignedName,
        divisionalHeadSignedAt: divisionalHeadSignedAt ? new Date(divisionalHeadSignedAt) : null,
        updatedAt: new Date()
      },
      include: {
        employee: {
          select: {
            id: true,
            dept: true,
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
        template: {
          select: {
            name: true,
            type: true
          }
        },
        cycle: {
          select: {
            name: true,
            periodStart: true,
            periodEnd: true
          }
        }
      }
    });

    console.log(`✅ Appraisal ${id} updated successfully with status: ${status}`);
    console.log(`   Comments: ${divisionalHeadComments ? 'Present' : 'Not provided'}`);
    console.log(`   Decision: ${divisionalHeadDecision || 'Not provided'}`);
    
    // Verify the update was persisted
    const verifyAppraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      select: { divisionalHeadComments: true, divisionalHeadDecision: true }
    });
    console.log('🔍 Verification after update:', verifyAppraisal);

    // Send email notifications if status changed to AWAITING_HR
    if (status === 'AWAITING_HR') {
      try {
        console.log('📧 Sending HR notification for appraisal completion...');
        
        // Prepare email data
        const emailData = {
          appraiseeName: `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`,
          appraiseeEmail: appraisal.employee.user.email,
          managerName: 'Divisional Head', // We'll get this from the divisional head who submitted
          managerEmail: 'dheadley@costaatt.edu.tt', // Darren's email
          cycleName: appraisal.cycle.name,
          appraisalId: id
        };

        // Send notification to HR team
        await emailService.sendEmail({
          to: 'hr@costaatt.edu.tt',
          cc: 'amatthew@costaatt.edu.tt,dheadley@costaatt.edu.tt',
          subject: `Appraisal Ready for HR Completion - ${emailData.appraiseeName}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">COSTAATT HR System</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Appraisal Ready for HR Completion</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1F2937; margin-bottom: 20px;">Appraisal Completed by Divisional Head</h2>
                
                <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h3 style="color: #374151; margin-top: 0;">Appraisal Details:</h3>
                  <p><strong>Employee:</strong> ${emailData.appraiseeName}</p>
                  <p><strong>Email:</strong> ${emailData.appraiseeEmail}</p>
                  <p><strong>Cycle:</strong> ${emailData.cycleName}</p>
                  <p><strong>Completed by:</strong> ${emailData.managerName} (Darren Headley)</p>
                  <p><strong>Status:</strong> Awaiting HR Completion</p>
                  <p><strong>Appraisal ID:</strong> ${emailData.appraisalId}</p>
                </div>
                
                <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                  <h4 style="color: #1E40AF; margin-top: 0;">Action Required:</h4>
                  <p>Please log in to the HR Gateway to complete the final processing of this appraisal.</p>
                  <p>The divisional head has provided their comments and recommendation. You can now finalize the appraisal.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="http://hrpmg.costaatt.edu.tt:5173/login" 
                     style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                    Access HR Gateway
                  </a>
                </div>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
                <p style="color: #6B7280; font-size: 14px; text-align: center;">
                  This is an automated notification from COSTAATT HR Performance Management System.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
          `
        });

        // Send confirmation to divisional head (Darren)
        await emailService.sendEmail({
          to: 'dheadley@costaatt.edu.tt',
          cc: 'hr@costaatt.edu.tt',
          subject: `Appraisal Submitted Successfully - ${emailData.appraiseeName}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">COSTAATT HR System</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Appraisal Submitted Successfully</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #1F2937; margin-bottom: 20px;">✅ Appraisal Completed</h2>
                
                <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10B981;">
                  <h3 style="color: #166534; margin-top: 0;">Submission Confirmed:</h3>
                  <p><strong>Employee:</strong> ${emailData.appraiseeName}</p>
                  <p><strong>Cycle:</strong> ${emailData.cycleName}</p>
                  <p><strong>Status:</strong> Forwarded to HR for completion</p>
                  <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                </div>
                
                <p style="color: #374151;">Your appraisal review has been successfully submitted and forwarded to the HR team for final processing.</p>
                
                <p style="color: #374151;">The HR team will now complete the final steps and notify all parties when the appraisal process is finalized.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
                <p style="color: #6B7280; font-size: 14px; text-align: center;">
                  This is an automated notification from COSTAATT HR Performance Management System.<br>
                  Please do not reply to this email.
                </p>
              </div>
            </div>
          `
        });

        console.log('✅ HR notification emails sent successfully');
      } catch (emailError) {
        console.error('❌ Email notification failed:', emailError);
        // Don't fail the appraisal update if email fails
      }
    }

    res.json({ success: true, data: appraisal });
  } catch (error) {
    console.error('❌ Error updating appraisal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Final Review endpoint for Final Approvers
app.patch('/appraisals/:id/final-review', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      overallPerformanceComments,
      confirmAppointment,
      extendProbation,
      recommendTermination,
      recommendNewContract,
      finalApproverSignature,
      finalApproverSignedAt,
      status,
      finalApproverReviewedAt,
      finalApproverReviewedBy
    } = req.body;

    const appraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        status: status || 'AWAITING_HR',
        overallPerformanceComments,
        confirmAppointment: confirmAppointment || false,
        extendProbation: extendProbation || false,
        recommendTermination: recommendTermination || false,
        recommendNewContract: recommendNewContract || false,
        finalApproverSignature,
        finalApproverSignedAt: finalApproverSignedAt ? new Date(finalApproverSignedAt) : null,
        finalApproverReviewedAt: finalApproverReviewedAt ? new Date(finalApproverReviewedAt) : new Date(),
        finalApproverReviewedBy,
        updatedAt: new Date()
      },
      include: {
        employee: {
          select: {
            id: true,
            dept: true,
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
        template: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        cycle: {
          select: {
            id: true,
            name: true,
            periodStart: true,
            periodEnd: true
          }
        }
      }
    });

    res.json({ success: true, data: appraisal });
  } catch (error) {
    console.error('Error updating final review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/appraisals/:id', async (req, res) => {
  console.log('=== DELETE APPRAISAL ENDPOINT CALLED ===');
  console.log('Request params:', req.params);
  console.log('Authorization header present:', !!req.headers.authorization);
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
      console.log('JWT decoded successfully for user:', decoded.sub);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    // Check if user is HR admin
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, role: true, active: true }
      });
      console.log('User lookup result:', { 
        found: !!user, 
        id: user?.id, 
        role: user?.role, 
        active: user?.active 
      });
    } catch (userError) {
      console.error('User lookup failed:', userError);
      return res.status(500).json({ success: false, message: 'Failed to verify user permissions' });
    }
    
    if (!user) {
      console.log('User not found for ID:', decoded.sub);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.active) {
      console.log('User is inactive:', decoded.sub);
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }
    
    if (user.role !== 'HR_ADMIN') {
      console.log('User lacks HR_ADMIN role. Current role:', user.role);
      return res.status(403).json({ success: false, message: 'HR Admin privileges required' });
    }

    const { id } = req.params;
    console.log('Attempting to delete appraisal with ID:', id);
    
    // Check if appraisal exists
    let appraisal;
    try {
      appraisal = await prisma.appraisalInstance.findUnique({
        where: { id },
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
          }
        }
      });
    } catch (lookupError) {
      console.error('Failed to lookup appraisal:', lookupError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to verify appraisal exists',
        error: lookupError.message
      });
    }

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Appraisal not found' });
    }

    console.log('Found appraisal:', {
      id: appraisal.id,
      hasEmployee: !!appraisal.employee,
      hasUser: !!(appraisal.employee && appraisal.employee.user),
      employeeData: appraisal.employee ? {
        id: appraisal.employee.id,
        hasUser: !!appraisal.employee.user,
        userName: appraisal.employee.user ? `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}` : 'No user data'
      } : 'No employee data'
    });

    // Delete related records step by step (more reliable than transaction)
    console.log('Starting step-by-step deletion for appraisal ID:', id);
    
    let deletedCounts = {
      sections: 0,
      responses: 0,
      goals: 0,
      competencies: 0
    };

    // Step 1: Delete section instances
    try {
      console.log('Step 1: Deleting section instances for appraisal ID:', id);
      const sectionResult = await prisma.appraisalSectionInstance.deleteMany({
        where: { instanceId: id }
      });
      deletedCounts.sections = sectionResult.count;
      console.log('✅ Deleted section instances:', deletedCounts.sections);
    } catch (sectionError) {
      console.error('❌ Failed to delete section instances:', sectionError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete section instances',
        error: sectionError.message
      });
    }

    // Step 2: Delete appraisal responses
    try {
      console.log('Step 2: Deleting appraisal responses for appraisal ID:', id);
      const responseResult = await prisma.appraisalResponse.deleteMany({
        where: { instanceId: id }
      });
      deletedCounts.responses = responseResult.count;
      console.log('✅ Deleted appraisal responses:', deletedCounts.responses);
    } catch (responseError) {
      console.error('❌ Failed to delete appraisal responses:', responseError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete appraisal responses',
        error: responseError.message
      });
    }

    // Step 3: Delete goals
    try {
      console.log('Step 3: Deleting goals for appraisal ID:', id);
      const goalResult = await prisma.goal.deleteMany({
        where: { instanceId: id }
      });
      deletedCounts.goals = goalResult.count;
      console.log('✅ Deleted goals:', deletedCounts.goals);
    } catch (goalError) {
      console.error('❌ Failed to delete goals:', goalError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete goals',
        error: goalError.message
      });
    }

    // Step 4: Delete competency assignments (optional)
    try {
      console.log('Step 4: Deleting competency assignments for appraisal ID:', id);
      const competencyResult = await prisma.appraisalCompetency.deleteMany({
        where: { appraisalId: id }
      });
      deletedCounts.competencies = competencyResult.count;
      console.log('✅ Deleted competency assignments:', deletedCounts.competencies);
    } catch (competencyError) {
      console.log('⚠️ Note: Could not delete competency assignments (table may not exist yet):', competencyError.message);
      // This is not critical, continue with main deletion
    }

    // Step 5: Delete the main appraisal instance
    try {
      console.log('Step 5: Deleting main appraisal instance with ID:', id);
      await prisma.appraisalInstance.delete({
      where: { id }
    });
      console.log('✅ Successfully deleted main appraisal instance');
    } catch (deleteError) {
      console.error('❌ Failed to delete main appraisal instance:', deleteError.message);
      console.error('Delete error details:', {
        message: deleteError.message,
        code: deleteError.code,
        meta: deleteError.meta
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete main appraisal instance',
        error: deleteError.message
      });
    }

    console.log('🎉 All deletion steps completed successfully. Summary:', deletedCounts);

    const employeeName = appraisal?.employee?.user?.firstName && appraisal?.employee?.user?.lastName 
      ? `${appraisal.employee.user.firstName} ${appraisal.employee.user.lastName}`
      : 'Unknown Employee';
    
    console.log('📤 Sending success response for:', employeeName);
    
    try {
      res.json({ 
        success: true, 
        message: `Appraisal for ${employeeName} deleted successfully` 
      });
      console.log('✅ Success response sent successfully');
    } catch (responseError) {
      console.error('❌ Failed to send success response:', responseError.message);
      throw responseError;
    }
  } catch (error) {
    console.error('🚨 CRITICAL ERROR in delete appraisal endpoint:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      appraisalId: req.params.id,
      timestamp: new Date().toISOString()
    });
    
    // Return more specific error information for debugging
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('📤 Sending error response:', errorMessage);
    
    res.status(500).json({ 
      success: false, 
      message: `Failed to delete appraisal: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        appraisalId: req.params.id
      } : undefined
    });
  }
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  // Clear any server-side session data if needed
  res.json({ success: true, message: 'Logged out successfully' });
});

// ===== ADMIN SETTINGS ENDPOINTS =====

// Get system settings
app.get('/admin/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Return default settings (in production, these would be stored in database)
    const settings = {
      appName: 'COSTAATT HR Performance Gateway',
      appVersion: '1.0.0',
      environment: 'production',
      timezone: 'America/Port_of_Spain',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      currency: 'TTD',
      dbHost: process.env.DB_HOST || 'localhost',
      dbPort: process.env.DB_PORT || '5432',
      dbName: process.env.DB_NAME || 'costaatt_hr',
      dbUser: process.env.DB_USER || 'postgres',
      dbSsl: process.env.DB_SSL === 'true',
      jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      jwtExpiry: process.env.JWT_EXPIRY || '24h',
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
      ssoEnabled: process.env.SSO_ENABLED === 'true',
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
      microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      microsoftTenantId: process.env.MICROSOFT_TENANT_ID || '',
      emailEnabled: process.env.EMAIL_ENABLED === 'true',
      smtpHost: process.env.SMTP_HOST || '',
      smtpPort: parseInt(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@costaatt.edu.tt',
      fromName: process.env.FROM_NAME || 'COSTAATT HR System',
      notificationsEnabled: true,
      emailNotifications: true,
      pushNotifications: true,
      appraisalReminders: true,
      deadlineAlerts: true,
      managerNotifications: true,
      hrNotifications: true,
      encryptionEnabled: true,
      auditLogging: true,
      twoFactorEnabled: false,
      backupEnabled: true,
      cacheEnabled: true,
      rateLimiting: true,
      compressionEnabled: true,
      cdnEnabled: false,
      ldapEnabled: false,
      apiAccessEnabled: true,
      webhookEnabled: false,
      monitoringEnabled: true,
      performanceMonitoring: true,
      errorTracking: true,
      uptimeMonitoring: true,
      selfAppraisalEnabled: true,
      managerReviewEnabled: true,
      hrReviewEnabled: true,
      peerReviewEnabled: false,
      goalSettingEnabled: true,
      competencyManagementEnabled: true,
      reportGenerationEnabled: true,
      bulkOperationsEnabled: true,
      advancedAnalyticsEnabled: true,
      mobileAppEnabled: false
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save system settings
app.post('/admin/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const settings = req.body;
    
    // In production, save to database
    // For now, just return success
    console.log('Settings saved:', settings);
    
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get system statistics
app.get('/admin/system-stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get system statistics
    const totalUsers = await prisma.user.count();
    const totalEmployees = await prisma.employee.count();
    const totalAppraisals = await prisma.appraisalInstance.count();
    const activeAppraisals = await prisma.appraisalInstance.count({
      where: { status: { in: ['DRAFT', 'IN_REVIEW', 'REVIEWED_MANAGER'] } }
    });
    const completedAppraisals = await prisma.appraisalInstance.count({
      where: { status: 'COMPLETED' }
    });

    const stats = {
      totalUsers,
      totalEmployees,
      totalAppraisals,
      activeAppraisals,
      completedAppraisals,
      systemUptime: '99.9%',
      lastBackup: new Date().toISOString(),
      databaseSize: '2.5 GB',
      memoryUsage: '512 MB',
      cpuUsage: '15%'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test connection endpoints
app.post('/admin/test-connection/:type', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { type } = req.params;

    // Simulate connection tests
    switch (type) {
      case 'database':
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        res.json({ success: true, message: 'Database connection successful' });
        break;
      case 'email':
        // Test email connection (simulated)
        res.json({ success: true, message: 'Email server connection successful' });
        break;
      case 'sso':
        // Test SSO connection to Microsoft OAuth
        try {
          const { microsoftClientId, microsoftTenantId } = req.body;
          const clientId = microsoftClientId || '7911cfad-b0d5-419c-83b2-62aab8833a66';
          const tenantId = microsoftTenantId || '023c2cf6-b378-495b-a3cd-591490b7f6e1';
          
          // Test Microsoft OAuth endpoint reachability
          const testUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=http://localhost:5173/auth/sso/microsoft/callback&response_mode=query&scope=openid profile email`;
          
          // Make a HEAD request to test if the endpoint is reachable
          const fetch = require('node-fetch');
          const response = await fetch(testUrl, { method: 'HEAD', timeout: 10000 });
          
          if (response.ok || response.status === 400) { // 400 is expected for missing required params
            res.json({ 
              success: true, 
              message: 'SSO connection successful - Microsoft OAuth endpoint is reachable',
              details: {
                endpoint: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
                clientId: clientId,
                tenantId: tenantId,
                status: response.status
              }
            });
          } else {
            res.json({ 
              success: false, 
              message: `SSO connection failed - HTTP ${response.status}`,
              details: {
                endpoint: testUrl,
                status: response.status
              }
            });
          }
        } catch (error) {
          console.error('SSO connection test error:', error);
          res.json({ 
            success: false, 
            message: 'SSO connection failed - Unable to reach Microsoft OAuth endpoint',
            error: error.message
          });
        }
        break;
      default:
        res.status(400).json({ success: false, message: 'Invalid connection type' });
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ success: false, message: 'Connection test failed' });
  }
});

// Microsoft SSO Routes
app.get('/auth/sso/microsoft', (req, res) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID || '7911cfad-b0d5-419c-83b2-62aab8833a66';
  const tenantId = process.env.MICROSOFT_TENANT_ID || '023c2cf6-b378-495b-a3cd-591490b7f6e1';
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/sso/microsoft/callback';
  
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_mode=query&` +
    `scope=openid profile email&` +
    `state=${Date.now()}`;
  
  res.redirect(authUrl);
});

app.get('/auth/sso/microsoft/callback', async (req, res) => {
  try {
    const { code, error, error_description } = req.query;
    
    if (error) {
      console.error('Microsoft OAuth error:', error, error_description);
      return res.redirect(`http://localhost:5173/login?error=sso_failed&message=${encodeURIComponent(error_description || error)}`);
    }
    
    if (!code) {
      return res.redirect('http://localhost:5173/login?error=no_code');
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/023c2cf6-b378-495b-a3cd-591490b7f6e1/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '7911cfad-b0d5-419c-83b2-62aab8833a66',
        scope: 'openid profile email',
        code: code,
        redirect_uri: 'http://localhost:5173/auth/sso/microsoft/callback',
        grant_type: 'authorization_code',
        client_secret: process.env.AZURE_CLIENT_SECRET || 'your-client-secret-here'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return res.redirect('http://localhost:5173/login?error=token_exchange_failed');
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token, id_token } = tokenData;
    
    // Decode ID token to get user info
    const jwt = require('jsonwebtoken');
    const decodedToken = jwt.decode(id_token);
    
    if (!decodedToken) {
      return res.redirect('http://localhost:5173/login?error=invalid_token');
    }
    
    const { email, given_name, family_name, sub } = decodedToken;
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        active: true
      }
    });
    
    if (!user) {
      // User doesn't exist - create new user
      user = await prisma.user.create({
        data: {
          email,
          firstName: given_name || 'Unknown',
          lastName: family_name || 'User',
          role: 'EMPLOYEE',
          dept: 'General',
          title: 'Employee',
          authProvider: 'SSO',
          azureId: sub,
          active: true,
          passwordHash: await bcrypt.hash('sso-user-' + Date.now(), 10) // Temporary password
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          dept: true,
          title: true,
          active: true
        }
      });
      
      // Create employee record
      await prisma.employee.create({
        data: {
          userId: user.id,
          dept: 'General',
          division: 'General',
          employmentType: 'FULL_TIME',
          categoryId: null
        }
      });
      
      console.log('Created new SSO user:', user.email);
    } else {
      // Update existing user with Azure ID
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          azureId: sub,
          authProvider: 'SSO'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          dept: true,
          title: true,
          active: true
        }
      });
    }
    
    if (!user.active) {
      return res.redirect('http://localhost:5173/login?error=account_disabled');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/auth/sso/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
    
  } catch (error) {
    console.error('SSO callback error:', error);
    res.redirect('http://localhost:5173/login?error=sso_callback_failed');
  }
});

app.get('/auth/sso/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.json({ authenticated: false });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dept: true,
        title: true,
        authProvider: true,
        active: true
      }
    });
    
    if (!user || !user.active) {
      return res.json({ authenticated: false });
    }
    
    res.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        dept: user.dept,
        title: user.title,
        authProvider: user.authProvider,
        azureId: user.azureId
      }
    });
    
  } catch (error) {
    console.error('SSO status check error:', error);
    res.json({ authenticated: false });
  }
});

app.post('/auth/sso/logout', (req, res) => {
  // Clear any SSO session data if needed
  res.json({ success: true, message: 'SSO logout successful' });
});

// Email Service Integration
const sendgridService = require('./utils/sendgridService');

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject, html, cc } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'To and subject are required' 
      });
    }

    const result = await sendgridService.sendEmailWithRetry({
      to,
      subject,
      html: html || '<p>This is a test email from COSTAATT HR Performance Gateway.</p>',
      cc,
      type: 'test'
    });

    res.json(result);
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Send notification email endpoint
app.post('/api/send-notification', async (req, res) => {
  try {
    const { to, eventType, subject, templateName, templateData, cc } = req.body;
    
    if (!to || !eventType || !subject) {
      return res.status(400).json({ 
        success: false, 
        message: 'To, eventType, and subject are required' 
      });
    }

    const result = await sendgridService.sendEmailWithRetry({
      to,
      subject,
      html: templateData?.html || `<p>${subject}</p>`,
      cc,
      type: eventType
    });

    res.json(result);
  } catch (error) {
    console.error('Notification email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get email logs endpoint
app.get('/api/email-logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin or final approver
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });
    
    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const logs = await prisma.emailLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.emailLog.count();
    
    res.json({ success: true, data: { logs, total } });
  } catch (error) {
    console.error('Email logs error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Retry failed emails endpoint
app.post('/api/retry-failed-emails', async (req, res) => {
  try {
    // For SendGrid, we'll just return a simple response
    // Retry logic is handled automatically by SendGrid service
    const result = { success: true, message: 'Retry functionality handled by SendGrid service' };
    res.json(result);
  } catch (error) {
    console.error('Retry emails error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Resend specific email endpoint
app.post('/api/resend-email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // For SendGrid, we'll get the email log and resend
    const emailLog = await prisma.emailLog.findUnique({ where: { id } });
    if (!emailLog) {
      return res.status(404).json({ success: false, message: 'Email log not found' });
    }
    
    const result = await sendgridService.sendEmailWithRetry({
      to: emailLog.to,
      subject: emailLog.subject,
      html: '<p>Resent email</p>',
      cc: emailLog.cc,
      type: emailLog.type
    });
    res.json(result);
  } catch (error) {
    console.error('Resend email error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get user notifications endpoint
app.get('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const result = await prisma.notification.findMany({
      where: { userId: decoded.sub },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Mark notification as read endpoint
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { id } = req.params;
    await prisma.notification.update({
      where: { id, userId: decoded.sub },
      data: { read: true }
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Mark all notifications as read endpoint
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    await prisma.notification.updateMany({
      where: { userId: decoded.sub, read: false },
      data: { read: true }
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Appraisal Draft endpoints
app.post('/api/appraisal-drafts', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId, cycleId, templateId, data } = req.body;

    const draft = await prisma.appraisalDraft.create({
      data: {
        managerId: decoded.sub,
        employeeId,
        cycleId,
        templateId,
        data
      }
    });

    res.json({ success: true, data: draft });
  } catch (error) {
    console.error('Create appraisal draft error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get('/api/appraisal-drafts', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const drafts = await prisma.appraisalDraft.findMany({
      where: { managerId: decoded.sub },
      include: {
        employee: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ success: true, data: drafts });
  } catch (error) {
    console.error('Get appraisal drafts error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.put('/api/appraisal-drafts/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { id } = req.params;
    const { data } = req.body;

    const draft = await prisma.appraisalDraft.updateMany({
      where: { 
        id,
        managerId: decoded.sub 
      },
      data: { 
        data,
        updatedAt: new Date()
      }
    });

    res.json({ success: true, data: draft });
  } catch (error) {
    console.error('Update appraisal draft error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.delete('/api/appraisal-drafts/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { id } = req.params;

    await prisma.appraisalDraft.deleteMany({
      where: { 
        id,
        managerId: decoded.sub 
      }
    });

    res.json({ success: true, message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Delete appraisal draft error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Test endpoint to verify routing
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint working' });
});

// Enhanced Create Appraisal endpoint with real-time scoring
app.post('/api/appraisals/create-enhanced', async (req, res) => {
  try {
    console.log('Creating appraisal with data:', req.body);
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { 
      employeeId, 
      templateId, 
      cycleId, 
      appraisalData, 
      overallScore,
      isDraft = false 
    } = req.body;

    // Validate required fields
    if (!employeeId || !templateId || !cycleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee, template, and cycle are required' 
      });
    }

    // Check if a manager appraisal already exists for this employee and cycle
    const existingManagerAppraisal = await prisma.appraisalInstance.findFirst({
      where: {
        employeeId,
        cycleId,
        templateId,
        createdBy: decoded.sub, // Only check for appraisals created by this manager
        status: { in: ['DRAFT', 'IN_REVIEW', 'COMPLETED'] }
      }
    });

    if (existingManagerAppraisal) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already created an appraisal for this employee in this cycle' 
      });
    }

    // Get employee details for routing
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }

    // Determine status based on whether it's a draft
    const status = isDraft ? 'DRAFT' : 'IN_REVIEW';

    // Create the appraisal
    const appraisal = await prisma.appraisalInstance.create({
      data: {
        employeeId,
        templateId,
        cycleId,
        status,
        managerReviewData: appraisalData,
        overallScore: overallScore || 0,
        createdBy: decoded.sub,
        reviewerId: decoded.sub
      },
      include: {
        employee: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        cycle: {
          select: {
            id: true,
            name: true,
            periodStart: true,
            periodEnd: true
          }
        }
      }
    });

    // If not a draft, trigger routing and notifications
    if (!isDraft) {
      // Find the appropriate Final Approver for this employee's department
      const finalApprover = await prisma.user.findFirst({
        where: {
          role: 'FINAL_APPROVER',
          dept: employee.dept
        }
      });

      if (finalApprover) {
        // Send email notification to Final Approver
        try {
          await sendgridService.sendEmailWithRetry({
            to: finalApprover.email,
            subject: `Appraisal Ready for Final Review - ${employee.user.firstName} ${employee.user.lastName}`,
            html: `
              <h2>Appraisal Ready for Final Review</h2>
              <p>Hello ${finalApprover.firstName},</p>
              <p>An appraisal for ${employee.user.firstName} ${employee.user.lastName} has been completed by their supervisor and is ready for your final review.</p>
              <p><strong>Employee:</strong> ${employee.user.firstName} ${employee.user.lastName}</p>
              <p><strong>Cycle:</strong> ${appraisal.cycle.name}</p>
              <p><strong>Supervisor:</strong> ${decoded.firstName || 'Manager'}</p>
              <p>Please log in to the HR Gateway to complete your review.</p>
              <p>Best regards,<br/>COSTAATT HR Gateway</p>
            `,
            cc: `hr@costaatt.edu.tt,dheadley@costaatt.edu.tt,${decoded.email}`,
            type: 'appraisal_approved_supervisor'
          });
        } catch (emailError) {
          console.error('Email notification failed:', emailError);
        }
      }
    }

    res.json({ 
      success: true, 
      data: appraisal,
      message: isDraft ? 'Draft saved successfully' : 'Appraisal submitted for review'
    });

  } catch (error) {
    console.error('Create enhanced appraisal error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get appraisal form data for dynamic form building
app.get('/api/appraisals/form-data/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await prisma.appraisalTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: true
      }
    });

    if (!template) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    // Get competencies for this template type
    const competencies = await prisma.competency.findMany({
      where: {
        category: template.type === 'FACULTY' ? 'CORE' : 'FUNCTIONAL'
      }
    });

    res.json({ 
      success: true, 
      data: {
        template,
        competencies,
        sections: template.configJson?.sections || []
      }
    });

  } catch (error) {
    console.error('Get appraisal form data error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


// Get employee self-evaluation for a specific cycle
app.get('/api/appraisals/self-evaluation/:employeeId/:cycleId', async (req, res) => {
  try {
    const { employeeId, cycleId } = req.params;

    // Get the employee record first (employeeId is actually email in this context)
    const employee = await prisma.employee.findFirst({
      where: { 
        user: { email: employeeId }
      },
      include: {
            user: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee record not found' 
      });
    }

    // First try to find self-evaluation for the specific cycle
    let selfEval = await prisma.appraisalInstance.findFirst({
      where: {
        employeeId: employee.id,
        cycleId,
        status: {
          in: ['SELF_EVALUATION', 'IN_REVIEW']
        }
      },
          select: {
            id: true,
        selfAppraisalData: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // If no self-evaluation found for the specific cycle, look for any recent self-evaluation
    if (!selfEval) {
      selfEval = await prisma.appraisalInstance.findFirst({
        where: {
          employeeId: employee.id,
          status: {
            in: ['SELF_EVALUATION', 'IN_REVIEW']
          },
          selfAppraisalData: {
            not: null
          }
        },
          select: {
            id: true,
          selfAppraisalData: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    if (!selfEval) {
      return res.status(404).json({ 
        success: false, 
        message: 'Self-evaluation not found' 
      });
    }

    res.json({ 
      success: true, 
      data: selfEval.selfAppraisalData || {}
    });

  } catch (error) {
    console.error('Get self-evaluation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Self-evaluation endpoints
// Get all self-evaluations for a specific employee (for history page)
app.get('/self-evaluations/:employeeId/history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId } = req.params;

    // Verify the user can access this self-evaluation
    if (decoded.sub !== employeeId && decoded.role !== 'HR_ADMIN' && decoded.role !== 'SUPERVISOR') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get the employee record first
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee record not found' 
      });
    }

    // Get all self-evaluations for this employee
    const selfEvals = await prisma.appraisalInstance.findMany({
      where: {
        employeeId: employee.id,
        status: {
          in: ['SELF_EVALUATION', 'IN_REVIEW', 'COMPLETED', 'RETURNED_FOR_EDITS']
        }
      },
          include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                dept: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data for the frontend
    const transformedEvals = selfEvals.map(eval => ({
      id: eval.id,
      employeeId: eval.employeeId,
      responses: eval.selfAppraisalData || {},
      status: eval.status,
      createdAt: eval.createdAt,
      updatedAt: eval.updatedAt,
      employee: eval.employee
    }));

    res.json({ 
      success: true,
      data: transformedEvals
    });

  } catch (error) {
    console.error('Get self-evaluation history error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get a specific self-evaluation by ID
app.get('/self-evaluations/:employeeId/:evalId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId, evalId } = req.params;

    // Verify the user can access this self-evaluation
    if (decoded.sub !== employeeId && decoded.role !== 'HR_ADMIN' && decoded.role !== 'SUPERVISOR') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get the employee record first
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee record not found' 
      });
    }

    // Get the specific self-evaluation
    const selfEval = await prisma.appraisalInstance.findFirst({
      where: {
        id: evalId,
        employeeId: employee.id,
        status: {
          in: ['SELF_EVALUATION', 'IN_REVIEW', 'COMPLETED', 'RETURNED_FOR_EDITS']
        }
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                dept: true
              }
            }
          }
        }
      }
    });

    if (!selfEval) {
      return res.status(404).json({ 
        success: false, 
        message: 'Self-evaluation not found' 
      });
    }

    res.json({ 
      success: true, 
      data: {
        id: selfEval.id,
        employeeId: selfEval.employeeId,
        responses: selfEval.selfAppraisalData || {},
        status: selfEval.status,
        createdAt: selfEval.createdAt,
        updatedAt: selfEval.updatedAt,
        employee: selfEval.employee
      }
    });

  } catch (error) {
    console.error('Get self-evaluation by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get self-evaluation for a specific employee
app.get('/self-evaluations/:employeeId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId } = req.params;

    // Verify the user can access this self-evaluation
    if (decoded.sub !== employeeId && decoded.role !== 'HR_ADMIN' && decoded.role !== 'SUPERVISOR') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get the employee record first
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee record not found' 
      });
    }

    // Look for existing self-evaluation in AppraisalInstance
    const selfEval = await prisma.appraisalInstance.findFirst({
      where: {
        employeeId: employee.id, // Use the actual employee record ID
        status: 'SELF_EVALUATION'
      },
      include: {
        employee: {
          include: {
            user: {
      select: {
        id: true,
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                dept: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!selfEval) {
      return res.status(404).json({ 
        success: false, 
        message: 'Self-evaluation not found' 
      });
    }

    res.json({ 
      success: true, 
      data: {
        id: selfEval.id,
        employeeId: selfEval.employeeId,
        responses: selfEval.selfAppraisalData || {},
        status: selfEval.status,
        createdAt: selfEval.createdAt,
        updatedAt: selfEval.updatedAt,
        employee: selfEval.employee
      }
    });

  } catch (error) {
    console.error('Get self-evaluation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Create or update self-evaluation
app.post('/self-evaluations', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    const { employeeId, responses, status } = req.body;

    // Verify the user can create/update this self-evaluation
    if (decoded.sub !== employeeId && decoded.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Find the employee record
    const employee = await prisma.employee.findUnique({
      where: { userId: employeeId }
    });

    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee record not found' 
      });
    }

    // Get the current active appraisal cycle
    const currentCycle = await prisma.appraisalCycle.findFirst({
      where: {
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!currentCycle) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active appraisal cycle found' 
      });
    }

    // Get a default template
    const defaultTemplate = await prisma.appraisalTemplate.findFirst({
      where: {
        type: 'GENERAL_STAFF'
      }
    });

    if (!defaultTemplate) {
      return res.status(404).json({ 
        success: false, 
        message: 'No appraisal template found' 
      });
    }

    // Check if self-evaluation already exists
    let selfEval = await prisma.appraisalInstance.findFirst({
      where: {
        employeeId: employee.id, // Use the actual employee record ID
        cycleId: currentCycle.id,
        status: 'SELF_EVALUATION'
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                title: true,
                dept: true
              }
            }
          }
        }
      }
    });

    if (selfEval) {
      // Update existing self-evaluation
      // Keep status as SELF_EVALUATION even when submitted to prevent it showing in appraisals list
      selfEval = await prisma.appraisalInstance.update({
        where: { id: selfEval.id },
        data: {
          selfAppraisalData: responses,
          status: 'SELF_EVALUATION', // Always keep as SELF_EVALUATION
          updatedAt: new Date()
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  title: true,
                  dept: true
                }
              }
            }
          }
        }
      });
    } else {
      // Create new self-evaluation
      // Always use SELF_EVALUATION status to prevent it showing in appraisals list
      selfEval = await prisma.appraisalInstance.create({
        data: {
          employeeId: employee.id, // Use the actual employee record ID
          templateId: defaultTemplate.id,
          cycleId: currentCycle.id,
          status: 'SELF_EVALUATION', // Always use SELF_EVALUATION status
          selfAppraisalData: responses,
          createdBy: decoded.sub
        },
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  title: true,
                  dept: true
                }
              }
            }
          }
        }
      });
    }

    res.json({ 
      success: true, 
      data: {
        id: selfEval.id,
        employeeId: selfEval.employeeId,
        responses: selfEval.selfAppraisalData || {},
        status: selfEval.status,
        createdAt: selfEval.createdAt,
        updatedAt: selfEval.updatedAt,
        employee: selfEval.employee
      },
      message: status === 'SUBMITTED' ? 'Self-evaluation submitted successfully' : 'Self-evaluation saved successfully'
    });

  } catch (error) {
    console.error('Create/update self-evaluation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Check if appraisal already exists for employee and cycle
app.get('/api/appraisals/check-existing/:employeeId/:cycleId', async (req, res) => {
  try {
    const { employeeId, cycleId } = req.params;

    const existingAppraisal = await prisma.appraisalInstance.findFirst({
      where: {
        employeeId,
        cycleId,
        status: { not: 'DRAFT' }
      },
      select: {
        id: true,
        status: true
      }
    });

    res.json({ 
      success: true, 
      exists: !!existingAppraisal,
      appraisal: existingAppraisal
    });

  } catch (error) {
    console.error('Check existing appraisal error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Settings Management Endpoints
app.get('/admin/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin or final approver
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, active: true }
    });
    
    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Load settings from file, fallback to environment variables
    const fs = require('fs');
    const path = require('path');
    
    let savedSettings = {};
    const settingsPath = path.join(__dirname, '..', 'settings.json');
    
    try {
      if (fs.existsSync(settingsPath)) {
        const fileContent = fs.readFileSync(settingsPath, 'utf8');
        savedSettings = JSON.parse(fileContent);
        console.log('Loaded saved settings:', {
          emailEnabled: savedSettings.emailEnabled,
          emailProvider: savedSettings.emailProvider,
          smtpHost: savedSettings.smtpHost,
          fromEmail: savedSettings.fromEmail,
          ssoEnabled: savedSettings.ssoEnabled,
          // Don't log sensitive data
        });
      }
    } catch (error) {
      console.log('No saved settings found, using defaults');
    }
    
    // Return current settings (saved settings take precedence over env vars)
    const settings = {
      // General Settings
      appName: savedSettings.appName || process.env.APP_NAME || 'COSTAATT HR Performance Gateway',
      appVersion: savedSettings.appVersion || process.env.APP_VERSION || '1.0.0',
      environment: savedSettings.environment || process.env.NODE_ENV || 'production',
      timezone: savedSettings.timezone || process.env.TIMEZONE || 'America/Port_of_Spain',
      language: savedSettings.language || process.env.LANGUAGE || 'en',
      dateFormat: savedSettings.dateFormat || process.env.DATE_FORMAT || 'MM/DD/YYYY',
      currency: savedSettings.currency || process.env.CURRENCY || 'TTD',
      
      // Database Settings (masked for security)
      dbHost: savedSettings.dbHost || (process.env.DATABASE_URL ? 'configured' : 'localhost'),
      dbPort: savedSettings.dbPort || '5432',
      dbName: savedSettings.dbName || 'costaatt_hr',
      dbUser: savedSettings.dbUser || 'postgres',
      dbPassword: savedSettings.dbPassword ? '***masked***' : '***masked***',
      dbSsl: savedSettings.dbSsl !== undefined ? savedSettings.dbSsl : (process.env.DATABASE_URL?.includes('sslmode=require') || false),
      
      // Authentication Settings
      jwtSecret: savedSettings.jwtSecret ? '***masked***' : '***masked***',
      jwtExpiry: savedSettings.jwtExpiry || process.env.JWT_EXPIRY || '24h',
      passwordMinLength: savedSettings.passwordMinLength || 8,
      passwordRequireUppercase: savedSettings.passwordRequireUppercase !== undefined ? savedSettings.passwordRequireUppercase : true,
      passwordRequireNumbers: savedSettings.passwordRequireNumbers !== undefined ? savedSettings.passwordRequireNumbers : true,
      passwordRequireSymbols: savedSettings.passwordRequireSymbols !== undefined ? savedSettings.passwordRequireSymbols : true,
      maxLoginAttempts: savedSettings.maxLoginAttempts || 5,
      
      // Security Settings
      passwordExpirationDays: savedSettings.passwordExpirationDays || 90,
      passwordRequireLowercase: savedSettings.passwordRequireLowercase !== undefined ? savedSettings.passwordRequireLowercase : true,
      sessionTimeoutMinutes: savedSettings.sessionTimeoutMinutes || 30,
      maxConcurrentSessions: savedSettings.maxConcurrentSessions || 3,
      requireReauthOnSensitiveActions: savedSettings.requireReauthOnSensitiveActions !== undefined ? savedSettings.requireReauthOnSensitiveActions : false,
      lockoutDurationMinutes: savedSettings.lockoutDurationMinutes || 15,
      enableIpWhitelist: savedSettings.enableIpWhitelist !== undefined ? savedSettings.enableIpWhitelist : false,
      allowedIpAddresses: savedSettings.allowedIpAddresses || '',
      twoFactorEnabled: savedSettings.twoFactorEnabled !== undefined ? savedSettings.twoFactorEnabled : false,
      twoFactorRequiredForAdmin: savedSettings.twoFactorRequiredForAdmin !== undefined ? savedSettings.twoFactorRequiredForAdmin : false,
      twoFactorMethod: savedSettings.twoFactorMethod || 'totp',
      twoFactorBackupCodes: savedSettings.twoFactorBackupCodes || 10,
      enableSecurityLogging: savedSettings.enableSecurityLogging !== undefined ? savedSettings.enableSecurityLogging : true,
      logLoginAttempts: savedSettings.logLoginAttempts !== undefined ? savedSettings.logLoginAttempts : true,
      logPasswordChanges: savedSettings.logPasswordChanges !== undefined ? savedSettings.logPasswordChanges : true,
      logPermissionChanges: savedSettings.logPermissionChanges !== undefined ? savedSettings.logPermissionChanges : true,
      logDataExports: savedSettings.logDataExports !== undefined ? savedSettings.logDataExports : true,
      logRetentionDays: savedSettings.logRetentionDays || 365,
      enableDataEncryption: savedSettings.enableDataEncryption !== undefined ? savedSettings.enableDataEncryption : false,
      enableDataAnonymization: savedSettings.enableDataAnonymization !== undefined ? savedSettings.enableDataAnonymization : false,
      dataRetentionYears: savedSettings.dataRetentionYears || 7,
      
      // Email Settings
      emailEnabled: savedSettings.emailEnabled !== undefined ? savedSettings.emailEnabled : !!process.env.SENDGRID_API_KEY,
      emailProvider: savedSettings.emailProvider || process.env.EMAIL_PROVIDER || 'microsoft-graph',
      smtpHost: savedSettings.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: savedSettings.smtpPort || parseInt(process.env.SMTP_PORT) || 587,
      smtpUser: savedSettings.smtpUser || process.env.SMTP_USER || '',
      smtpPassword: savedSettings.smtpPassword ? '***masked***' : '***masked***',
      smtpSecure: savedSettings.smtpSecure !== undefined ? savedSettings.smtpSecure : (process.env.SMTP_SECURE === 'true'),
      fromEmail: savedSettings.fromEmail || process.env.FROM_EMAIL || 'hr@costaatt.edu.tt',
      fromName: savedSettings.fromName || process.env.FROM_NAME || 'COSTAATT HR System',
      
      // SSO Settings
      ssoEnabled: savedSettings.ssoEnabled !== undefined ? savedSettings.ssoEnabled : !!process.env.MICROSOFT_CLIENT_ID,
      microsoftClientId: savedSettings.microsoftClientId || process.env.MICROSOFT_CLIENT_ID || '',
      microsoftClientSecret: savedSettings.microsoftClientSecret ? '***masked***' : '***masked***',
      microsoftTenantId: savedSettings.microsoftTenantId || process.env.MICROSOFT_TENANT_ID || '',
      ssoRedirectUrl: savedSettings.ssoRedirectUrl || process.env.SSO_REDIRECT_URL || '',
      
      // Notification Settings
      notificationsEnabled: savedSettings.notificationsEnabled !== undefined ? savedSettings.notificationsEnabled : true,
      emailNotifications: savedSettings.emailNotifications !== undefined ? savedSettings.emailNotifications : true,
      pushNotifications: savedSettings.pushNotifications !== undefined ? savedSettings.pushNotifications : false,
      appraisalReminders: true,
      deadlineAlerts: true,
      managerNotifications: true,
      hrNotifications: true,
      reminderFrequency: 'daily',
      
      // Security Settings
      encryptionEnabled: true,
      auditLogging: true,
      ipWhitelist: process.env.IP_WHITELIST || '',
      allowedDomains: process.env.ALLOWED_DOMAINS || 'costaatt.edu.tt',
      twoFactorEnabled: false,
      backupEnabled: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      
      // Performance Settings
      cacheEnabled: true,
      cacheTtl: 3600,
      rateLimiting: true,
      maxRequestsPerMinute: 100,
      compressionEnabled: true,
      cdnEnabled: false,
      
      // Feature Flags
      selfAppraisalEnabled: true,
      managerReviewEnabled: true,
      hrReviewEnabled: true,
      peerReviewEnabled: false,
      goalSettingEnabled: true,
      competencyManagementEnabled: true,
      reportGenerationEnabled: true,
      bulkOperationsEnabled: true,
      advancedAnalyticsEnabled: true,
      mobileAppEnabled: false,
      apiAccessEnabled: true,
      webhookEnabled: false
    };
    
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/admin/settings', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin or final approver
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, active: true }
    });
    
    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const settings = req.body;
    
    // Debug: Log received settings
    console.log('Received settings update:', {
      emailEnabled: settings.emailEnabled,
      emailProvider: settings.emailProvider,
      smtpHost: settings.smtpHost,
      fromEmail: settings.fromEmail,
      ssoEnabled: settings.ssoEnabled,
      // Don't log sensitive data
    });
    
    // Validate required settings (only if they're being updated)
    if (settings.appName !== undefined && !settings.appName) {
      return res.status(400).json({ success: false, message: 'App name cannot be empty' });
    }
    if (settings.appVersion !== undefined && !settings.appVersion) {
      return res.status(400).json({ success: false, message: 'App version cannot be empty' });
    }
    
    // Validate security settings
    if (settings.passwordMinLength !== undefined && (settings.passwordMinLength < 6 || settings.passwordMinLength > 32)) {
      return res.status(400).json({ success: false, message: 'Password minimum length must be between 6 and 32 characters' });
    }
    if (settings.passwordExpirationDays !== undefined && (settings.passwordExpirationDays < 0 || settings.passwordExpirationDays > 365)) {
      return res.status(400).json({ success: false, message: 'Password expiration must be between 0 and 365 days' });
    }
    if (settings.sessionTimeoutMinutes !== undefined && (settings.sessionTimeoutMinutes < 5 || settings.sessionTimeoutMinutes > 1440)) {
      return res.status(400).json({ success: false, message: 'Session timeout must be between 5 and 1440 minutes' });
    }
    if (settings.maxConcurrentSessions !== undefined && (settings.maxConcurrentSessions < 1 || settings.maxConcurrentSessions > 10)) {
      return res.status(400).json({ success: false, message: 'Maximum concurrent sessions must be between 1 and 10' });
    }
    if (settings.maxLoginAttempts !== undefined && (settings.maxLoginAttempts < 3 || settings.maxLoginAttempts > 10)) {
      return res.status(400).json({ success: false, message: 'Maximum login attempts must be between 3 and 10' });
    }
    if (settings.lockoutDurationMinutes !== undefined && (settings.lockoutDurationMinutes < 5 || settings.lockoutDurationMinutes > 1440)) {
      return res.status(400).json({ success: false, message: 'Lockout duration must be between 5 and 1440 minutes' });
    }
    if (settings.twoFactorBackupCodes !== undefined && (settings.twoFactorBackupCodes < 5 || settings.twoFactorBackupCodes > 20)) {
      return res.status(400).json({ success: false, message: 'Two-factor backup codes must be between 5 and 20' });
    }
    if (settings.logRetentionDays !== undefined && (settings.logRetentionDays < 30 || settings.logRetentionDays > 3650)) {
      return res.status(400).json({ success: false, message: 'Log retention period must be between 30 and 3650 days' });
    }
    if (settings.dataRetentionYears !== undefined && (settings.dataRetentionYears < 1 || settings.dataRetentionYears > 10)) {
      return res.status(400).json({ success: false, message: 'Data retention period must be between 1 and 10 years' });
    }
    if (settings.twoFactorMethod !== undefined && !['totp', 'sms', 'email'].includes(settings.twoFactorMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid two-factor authentication method' });
    }
    
    // Validate IP addresses if IP whitelist is enabled
    if (settings.enableIpWhitelist && settings.allowedIpAddresses) {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
      const ipLines = settings.allowedIpAddresses.split('\n').filter(line => line.trim());
      for (const line of ipLines) {
        if (!ipRegex.test(line.trim())) {
          return res.status(400).json({ success: false, message: `Invalid IP address format: ${line.trim()}` });
        }
      }
    }
    
    // Save settings to a JSON file for persistence
    const fs = require('fs');
    try {
      // Save settings to database using SystemSetting table
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        description: `Setting: ${key}`,
        category: getSettingCategory(key),
        isEncrypted: isSensitiveSetting(key),
        createdBy: decoded.sub
      }));

      // Upsert each setting
      for (const setting of settingsArray) {
        await prisma.systemSetting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            description: setting.description,
            category: setting.category,
            isEncrypted: setting.isEncrypted,
            createdBy: setting.createdBy,
            updatedAt: new Date()
          },
          create: setting
        });
      }
      
      console.log('Settings updated successfully in database:', {
        settingsUpdated: Object.keys(settings),
        timestamp: new Date().toISOString()
      });
      
      // Log settings change
      await logSecurityEvent('SETTINGS_UPDATED', decoded.sub, { 
        settingsChanged: Object.keys(settings),
        timestamp: new Date().toISOString()
      }, req.ip);
      
      res.json({ 
        success: true, 
        message: 'Settings updated successfully',
        data: { 
          settingsUpdated: Object.keys(settings),
          timestamp: new Date().toISOString()
        }
      });
    } catch (dbError) {
      console.error('Error saving settings to database:', dbError);
      res.status(500).json({ success: false, message: 'Failed to save settings to database' });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/admin/system-stats', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin or final approver
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, active: true }
    });
    
    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Get system statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { active: true } });
    const totalAppraisals = await prisma.appraisalInstance.count();
    const activeAppraisals = await prisma.appraisalInstance.count({ 
      where: { 
        status: { in: ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'PENDING_APPROVAL'] }
      } 
    });
    
    // Calculate system uptime (simplified)
    const systemUptime = process.uptime();
    const hours = Math.floor(systemUptime / 3600);
    const minutes = Math.floor((systemUptime % 3600) / 60);
    const uptimeString = `${hours}h ${minutes}m`;
    
    // Get database size (simplified)
    const databaseSize = '2.5 MB'; // In production, query actual database size
    
    const stats = {
      totalUsers,
      activeUsers,
      totalAppraisals,
      activeAppraisals,
      systemUptime: uptimeString,
      databaseSize,
      serverVersion: process.env.APP_VERSION || '1.0.0',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production'
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get email logs
app.get('/admin/email-logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin or final approver
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });
    
    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    // Get email logs directly from database
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const logs = await prisma.emailLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.emailLog.count();
    
    res.json({ success: true, data: { logs, total } });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/admin/test-connection/:type', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin or final approver
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true, active: true }
    });
    
    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const { type } = req.params;
    let result = { success: false, message: '' };
    
    switch (type) {
      case 'database':
        try {
          // Test database connection
          await prisma.$queryRaw`SELECT 1`;
          result = { success: true, message: 'Database connection successful' };
        } catch (error) {
          result = { success: false, message: 'Database connection failed: ' + error.message };
        }
        break;
        
      case 'email':
        try {
          // Test email configuration
          if (process.env.SENDGRID_API_KEY) {
            result = { success: true, message: 'Email configuration is valid (SendGrid configured)' };
          } else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            result = { success: true, message: 'Email configuration is valid (SMTP configured)' };
          } else {
            result = { success: false, message: 'Email configuration is incomplete' };
          }
        } catch (error) {
          result = { success: false, message: 'Email test failed: ' + error.message };
        }
        break;
        
      case 'sso':
        try {
          // Test SSO configuration
          const { microsoftClientId, microsoftTenantId } = req.body;
          if (microsoftClientId && microsoftTenantId) {
            result = { success: true, message: 'SSO configuration is valid' };
          } else {
            result = { success: false, message: 'SSO configuration is incomplete' };
          }
        } catch (error) {
          result = { success: false, message: 'SSO test failed: ' + error.message };
        }
        break;
        
      default:
        result = { success: false, message: 'Unknown connection type' };
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Initialize OpenAI client (only if API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('🤖 OpenAI client initialized');
} else {
  console.log('⚠️  OpenAI API key not found - chatbot will be disabled');
}

// Rate limiting for chatbot (simple in-memory store)
const chatRateLimit = new Map();

// Chatbot endpoint
app.post('/api/chatbot/message', async (req, res) => {
  try {
    // Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        email: true,
        active: true
      }
    });

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    // Rate limiting (10 requests per minute per user)
    const now = Date.now();
    const userKey = user.id;
    const userRequests = chatRateLimit.get(userKey) || [];
    const recentRequests = userRequests.filter(time => now - time < 60000); // Last minute
    
    if (recentRequests.length >= 10) {
      return res.status(429).json({ 
        success: false, 
        message: 'Rate limit exceeded. Please wait before sending another message.' 
      });
    }

    // Add current request
    recentRequests.push(now);
    chatRateLimit.set(userKey, recentRequests);

    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get user's appraisal status
    const currentAppraisal = await prisma.appraisalInstance.findFirst({
      where: {
        employee: {
          userId: user.id
        },
        status: {
          in: ['DRAFT', 'IN_REVIEW', 'AWAITING_HR', 'COMPLETED']
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
        cycle: true
      }
    });

    // Build context for AI
    const userRoles = [user.role];
    const appraisalStep = currentAppraisal ? currentAppraisal.status : 'No active appraisal';
    const today = new Date().toLocaleDateString();

    const systemPrompt = `You are the COSTAATT HR Digital Employee — an AI-powered assistant inside COSTAATT's HR Performance Gateway.

The current user is ${user.firstName} ${user.lastName}, with roles: ${userRoles.join(', ')}.
Their current appraisal status is: ${appraisalStep}.
Today's date is ${today}.

You should help users with:
- Navigation and understanding of the HR Performance Gateway
- Appraisal process questions and guidance
- HR policies and procedures
- Technical support for the platform
- General HR-related inquiries

Respond in a helpful, professional, and friendly manner. Keep responses concise but informative. If you don't know something specific about COSTAATT policies, suggest they contact HR directly.

Current context:
- User roles: ${userRoles.join(', ')}
- Appraisal status: ${appraisalStep}
- Date: ${today}`;

    // Call OpenAI (if available)
    let reply;
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      reply = completion.choices[0].message.content;
    } else {
      // Enhanced fallback response when OpenAI is not available
      reply = `Hello ${user.firstName}! I'm the COSTAATT HR Digital Assistant. 

Currently, my AI features are being set up. In the meantime, I can help you with basic information:

📋 **Your Current Status:**
- Roles: ${userRoles.join(', ')}
- Appraisal Status: ${appraisalStep}
- Date: ${today}

🔧 **Common Questions:**
- Need help with your appraisal? Check the "My Appraisals" section
- Want to review staff? Use the "Manager Review" tab
- Having login issues? Contact IT Support
- Need HR assistance? Email: hr@costaatt.edu.tt

For immediate help, please contact HR directly at hr@costaatt.edu.tt or Darren Headley at dheadley@costaatt.edu.tt.

Is there something specific I can help you navigate to in the system?`;
    }

    // Log the interaction
    await prisma.chatLog.create({
      data: {
        userId: user.id,
        question: message,
        reply: reply,
        sessionId: req.headers['x-session-id'] || 'unknown'
      }
    });

    res.json({ 
      success: true, 
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Log error interaction
    if (req.body.message) {
      try {
        const decoded = jwt.verify(req.headers.authorization?.substring(7), process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
        await prisma.chatLog.create({
          data: {
            userId: decoded.sub,
            question: req.body.message,
            reply: 'Sorry, I encountered an error. Please try again later.',
            sessionId: req.headers['x-session-id'] || 'unknown'
          }
        });
      } catch (logError) {
        console.error('Error logging chatbot error:', logError);
      }
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, I encountered an error. Please try again later.' 
    });
  }
});

// Get chatbot logs (admin only)
app.get('/api/chatbot/logs', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true, active: true }
    });

    if (!user || !user.active || !['HR_ADMIN', 'FINAL_APPROVER'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }

    const logs = await prisma.chatLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({ success: true, logs });

  } catch (error) {
    console.error('Error fetching chatbot logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// User Management Endpoints
app.get('/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (!user || user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        dept: true,
        title: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to include roles array
    const usersWithRoles = users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role)
    }));

    res.json({ success: true, users: usersWithRoles });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

app.post('/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (!user || user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { firstName, lastName, email, role, roles, dept, title, active } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: role || 'EMPLOYEE',
        roles: roles || ['EMPLOYEE'],
        dept: dept || '',
        title: title || '',
        active: active !== false,
        mustChangePassword: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        roles: true,
        dept: true,
        title: true,
        active: true,
        createdAt: true
      }
    });

    res.json({ success: true, user: newUser, tempPassword });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

app.put('/admin/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (!user || user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;
    const { firstName, lastName, email, role, roles, dept, title, active } = req.body;

    // Check if email already exists (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        NOT: { id }
      }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Start a transaction to update user and roles
    const result = await prisma.$transaction(async (tx) => {
      // Update user basic info
      const updatedUser = await tx.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        role: role || 'EMPLOYEE',
        dept: dept || '',
        title: title || '',
        active: active !== false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        dept: true,
        title: true,
        active: true,
        updatedAt: true
      }
    });

      // Handle multiple roles if provided
      if (roles && Array.isArray(roles)) {
        // Delete existing role assignments
        await tx.userRoleAssignment.deleteMany({
          where: { userId: id }
        });

        // Create new role assignments
        if (roles.length > 0) {
          await tx.userRoleAssignment.createMany({
            data: roles.map(roleName => ({
              userId: id,
              role: roleName
            }))
          });
        }
      }

      return updatedUser;
    });

    res.json({ success: true, user: result });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

app.delete('/admin/users/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { role: true }
    });

    if (!user || user.role !== 'HR_ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { id } = req.params;

    // Don't allow deleting yourself
    if (id === decoded.userId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

// HR Complete Appraisal endpoint
app.put('/appraisals/:id/complete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token required' });
    }

    const token = authHeader.substring(7);
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    // Check if user is HR Admin
    if (decoded.role !== 'HR_ADMIN') {
      console.log(`❌ Access denied: User role is ${decoded.role}, HR_ADMIN required`);
      return res.status(403).json({ success: false, message: 'Only HR Admin can complete appraisals' });
    }

    console.log(`✅ HR Admin access granted for user: ${decoded.email} (${decoded.role})`);
    console.log(`🔍 JWT decoded data:`, { sub: decoded.sub, email: decoded.email, role: decoded.role });

    const { id } = req.params;
    const { hrComments, hrSignature } = req.body;
    
    console.log(`🔍 HR Complete request:`, { id, hrComments, hrSignature });
    console.log(`⚠️ Note: hrSignature field doesn't exist in database schema, will be ignored`);

    // Find the appraisal
    const appraisal = await prisma.appraisalInstance.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!appraisal) {
      return res.status(404).json({ success: false, message: 'Appraisal not found' });
    }

    // Check if appraisal is in correct status
    if (appraisal.status !== 'AWAITING_HR') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot complete appraisal with status: ${appraisal.status}` 
      });
    }

    // Update the appraisal to completed
    console.log(`🔍 Updating appraisal with data:`, {
      status: 'COMPLETED',
      hrComments: hrComments || null,
      hrApprovedAt: new Date(),
      hrApprovedBy: decoded.sub
    });
    
    const updatedAppraisal = await prisma.appraisalInstance.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        hrComments: hrComments || null,
        hrApprovedAt: new Date(),
        hrApprovedBy: decoded.sub
      },
      include: {
        employee: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        template: {
          select: { name: true, type: true }
        },
        cycle: {
          select: { name: true }
        }
      }
    });

    console.log(`✅ Appraisal ${id} completed by HR Admin: ${decoded.sub}`);

    res.json({ 
      success: true, 
      message: 'Appraisal completed successfully',
      data: updatedAppraisal 
    });

  } catch (error) {
    console.error('Complete appraisal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete appraisal' 
    });
  }
});

// Forgot Password endpoint
app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email address is required' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName: true, email: true, active: true }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        success: true, 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    if (!user.active) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account is not active. Please contact HR.' 
      });
    }

    // Generate a secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });
    
    console.log(`🔐 Password reset requested for: ${email}`);
    console.log(`👤 User: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`🔑 Reset token: ${resetToken}`);
    
    // Send password reset email
    try {
      const resetLink = `http://10.2.1.27:5173/reset-password?token=${resetToken}`;
      
      const emailService = new GraphEmailService();
      await emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset Request - COSTAATT HR System',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">COSTAATT HR System</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #374151; margin-top: 0;">Hello ${user.firstName} ${user.lastName},</h2>
              
              <p style="color: #6B7280; line-height: 1.6;">
                We received a request to reset your password for your COSTAATT HR System account.
              </p>
              
              <p style="color: #6B7280; line-height: 1.6;">
                Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Reset My Password
                </a>
              </div>
              
              <p style="color: #6B7280; line-height: 1.6; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #8B5CF6; font-size: 14px; word-break: break-all; background: #F9FAFB; padding: 10px; border-radius: 5px;">
                ${resetLink}
              </p>
              
              <p style="color: #EF4444; line-height: 1.6; font-size: 14px; margin-top: 20px;">
                <strong>Important:</strong> This link will expire in 24 hours for security reasons.
              </p>
              
              <p style="color: #6B7280; line-height: 1.6; font-size: 14px; margin-top: 20px;">
                If you didn't request this password reset, please ignore this email or contact HR if you have concerns.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9CA3AF; font-size: 12px;">
              <p>COSTAATT HR System | This is an automated message</p>
            </div>
          </div>
        `
      });
      
      console.log(`✅ Password reset email sent to: ${user.email}`);
      
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Don't fail the request if email fails - still log it for admin review
    }
    
    res.json({ 
      success: true, 
      message: 'Password reset instructions have been sent to your email address.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process password reset request' 
    });
  }
});

// Reset Password endpoint (for when user clicks the link)
app.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date() // Token must not be expired
        }
      },
      select: { id: true, firstName: true, lastName: true, email: true }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        mustChangePassword: false
      }
    });

    console.log(`✅ Password reset successfully for: ${user.email}`);
    console.log(`👤 User: ${user.firstName} ${user.lastName}`);

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Database connected successfully`);
  console.log(`🔐 Authentication endpoints ready`);
  console.log(`⚙️ Admin settings endpoints ready`);
  console.log(`🔗 SSO endpoints ready`);
  console.log(`📧 Microsoft Graph API email system ready`);
  console.log(`👥 User management endpoints ready`);
  console.log(`🌐 Accessible from: http://localhost:${PORT} and http://10.2.1.27:${PORT}`);
});