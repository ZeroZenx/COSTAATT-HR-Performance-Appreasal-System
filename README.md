# COSTAATT HR Performance Gateway

A comprehensive performance management system for the College of Science, Technology and Applied Arts of Trinidad and Tobago (COSTAATT).

## 🚀 Features

- **Employee Management**: Complete staff directory with 347+ employees
- **Performance Appraisals**: Multi-category appraisal system with role-specific templates
- **Appraisal Cycles**: Flexible performance review periods
- **Competency Framework**: Comprehensive performance standards
- **Role-Based Access Control**: HR Admin, Supervisor, and Employee roles
- **Local & SSO Authentication**: Microsoft 365 integration with local account support
- **Email Notifications**: Automated appraisal workflow notifications
- **Audit Logging**: Complete activity tracking
- **Responsive Design**: Modern, mobile-friendly interface

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Microsoft Azure AD
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query + React Hook Form
- **Validation**: Zod schemas

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn
- Git

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/costaatt-hr-performance.git
cd costaatt-hr-performance
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb costaatt_hr

# Copy environment file
cp env.example .env

# Update .env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/costaatt_hr"
```

### 4. Database Migration
```bash
# Generate Prisma client
npm run db:generate --workspace=@costaatt/api

# Run database migrations
npm run db:migrate --workspace=@costaatt/api

# Seed initial data
npm run db:seed --workspace=@costaatt/api
```

### 5. Environment Configuration
Update `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/costaatt_hr"

# JWT Secrets (generate secure keys for production)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Application
NODE_ENV="development"
APP_BASE_URL="http://localhost:5173"
PORT=3000

# Authentication
ALLOW_LOCAL_AUTH=true
PASSWORD_MIN_LENGTH=10

# Email (configure for your SMTP provider)
MAIL_PROVIDER="smtp"
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"

# HR Notifications
HR_NOTIFY_LIST="hr@costaatt.edu.tt,admin@costaatt.edu.tt"
```

## 🚀 Development

### Start Development Servers
```bash
# Start backend (API server)
npm run dev --workspace=@costaatt/api

# Start frontend (React app)
npm run dev --workspace=@costaatt/web
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### Default Login Credentials
- **Admin**: admin@costaatt.edu.tt / admin123
- **Supervisor**: supervisor@costaatt.edu.tt / supervisor123
- **Employee**: employee@costaatt.edu.tt / employee123

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile data
- **Employee**: Staff information and employment details
- **AppraisalTemplate**: Performance review templates by category
- **AppraisalCycle**: Performance review periods
- **Appraisal**: Individual performance reviews
- **Competency**: Performance standards and behaviors
- **AuditLog**: System activity tracking

### Employee Categories
- **Executive Management**: VPs, Directors, President
- **General Staff**: Administrative staff, coordinators
- **Faculty**: Lecturers, professors, academic staff
- **Dean**: Academic deans and department heads
- **Clinical Instructor**: Clinical and practical instructors

## 🔧 Available Scripts

### Development
```bash
npm run dev                    # Start all services
npm run dev --workspace=@costaatt/api    # Backend only
npm run dev --workspace=@costaatt/web    # Frontend only
```

### Database
```bash
npm run db:generate           # Generate Prisma client
npm run db:migrate            # Run migrations
npm run db:reset              # Reset database
npm run db:seed                # Seed initial data
```

### Production
```bash
npm run build                  # Build all packages
npm run start                  # Start production servers
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Run database migrations
4. Start the application: `npm run start`

### Environment Variables (Production)
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@host:5432/costaatt_hr"
JWT_SECRET="your-production-jwt-secret"
JWT_REFRESH_SECRET="your-production-refresh-secret"
APP_BASE_URL="https://your-domain.com"
```

## 📁 Project Structure

```
costaatt-hr-performance/
├── apps/
│   ├── api/                   # Backend API
│   │   ├── src/
│   │   ├── prisma/
│   │   └── scripts/
│   └── web/                   # Frontend React app
│       ├── src/
│       ├── public/
│       └── dist/
├── packages/
│   └── shared/                # Shared utilities
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Argon2id for secure password storage
- **Role-Based Access**: Granular permissions system
- **Audit Logging**: Complete activity tracking
- **Input Validation**: Zod schema validation
- **CORS Protection**: Configured for production security

## 📧 Email Configuration

The system supports multiple email providers:
- **SMTP**: Standard SMTP servers
- **SendGrid**: Cloud email service
- **AWS SES**: Amazon Simple Email Service

Configure in your `.env` file:
```env
MAIL_PROVIDER="smtp"
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: hr@costaatt.edu.tt
- **Technical Lead**: dheadley@costaatt.edu.tt

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with HRIS systems
- [ ] Multi-language support
- [ ] Advanced workflow automation

---

**COSTAATT HR Performance Gateway** - Empowering excellence through performance management.