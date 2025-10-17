# COSTAATT HR Performance Management System Setup Guide

## 🎯 **SYSTEM OVERVIEW**
This is a complete web-based HR Performance Management System built with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT-based with local accounts

## 🚀 **SETUP INSTRUCTIONS**

### 1. **Prerequisites**
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 2. **Environment Configuration**
Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/costaatt_hr
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
NODE_ENV=development
```

### 3. **Database Setup**
1. Create a PostgreSQL database named `costaatt_hr`
2. Update the `DATABASE_URL` in your `.env` file with your database credentials

### 4. **Install Dependencies**
```bash
npm install
```

### 5. **Database Migration and Seeding**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with demo data
npm run db:seed
```

### 6. **Start the Application**
```bash
# Start both API and web servers
npm run dev
```

### 7. **Access the Application**
- **Web App**: http://localhost:5173
- **API**: http://localhost:3000

## 🔐 **DEMO CREDENTIALS**
- **Admin**: admin@costaatt.edu.tt / P@ssw0rd!
- **Supervisor**: john.doe@costaatt.edu.tt / password123
- **Employee**: mike.johnson@costaatt.edu.tt / password123

## 📁 **Project Structure**
```
HR/
├── apps/
│   ├── api/                 # Backend API
│   │   ├── src/
│   │   │   └── simple-server.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── scripts/
│   │   │   └── seed-data.js
│   │   └── package.json
│   └── web/                 # Frontend React App
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── contexts/
│       │   └── App.tsx
│       ├── public/
│       └── package.json
├── packages/
│   └── shared/              # Shared utilities
└── package.json
```

## 🛠️ **Available Scripts**
- `npm run dev` - Start both API and web servers
- `npm run dev:api` - Start only the API server
- `npm run dev:web` - Start only the web server
- `npm run build` - Build the web application
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with demo data

## 🔧 **Troubleshooting**

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database `costaatt_hr` exists

### Port Conflicts
- API runs on port 3000 (configurable via PORT env var)
- Web app runs on port 5173 (configurable in vite.config.ts)

### Authentication Issues
- Ensure JWT_SECRET is set in `.env` file
- Check that demo users are seeded properly

## 📝 **Features Implemented**
- ✅ User authentication with JWT
- ✅ Role-based access control (HR_ADMIN, SUPERVISOR, EMPLOYEE)
- ✅ Employee management
- ✅ Performance appraisal templates
- ✅ Competency tracking
- ✅ Manager review system
- ✅ Modern React frontend with Tailwind CSS
- ✅ Responsive design
- ✅ Demo credentials for testing

## 🎨 **UI Components**
- Login page with demo credential buttons
- Dashboard with user profile and quick actions
- Route guards for authentication
- Responsive design with Tailwind CSS
- Modern gradient backgrounds and styling

## 🔒 **Security Features**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Secure API endpoints
- Input validation

This system provides a complete foundation for HR performance management with all the core features needed to get started!

