# Manual Setup Guide

If the automated setup script doesn't work, follow these manual steps:

## Step 1: Navigate to Project Directory
```bash
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR"
```

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Build Shared Package
```bash
npm run build --workspace=@costaatt/shared
```

## Step 4: Start Docker Services
```bash
docker-compose up -d
```

## Step 5: Wait for Services (30 seconds)
```bash
sleep 30
```

## Step 6: Run Database Migrations
```bash
npm run db:migrate --workspace=@costaatt/api
```

## Step 7: Seed Database
```bash
npm run db:seed --workspace=@costaatt/api
```

## Step 8: Start Development Servers
```bash
# Terminal 1 - Start API
cd apps/api
npm run dev

# Terminal 2 - Start Web App
cd apps/web
npm run dev
```

## Access the Application
- **Web App**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## Demo Credentials
- **Admin**: admin@costaatt.edu.tt / P@ssw0rd!
- **Supervisor**: john.doe@costaatt.edu.tt / password123
- **Employee**: mike.johnson@costaatt.edu.tt / password123

## Troubleshooting

### If Docker services fail to start:
```bash
docker-compose down
docker-compose up -d
```

### If database connection fails:
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db
```

### If ports are already in use:
```bash
# Kill processes on ports 3000, 5173, 5432, 9000, 9001, 9002, 8025
lsof -ti:3000,5173,5432,9000,9001,9002,8025 | xargs kill -9
```
