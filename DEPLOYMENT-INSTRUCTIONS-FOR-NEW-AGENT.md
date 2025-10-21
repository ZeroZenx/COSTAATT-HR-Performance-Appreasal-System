# 🚀 DEPLOYMENT INSTRUCTIONS FOR NEW AI AGENT

## ⚠️ CRITICAL - READ THIS FIRST

This Windows Server is **ALREADY RUNNING A PRODUCTION HR PERFORMANCE APPRAISAL SYSTEM**. You must deploy the new CMMS application WITHOUT disrupting the existing HR system.

---

## 📋 EXISTING HR SYSTEM (DO NOT MODIFY)

### **HR System Configuration:**
- **Location:** `C:\HR\HR\`
- **Backend Port:** `3000`
- **Frontend Port:** `5173`
- **Database:** `costaatt_hr` (MySQL)
- **MySQL Port:** `3306`
- **URLs:** 
  - `http://10.2.1.27:5173`
  - `http://hrpmg.costaatt.edu.tt:5173`
- **PM2 Processes:** `hr-backend`, `hr-frontend`

### **🚫 ABSOLUTE RESTRICTIONS:**
1. **DO NOT** use ports `3000`, `5173`, or `3306`
2. **DO NOT** modify, access, or query the `costaatt_hr` database
3. **DO NOT** deploy inside the `C:\HR\HR\` directory
4. **DO NOT** stop, restart, or modify HR PM2 processes
5. **DO NOT** change any HR app configuration files
6. **DO NOT** use Docker for MySQL (use existing MySQL server)

---

## 🎯 YOUR DEPLOYMENT REQUIREMENTS

### **CMMS System Configuration:**
- **Location:** `C:\COSTAATT-CMMS\`
- **Backend Port:** `4000` (NOT 3000!)
- **Frontend Port:** `5174` (NOT 5173!)
- **Database:** `costaatt_cmms` (NOT costaatt_hr!)
- **MySQL Server:** Use existing MySQL on port `3306` (shared with HR)
- **Repository:** `https://github.com/ZeroZenx/COSTAATT-Advanced-CMMS`

### **✅ DEPLOYMENT RULES:**
1. ✅ Use **different ports** (Backend: 4000, Frontend: 5174)
2. ✅ Create **separate database** (`costaatt_cmms`)
3. ✅ Deploy in **separate directory** (`C:\COSTAATT-CMMS\`)
4. ✅ Use **existing MySQL server** (NOT Docker)
5. ✅ Create **separate .env files**
6. ✅ Use **PM2** for process management
7. ✅ **Verify HR system still works** after deployment

---

## 📖 STEP-BY-STEP DEPLOYMENT GUIDE

### **STEP 1: Clone CMMS Repository**

```powershell
# Navigate to root
cd C:\

# Clone CMMS repository
git clone https://github.com/ZeroZenx/COSTAATT-Advanced-CMMS COSTAATT-CMMS

# Navigate to CMMS directory
cd COSTAATT-CMMS
```

---

### **STEP 2: Create Separate CMMS Database**

**CRITICAL:** Use the existing MySQL server (port 3306) but create a NEW database.

```powershell
# Connect to MySQL
mysql -u root -p
# Enter MySQL root password when prompted
```

```sql
-- Create CMMS database (separate from costaatt_hr)
CREATE DATABASE costaatt_cmms;

-- Create dedicated CMMS user (recommended for security)
CREATE USER 'cmms_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON costaatt_cmms.* TO 'cmms_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify databases are separate
SHOW DATABASES;
-- Should see: costaatt_hr (existing) and costaatt_cmms (new)

-- Exit MySQL
exit;
```

**⚠️ IMPORTANT:** Both HR and CMMS share the same MySQL server (port 3306) but use **completely separate databases**.

---

### **STEP 3: Disable Docker MySQL (Critical)**

The CMMS repository may include Docker Compose for MySQL. **DO NOT USE IT**.

```powershell
# Option A: Rename docker-compose.yml to prevent accidental use
if (Test-Path docker-compose.yml) {
    Rename-Item docker-compose.yml docker-compose.yml.backup
    Write-Host "✅ Docker Compose disabled"
}

# Option B: If you want to keep PhpMyAdmin (optional), edit docker-compose.yml
# Comment out the MySQL service but keep PhpMyAdmin pointing to host MySQL
```

**If docker-compose.yml exists, modify it:**
```yaml
version: '3.8'
services:
  # COMMENT OUT OR REMOVE MySQL service - we're using existing MySQL
  # mysql:
  #   image: mysql:8.0
  #   ...

  # OPTIONAL: Keep PhpMyAdmin if you want a web interface
  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8082:80"  # Use port 8082 to avoid conflicts
    environment:
      PMA_HOST: host.docker.internal  # Connect to host MySQL
      PMA_PORT: 3306
      PMA_USER: root
```

---

### **STEP 4: Configure Backend Environment**

Create `.env` file in `apps/api/` or backend root:

```powershell
# Navigate to backend directory
cd apps/api
# OR
cd backend
# (Check which directory structure the CMMS uses)
```

Create `.env` file:
```env
# Database Configuration - USE EXISTING MySQL Server
DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/costaatt_cmms"

# OR use dedicated CMMS user (recommended):
# DATABASE_URL="mysql://cmms_user:SecurePassword123!@localhost:3306/costaatt_cmms"

# Backend Port - MUST BE DIFFERENT FROM HR (3000)
PORT=4000
NODE_ENV=production

# JWT Secret (generate a secure random string)
JWT_SECRET=cmms_secure_random_string_here

# API URL for frontend communication
API_URL=http://10.2.1.27:4000

# Other configurations based on CMMS requirements
# (Check CMMS documentation for additional environment variables)
```

**⚠️ REPLACE:**
- `YOUR_MYSQL_PASSWORD` with actual MySQL root password
- `JWT_SECRET` with a secure random string

---

### **STEP 5: Configure Frontend Environment**

Create `.env` file in `apps/web/` or frontend root:

```powershell
# Navigate to frontend directory
cd ../web
# OR
cd ../frontend
```

Create `.env` file:
```env
# Backend API URL - Use CMMS backend port (4000)
VITE_API_URL=http://10.2.1.27:4000

# Frontend Port - MUST BE DIFFERENT FROM HR (5173)
VITE_PORT=5174
PORT=5174

# Other frontend configurations
VITE_APP_NAME=COSTAATT CMMS
```

---

### **STEP 6: Install Dependencies**

```powershell
# Navigate to CMMS root
cd C:\COSTAATT-CMMS

# Install backend dependencies
cd apps/api  # OR cd backend
npm install

# Install frontend dependencies
cd ../web  # OR cd ../frontend
npm install

# Install root dependencies if needed
cd ../..
npm install

# Verify installations
Write-Host "✅ Dependencies installed"
```

---

### **STEP 7: Run Database Migrations**

```powershell
# Navigate to backend directory
cd apps/api  # OR cd backend

# Generate Prisma Client (if using Prisma)
npx prisma generate

# Run migrations to create CMMS tables
npx prisma migrate deploy

# OR if migrations don't exist, use db push
npx prisma db push

# Seed database with initial data (if seed script exists)
npm run seed
# OR
npx prisma db seed

# Verify tables were created
mysql -u root -p -e "USE costaatt_cmms; SHOW TABLES;"

cd ../..
```

---

### **STEP 8: Configure Windows Firewall**

```powershell
# Add firewall rules for CMMS ports
# (MySQL port 3306 already open for HR system)

# CMMS Backend Port
New-NetFirewallRule -DisplayName "CMMS Backend Port 4000" `
  -Direction Inbound `
  -LocalPort 4000 `
  -Protocol TCP `
  -Action Allow

# CMMS Frontend Port
New-NetFirewallRule -DisplayName "CMMS Frontend Port 5174" `
  -Direction Inbound `
  -LocalPort 5174 `
  -Protocol TCP `
  -Action Allow

# Verify firewall rules
Get-NetFirewallRule -DisplayName "*CMMS*"

Write-Host "✅ Firewall rules added"
```

---

### **STEP 9: Test Manual Startup (Optional but Recommended)**

Before using PM2, test that both frontend and backend start correctly:

```powershell
# Terminal 1: Start CMMS Backend
cd C:\COSTAATT-CMMS\apps\api  # OR backend
npm run dev
# OR
npm start

# Wait for backend to start, then in Terminal 2: Start CMMS Frontend
cd C:\COSTAATT-CMMS\apps\web  # OR frontend
npm run dev

# Access CMMS: http://10.2.1.27:5174
# Verify CMMS loads and connects to backend

# Stop both with Ctrl+C when verified
```

---

### **STEP 10: Deploy with PM2 (Production)**

**Install PM2 if not already installed:**
```powershell
npm install -g pm2
```

**Start CMMS with PM2:**
```powershell
# Navigate to CMMS root
cd C:\COSTAATT-CMMS

# Start CMMS Backend
# Adjust the path based on actual server file location
pm2 start apps/api/src/server.js --name "cmms-backend"
# OR if using npm script:
pm2 start "npm run start" --name "cmms-backend" --cwd "C:\COSTAATT-CMMS\apps\api"

# Start CMMS Frontend
pm2 start "npm run dev" --name "cmms-frontend" --cwd "C:\COSTAATT-CMMS\apps\web"
# OR for production build:
# npm run build (in frontend directory first)
# pm2 start "npm run preview" --name "cmms-frontend" --cwd "C:\COSTAATT-CMMS\apps\web"

# Save PM2 configuration
pm2 save

# Setup PM2 auto-startup (if not already configured)
pm2 startup
# Follow the instructions provided by PM2

# View all running apps
pm2 list
# Should show: hr-backend, hr-frontend, cmms-backend, cmms-frontend

Write-Host "✅ CMMS deployed with PM2"
```

---

### **STEP 11: Verify Deployment**

#### **A. Check PM2 Status:**
```powershell
pm2 list
```
**Expected output:**
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ restart │ uptime   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ hr-backend       │ online  │ 0       │ 5d       │
│ 1   │ hr-frontend      │ online  │ 0       │ 5d       │
│ 2   │ cmms-backend     │ online  │ 0       │ 1m       │
│ 3   │ cmms-frontend    │ online  │ 0       │ 1m       │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

#### **B. Check Database Isolation:**
```powershell
mysql -u root -p
```
```sql
-- Show all databases
SHOW DATABASES;
-- Should see both: costaatt_hr and costaatt_cmms

-- Check HR database (should be unchanged)
USE costaatt_hr;
SHOW TABLES;
SELECT COUNT(*) FROM users;  -- Should show existing HR users

-- Check CMMS database (should have new tables)
USE costaatt_cmms;
SHOW TABLES;
-- Should show CMMS tables (work_orders, assets, etc.)

exit;
```

#### **C. Check System Accessibility:**

**HR System (MUST STILL WORK):**
- [ ] Frontend: `http://10.2.1.27:5173` ✅
- [ ] Frontend DNS: `http://hrpmg.costaatt.edu.tt:5173` ✅
- [ ] Backend API: `http://10.2.1.27:3000` ✅
- [ ] Login and core features work ✅

**CMMS System (NEW):**
- [ ] Frontend: `http://10.2.1.27:5174` ✅
- [ ] Backend API: `http://10.2.1.27:4000` ✅
- [ ] CMMS loads without errors ✅
- [ ] Can create/view data ✅

#### **D. Check Logs:**
```powershell
# View CMMS logs
pm2 logs cmms-backend --lines 50
pm2 logs cmms-frontend --lines 50

# Check for errors
pm2 logs --err
```

#### **E. Monitor Resources:**
```powershell
# Monitor CPU/Memory usage
pm2 monit

# Check system resources
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Format-Table ProcessName, CPU, WS
```

---

## 🗺️ FINAL SYSTEM ARCHITECTURE

```
Windows Server: 10.2.1.27

┌─────────────────────────────────────────────────────────────┐
│                   MySQL Server (Port 3306)                   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │  costaatt_hr         │  │  costaatt_cmms               │ │
│  │  - users             │  │  - work_orders               │ │
│  │  - employees         │  │  - assets                    │ │
│  │  - appraisals        │  │  - maintenance_schedules     │ │
│  │  - competencies      │  │  - technicians               │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────┐          ┌────────────────────────┐
│   HR SYSTEM            │          │   CMMS SYSTEM          │
│   (PRODUCTION)         │          │   (NEW)                │
├────────────────────────┤          ├────────────────────────┤
│ Location:              │          │ Location:              │
│   C:\HR\HR\            │          │   C:\COSTAATT-CMMS\    │
│                        │          │                        │
│ Frontend:              │          │ Frontend:              │
│   Port: 5173           │          │   Port: 5174           │
│   URL: 10.2.1.27:5173  │          │   URL: 10.2.1.27:5174  │
│   DNS: hrpmg.costa...  │          │   (Add DNS if needed)  │
│                        │          │                        │
│ Backend:               │          │ Backend:               │
│   Port: 3000           │          │   Port: 4000           │
│   URL: 10.2.1.27:3000  │          │   URL: 10.2.1.27:4000  │
│                        │          │                        │
│ Database:              │          │ Database:              │
│   costaatt_hr          │          │   costaatt_cmms        │
│                        │          │                        │
│ PM2 Processes:         │          │ PM2 Processes:         │
│   - hr-backend         │          │   - cmms-backend       │
│   - hr-frontend        │          │   - cmms-frontend      │
└────────────────────────┘          └────────────────────────┘
```

---

## 🔧 TROUBLESHOOTING

### **Issue 1: Port Already in Use**
```
Error: Port 4000 is already in use
```

**Solution:**
```powershell
# Find what's using the port
netstat -ano | findstr :4000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use a different port in .env files
```

### **Issue 2: Cannot Connect to MySQL**
```
Error: Can't connect to MySQL server
```

**Solution:**
```powershell
# Check MySQL is running
Get-Service MySQL*

# Start MySQL if stopped
Start-Service MySQL80  # Or your MySQL service name

# Verify connection
mysql -u root -p -e "SHOW DATABASES;"
```

### **Issue 3: Prisma Migration Fails**
```
Error: Migration failed
```

**Solution:**
```powershell
# Reset migrations (use with caution)
npx prisma migrate reset

# Or push schema directly
npx prisma db push --accept-data-loss

# Regenerate client
npx prisma generate
```

### **Issue 4: CMMS Can't Reach Backend**
```
Error: Failed to fetch / Network Error
```

**Solution:**
1. Verify backend is running: `pm2 list`
2. Check backend logs: `pm2 logs cmms-backend`
3. Verify `.env` has correct `VITE_API_URL`: `http://10.2.1.27:4000`
4. Check firewall: `Get-NetFirewallRule -DisplayName "*CMMS*"`
5. Test backend directly: `curl http://10.2.1.27:4000`

### **Issue 5: HR System Stopped Working**
```
⚠️ CRITICAL: HR system is not accessible
```

**Immediate Action:**
```powershell
# Check HR processes
pm2 list | findstr "hr-"

# Restart HR if needed
pm2 restart hr-backend
pm2 restart hr-frontend

# Check HR logs
pm2 logs hr-backend --lines 100

# Verify HR database
mysql -u root -p -e "USE costaatt_hr; SELECT COUNT(*) FROM users;"

# If issue persists, stop CMMS temporarily
pm2 stop cmms-backend
pm2 stop cmms-frontend

# Contact system administrator immediately
```

### **Issue 6: Database Permission Denied**
```
Error: Access denied for user 'cmms_user'
```

**Solution:**
```sql
-- Reconnect to MySQL as root
mysql -u root -p

-- Grant permissions again
GRANT ALL PRIVILEGES ON costaatt_cmms.* TO 'cmms_user'@'localhost';
FLUSH PRIVILEGES;

-- Test connection
mysql -u cmms_user -p costaatt_cmms -e "SHOW TABLES;"
```

---

## 📊 POST-DEPLOYMENT CHECKLIST

### **✅ Verification Checklist:**

- [ ] CMMS cloned to `C:\COSTAATT-CMMS\`
- [ ] Separate database `costaatt_cmms` created
- [ ] Docker MySQL disabled (docker-compose.yml renamed/modified)
- [ ] Backend `.env` configured with port 4000 and correct DATABASE_URL
- [ ] Frontend `.env` configured with port 5174
- [ ] Dependencies installed (npm install in both frontend/backend)
- [ ] Prisma migrations run successfully
- [ ] Firewall rules added for ports 4000 and 5174
- [ ] PM2 processes started: `cmms-backend` and `cmms-frontend`
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] CMMS accessible at `http://10.2.1.27:5174`
- [ ] CMMS backend responding at `http://10.2.1.27:4000`
- [ ] **HR system still accessible at `http://10.2.1.27:5173`** ⚠️ CRITICAL
- [ ] **HR backend still responding at `http://10.2.1.27:3000`** ⚠️ CRITICAL
- [ ] Both databases visible in MySQL (`SHOW DATABASES;`)
- [ ] No port conflicts
- [ ] No errors in PM2 logs
- [ ] Both systems can be accessed simultaneously
- [ ] System resources (CPU/RAM) within acceptable limits

### **✅ Security Checklist:**

- [ ] Strong passwords used for MySQL users
- [ ] JWT_SECRET is unique and secure
- [ ] Database users have minimal required permissions
- [ ] `.env` files not committed to git
- [ ] Firewall rules properly configured
- [ ] Both applications use separate databases (no shared tables)

---

## 📱 DNS CONFIGURATION (Optional)

If you want a friendly URL for CMMS (like `cmms.costaatt.edu.tt`):

### **Option 1: Add DNS Record**
Contact network administrator to add DNS A record:
```
cmms.costaatt.edu.tt → 10.2.1.27
```

Then users can access:
- CMMS: `http://cmms.costaatt.edu.tt:5174`
- HR: `http://hrpmg.costaatt.edu.tt:5173`

### **Option 2: Nginx Reverse Proxy (Remove Port Numbers)**
Install Nginx and configure clean URLs:
```nginx
# cmms.costaatt.edu.tt → Port 5174
server {
    listen 80;
    server_name cmms.costaatt.edu.tt;
    
    location / {
        proxy_pass http://localhost:5174;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then users can access:
- CMMS: `http://cmms.costaatt.edu.tt` (no port!)
- HR: `http://hrpmg.costaatt.edu.tt` (no port!)

---

## 🎯 SUCCESS CRITERIA

**Deployment is successful when:**

1. ✅ CMMS frontend loads at `http://10.2.1.27:5174`
2. ✅ CMMS backend responds at `http://10.2.1.27:4000`
3. ✅ CMMS can create/read/update/delete data
4. ✅ **HR system STILL works perfectly** at `http://10.2.1.27:5173`
5. ✅ Both systems run simultaneously without conflicts
6. ✅ Both databases (`costaatt_hr` and `costaatt_cmms`) are separate and functional
7. ✅ All 4 PM2 processes are online and stable
8. ✅ No errors in logs (`pm2 logs`)
9. ✅ System resources are acceptable
10. ✅ Both systems survive server restart (PM2 auto-startup works)

---

## 🆘 EMERGENCY CONTACTS

**If HR system stops working or you encounter critical issues:**

1. **Immediately stop CMMS:**
   ```powershell
   pm2 stop cmms-backend
   pm2 stop cmms-frontend
   ```

2. **Verify HR system recovers:**
   - Test: `http://10.2.1.27:5173`

3. **Document the issue:**
   - PM2 logs: `pm2 logs --lines 200 > C:\deployment-error.log`
   - System info: `pm2 list`, `netstat -ano`, `Get-Service MySQL*`

4. **Contact system administrator**
   - Provide error logs
   - Explain what was being done when the issue occurred

---

## 📚 ADDITIONAL RESOURCES

- **HR System Repository:** `https://github.com/ZeroZenx/COSTAATT-HR-Performance-Appreasal-System`
- **CMMS Repository:** `https://github.com/ZeroZenx/COSTAATT-Advanced-CMMS`
- **PM2 Documentation:** `https://pm2.keymetrics.io/docs/usage/quick-start/`
- **Prisma Documentation:** `https://www.prisma.io/docs/`
- **MySQL Documentation:** `https://dev.mysql.com/doc/`

---

## 🎓 KEY TAKEAWAYS

1. **Port Isolation:** Different apps = different ports
2. **Database Isolation:** Different apps = different databases (but same MySQL server)
3. **Directory Isolation:** Different apps = different folders
4. **No Docker MySQL:** Use existing MySQL server with separate databases
5. **PM2 Management:** All apps managed centrally with PM2
6. **Always Verify:** After deployment, confirm HR system still works

---

## ✅ FINAL COMMAND SUMMARY

```powershell
# 1. Clone CMMS
cd C:\
git clone https://github.com/ZeroZenx/COSTAATT-Advanced-CMMS COSTAATT-CMMS

# 2. Create database
mysql -u root -p
CREATE DATABASE costaatt_cmms;
CREATE USER 'cmms_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON costaatt_cmms.* TO 'cmms_user'@'localhost';
FLUSH PRIVILEGES;
exit;

# 3. Configure (create .env files in backend and frontend)

# 4. Install dependencies
cd C:\COSTAATT-CMMS\apps\api
npm install
cd ../web
npm install

# 5. Run migrations
cd C:\COSTAATT-CMMS\apps\api
npx prisma generate
npx prisma migrate deploy

# 6. Add firewall rules
New-NetFirewallRule -DisplayName "CMMS Backend" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "CMMS Frontend" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow

# 7. Deploy with PM2
cd C:\COSTAATT-CMMS
pm2 start apps/api/src/server.js --name "cmms-backend"
pm2 start "npm run dev" --name "cmms-frontend" --cwd "C:\COSTAATT-CMMS\apps\web"
pm2 save

# 8. Verify
pm2 list
# Test: http://10.2.1.27:5174 (CMMS)
# Test: http://10.2.1.27:5173 (HR) ← MUST STILL WORK!
```

---

## 🎉 DEPLOYMENT COMPLETE!

Once all verification checks pass, your server will be running both:
- **HR Performance Appraisal System** (Production) ✅
- **CMMS (Computerized Maintenance Management System)** (New) ✅

Both systems will operate independently, sharing only the MySQL server infrastructure while maintaining complete data isolation.

**Good luck with your deployment!** 🚀

