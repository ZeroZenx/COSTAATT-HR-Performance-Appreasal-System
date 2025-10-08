# Quick Start Guide - Simplified

Let's get this working step by step:

## Step 1: Install Dependencies Manually

```bash
# Navigate to project
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR"

# Install shared package dependencies
cd packages/shared
npm install
npm run build
cd ../..

# Install API dependencies
cd apps/api
npm install
cd ../..

# Install Web dependencies  
cd apps/web
npm install
cd ../..
```

## Step 2: Start Only Essential Services

```bash
# Start only PostgreSQL and MinIO
docker-compose up -d db minio mailhog chrome
```

## Step 3: Wait and Check Services

```bash
# Wait 30 seconds
sleep 30

# Check if services are running
docker-compose ps
```

## Step 4: Setup Database

```bash
cd apps/api
npx prisma migrate dev
npx ts-node prisma/seed.ts
cd ../..
```

## Step 5: Start Development Servers

**Terminal 1 (API):**
```bash
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR/apps/api"
npm run dev
```

**Terminal 2 (Web):**
```bash
cd "/Users/darrenheadley/.cursor/COSTAATT Project/HR/apps/web"
npm run dev
```

## Step 6: Access Application

- **Web App**: http://localhost:5173
- **API**: http://localhost:3000

## Login Credentials
- **Admin**: admin@costaatt.edu.tt / P@ssw0rd!
- **Supervisor**: john.doe@costaatt.edu.tt / password123
- **Employee**: mike.johnson@costaatt.edu.tt / password123

## If You Get Errors

### TypeScript not found:
```bash
cd packages/shared
npm install typescript --save-dev
npm run build
cd ../..
```

### Prisma not found:
```bash
cd apps/api
npm install prisma @prisma/client --save-dev
npx prisma generate
cd ../..
```

### ts-node not found:
```bash
cd apps/api
npm install ts-node --save-dev
cd ../..
```
