# Rakostat - COSTAATT Room Booking System

A modern, single sign-on (SSO)-enabled web application to manage room bookings across five COSTAATT campuses with role-based access control.

## 🚀 Features

- **Microsoft 365 SSO Authentication** - Secure login with institutional credentials
- **Role-based Access Control** - Admin, Registry, Facilities, Campus Deans, and Staff roles
- **Multi-campus Support** - Manage rooms across 5 COSTAATT campuses
- **Room Management** - Create, edit, and manage rooms with technology metadata
- **Booking System** - Book rooms with conflict prevention and availability checking
- **Calendar View** - Visual calendar interface for booking management
- **Admin Dashboard** - Comprehensive analytics and system management
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## 🏗️ Tech Stack

### Backend
- **NestJS** - Node.js framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Microsoft 365 SSO** - Authentication
- **JWT** - Token-based authentication

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **MSAL.js** - Microsoft authentication
- **React Query** - Data fetching
- **React Router** - Navigation

## 🏢 Supported Campuses

1. City Campus – Port-of-Spain
2. North Learning Center – Port-of-Spain
3. Chaguanas Campus
4. San Fernando Campus
5. Tobago Campus

## 👤 User Roles

### Admin
- Create/edit/delete rooms and technologies
- Manage user permissions and roles
- View system analytics and reports
- Access to all campuses

### Registry Department
- View availability for all rooms
- Book rooms for classes and events

### Facilities Department
- View all rooms
- Book rooms for external events
- Mark rooms under maintenance

### Campus Deans
- View rooms for assigned campus
- Book rooms and view utilization

### General Staff
- View room availability
- Book rooms (if granted access)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Environment Setup

1. Copy the environment file:
```bash
cp env.example .env
```

2. Update the `.env` file with your configuration:
```env
# Database
DATABASE_URL="postgresql://rakostat:rakostat123@localhost:5433/rakostat"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Microsoft Azure AD
AZURE_CLIENT_ID="your-azure-client-id"
AZURE_CLIENT_SECRET="your-azure-client-secret"
AZURE_TENANT_ID="your-azure-tenant-id"
AZURE_REDIRECT_URI="http://localhost:3000/auth/callback"

# API Configuration
API_PORT=3001
NODE_ENV=development

# Frontend Configuration
VITE_API_URL="http://localhost:3001"
VITE_AZURE_CLIENT_ID="your-azure-client-id"
VITE_AZURE_TENANT_ID="your-azure-tenant-id"
```

### Development Setup

#### Option 1: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Option 2: Local Development
```bash
# Install dependencies
npm install

# Start PostgreSQL (if not using Docker)
# Create database: rakostat

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development servers
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## 📊 Database Schema

The application uses the following main entities:

- **Users** - System users with roles and campus assignments
- **Rooms** - Room information with capacity and campus
- **Technologies** - Available room technologies (projector, smart board, etc.)
- **Bookings** - Room reservations with time slots and status
- **Maintenance** - Room maintenance schedules

## 🔐 Authentication Setup

1. **Azure AD App Registration**:
   - Create an Azure AD application
   - Configure redirect URIs
   - Set up API permissions
   - Generate client secret

2. **Configure MSAL**:
   - Update environment variables
   - Configure tenant and client ID
   - Set up redirect URIs

## 📱 API Endpoints

### Authentication
- `POST /auth/profile` - Get user profile
- `POST /auth/refresh` - Refresh token
- `GET /auth/azure/callback` - Azure AD callback

### Rooms
- `GET /rooms` - List rooms with filters
- `GET /rooms/available` - Get available rooms
- `POST /rooms` - Create room (Admin)
- `PATCH /rooms/:id` - Update room (Admin)

### Bookings
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Admin
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/campus-stats` - Campus statistics
- `GET /admin/room-utilization` - Room utilization data

## 🎨 UI Components

The application features a modern, responsive design with:

- **Clean Dashboard** - Overview of system statistics
- **Room Browser** - Search and filter rooms
- **Booking Interface** - Easy room booking process
- **Calendar View** - Visual booking calendar
- **Admin Panel** - System management interface

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Ensure all production environment variables are set:
- Database connection string
- JWT secret
- Azure AD configuration
- API URLs

## 📈 Monitoring

The application includes:
- API documentation with Swagger
- Database query optimization
- Error handling and logging
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for COSTAATT.

## 🆘 Support

For technical support or questions:
- Check the API documentation at `/api/docs`
- Review the database schema
- Contact the development team

---

**Rakostat** - Streamlining room bookings at COSTAATT 🏢✨
