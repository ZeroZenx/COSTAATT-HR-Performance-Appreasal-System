# 🚀 Rakostat Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional but recommended)

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
# - Database connection
# - Azure AD credentials
# - JWT secret
```

### 3. Database Setup
```bash
# Option A: Using Docker (Recommended)
docker-compose up -d postgres

# Option B: Local PostgreSQL
# Create database: rakostat
# Update DATABASE_URL in .env
```

### 4. Install & Setup
```bash
# Install dependencies
npm install

# Setup database
cd apps/api
npx prisma generate
npx prisma db push
npx prisma db seed
cd ../..

# Start development servers
npm run dev
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🔧 Azure AD Configuration

### 1. Create Azure AD App Registration
1. Go to Azure Portal > Azure Active Directory > App registrations
2. Click "New registration"
3. Name: "Rakostat"
4. Supported account types: "Accounts in this organizational directory only"
5. Redirect URI: `http://localhost:3000`

### 2. Configure Authentication
1. Go to Authentication
2. Add platform: Single-page application
3. Redirect URIs: `http://localhost:3000`
4. Logout URL: `http://localhost:3000`

### 3. API Permissions
1. Go to API permissions
2. Add Microsoft Graph permissions:
   - `openid`
   - `profile`
   - `email`
3. Grant admin consent

### 4. Generate Client Secret
1. Go to Certificates & secrets
2. Click "New client secret"
3. Copy the secret value
4. Update `.env` file

## 📊 Database Schema

### Key Entities
- **Users** - System users with roles
- **Rooms** - Room information with capacity
- **Technologies** - Available room technologies
- **Bookings** - Room reservations
- **Maintenance** - Room maintenance schedules

### User Roles
- `ADMIN` - Full system access
- `REGISTRY` - Book rooms for classes
- `FACILITIES` - Book rooms for events
- `CAMPUS_DEAN` - Campus-specific access
- `STAFF` - Basic booking access

## 🏢 Campus Support

1. **City Campus** - Port-of-Spain
2. **North Learning Center** - Port-of-Spain
3. **Chaguanas Campus**
4. **San Fernando Campus**
5. **Tobago Campus**

## 🎨 Features Implemented

### ✅ Authentication
- Microsoft 365 SSO integration
- JWT token-based authentication
- Role-based access control

### ✅ Room Management
- Create/edit/delete rooms
- Technology assignment
- Campus-based organization
- Capacity management

### ✅ Booking System
- Conflict prevention
- Availability checking
- Status management (Pending/Confirmed/Cancelled)
- Time slot validation

### ✅ User Interface
- Responsive design
- Dashboard with statistics
- Room browser with filters
- Calendar view
- Admin panel

### ✅ Admin Features
- User management
- Room utilization analytics
- Campus statistics
- Booking trends
- System overview

## 🔐 Security Features

- Microsoft 365 SSO authentication
- JWT token validation
- Role-based permissions
- Input validation
- SQL injection protection
- CORS configuration

## 📱 API Endpoints

### Authentication
- `GET /auth/profile` - User profile
- `POST /auth/refresh` - Refresh token
- `GET /auth/azure/callback` - Azure callback

### Rooms
- `GET /rooms` - List rooms
- `GET /rooms/available` - Available rooms
- `POST /rooms` - Create room (Admin)
- `PATCH /rooms/:id` - Update room (Admin)

### Bookings
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

### Admin
- `GET /admin/dashboard` - Dashboard stats
- `GET /admin/campus-stats` - Campus statistics
- `GET /admin/room-utilization` - Room utilization

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
Ensure all production variables are set:
- `DATABASE_URL`
- `JWT_SECRET`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_TENANT_ID`

## 🛠️ Development

### Project Structure
```
apps/
├── api/                 # NestJS backend
│   ├── src/
│   │   ├── auth/       # Authentication
│   │   ├── users/      # User management
│   │   ├── rooms/      # Room management
│   │   ├── bookings/   # Booking system
│   │   └── admin/      # Admin features
│   └── prisma/         # Database schema
└── web/                # React frontend
    ├── src/
    │   ├── components/ # UI components
    │   ├── pages/      # Page components
    │   ├── hooks/      # Custom hooks
    │   └── services/   # API services
```

### Key Technologies
- **Backend**: NestJS, Prisma, PostgreSQL, JWT
- **Frontend**: React, TypeScript, Tailwind CSS, MSAL
- **Authentication**: Microsoft 365 SSO
- **Database**: PostgreSQL with Prisma ORM

## 📈 Monitoring

- API documentation with Swagger
- Database query optimization
- Error handling and logging
- Performance monitoring

## 🆘 Troubleshooting

### Common Issues
1. **Database connection**: Check DATABASE_URL
2. **Azure AD**: Verify client ID and secret
3. **CORS**: Check frontend URL configuration
4. **JWT**: Verify JWT_SECRET is set

### Logs
```bash
# View API logs
docker-compose logs -f api

# View database logs
docker-compose logs -f postgres
```

## 🎉 Success!

Your Rakostat application is now ready! The system provides:

- ✅ Complete room booking functionality
- ✅ Microsoft 365 SSO integration
- ✅ Role-based access control
- ✅ Multi-campus support
- ✅ Modern, responsive UI
- ✅ Admin dashboard
- ✅ Calendar view
- ✅ Conflict prevention
- ✅ Database seeding

**Happy booking! 🏢✨**
