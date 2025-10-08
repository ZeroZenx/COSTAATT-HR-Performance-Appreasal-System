# Manual Setup Guide - Step by Step

Follow these exact steps to get the COSTAATT HR Performance Gateway running:

## Step 1: Navigate to Project Directory
```bash
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR"
```

## Step 2: Install Dependencies (One by One)

### 2.1 Install shared package dependencies
```bash
cd packages/shared
npm install
npm run build
cd ../..
```

### 2.2 Install API dependencies
```bash
cd apps/api
npm install
cd ../..
```

### 2.3 Install Web dependencies
```bash
cd apps/web
npm install
cd ../..
```

## Step 3: Start Docker Services
```bash
docker-compose up -d
```

## Step 4: Wait for Services (30 seconds)
```bash
sleep 30
```

## Step 5: Setup Database
```bash
cd apps/api
npm run db:migrate
npm run db:seed
cd ../..
```

## Step 6: Start Development Servers

Open **Terminal 1** and run:
```bash
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR/apps/api"
npm run dev
```

Open **Terminal 2** and run:
```bash
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR/apps/web"
npm run dev
```

## Step 7: Access the Application

- **Web App**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## Login Credentials
- **Admin**: admin@costaatt.edu.tt / P@ssw0rd!
- **Supervisor**: john.doe@costaatt.edu.tt / password123
- **Employee**: mike.johnson@costaatt.edu.tt / password123

## Troubleshooting

### If you get "port already in use" errors:
```bash
# Kill processes on common ports
lsof -ti:3000,5173,5432,9000,9001,9002,8025 | xargs kill -9
```

### If Docker services fail:
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

### If you get module not found errors:
```bash
# Rebuild shared package
cd packages/shared
npm run build
cd ../..
```

## Quick Commands Reference

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```
