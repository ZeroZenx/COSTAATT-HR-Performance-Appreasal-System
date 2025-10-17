const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Simple login endpoint
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
        active: true
      }
    });

    if (!user || !user.active) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Basic endpoints
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/competencies', async (req, res) => {
  try {
    const competencies = await prisma.competency.findMany();
    res.json(competencies);
  } catch (error) {
    console.error('Error fetching competencies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/appraisal-instances/cycles', async (req, res) => {
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

app.get('/appraisal-instances/templates', async (req, res) => {
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

// Dashboard endpoints
app.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalAppraisals,
      draftAppraisals,
      submittedAppraisals,
      completedAppraisals,
    ] = await Promise.all([
      prisma.appraisalInstance.count().catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: 'DRAFT' } }).catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: { in: ['IN_REVIEW', 'REVIEWED_MANAGER'] } } }).catch(() => 0),
      prisma.appraisalInstance.count({ where: { status: 'COMPLETED' } }).catch(() => 0),
    ]);

    const completionRate = totalAppraisals > 0 ? (completedAppraisals / totalAppraisals) * 100 : 0;

    res.json({
      totalAppraisals,
      draftAppraisals,
      submittedAppraisals,
      completedAppraisals,
      completionRate: Math.round(completionRate * 10) / 10,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Employees: http://localhost:${PORT}/employees`);
  console.log(`🎯 Competencies: http://localhost:${PORT}/competencies`);
});
