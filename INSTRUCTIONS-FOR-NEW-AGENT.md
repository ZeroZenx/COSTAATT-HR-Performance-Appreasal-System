# Instructions for Deploying New Application
## **Context: Existing HR System on This Server**

---

## ⚠️ **CRITICAL INFORMATION - READ FIRST**

This server is **ALREADY RUNNING** a production HR Performance Management System. You must deploy the new application **WITHOUT INTERFERING** with the existing HR app.

---

## 🚫 **PORTS ALREADY IN USE - DO NOT USE THESE:**

### **Occupied Ports (HR System):**
- **Port 3000**: HR Backend API (Node.js/Express)
- **Port 5173**: HR Frontend (Vite/React)
- **Port 3306**: MySQL Database Server

### **Also Avoid:**
- **Port 80**: Reserved for HTTP/Nginx (if configured)
- **Port 443**: Reserved for HTTPS/Nginx (if configured)

---

## ✅ **AVAILABLE PORTS FOR NEW APP:**

### **Recommended Ports:**
- **Backend/API**: `3001`, `3002`, `3003`, `4000`, `5000`, `8000`, `8080`
- **Frontend**: `5174`, `5175`, `5176`, `8081`, `8082`, `3030`
- **Database** (if separate): `3307`, `5432` (PostgreSQL), `27017` (MongoDB)

**IMPORTANT**: Choose ports that are **NOT** 3000, 5173, or 3306!

---

## 🗄️ **DATABASE REQUIREMENTS:**

### **Existing Database:**
- **Name**: `costaatt_hr`
- **Type**: MySQL
- **Port**: 3306
- **Status**: **IN PRODUCTION USE - DO NOT MODIFY**

### **For New Application:**

#### **If using MySQL:**
```sql
-- Create a NEW, SEPARATE database
CREATE DATABASE new_app_name_db;

-- DO NOT use costaatt_hr database
-- DO NOT modify costaatt_hr tables
-- DO NOT share databases between apps
```

#### **If using PostgreSQL or MongoDB:**
- You can install these on different ports
- They won't conflict with the HR system's MySQL

---

## 📁 **DIRECTORY STRUCTURE:**

### **Existing HR App Location:**
```
C:\HR\HR\
├── apps\
│   ├── api\          ← HR Backend (Port 3000)
│   ├── web\          ← HR Frontend (Port 5173)
│   └── ...
├── .env              ← HR Environment Variables
├── package.json
└── ...
```

### **Recommended Location for New App:**
```
C:\Apps\[NewAppName]\
├── backend\          ← New App Backend (Port 3001)
├── frontend\         ← New App Frontend (Port 5174)
├── .env              ← New App Environment Variables
├── package.json
└── ...
```

**OR**

```
C:\[NewAppName]\
├── ...
```

**CRITICAL**: Deploy the new app in a **COMPLETELY SEPARATE DIRECTORY** from `C:\HR\HR\`

---

## 🔧 **CONFIGURATION REQUIREMENTS:**

### **1. Environment Variables (.env)**
Create a **NEW .env file** for the new app. Do NOT modify `C:\HR\HR\.env`.

Example `.env` for new app:
```env
# Server Configuration
PORT=3001                    # DIFFERENT from HR app's 3000
NODE_ENV=production

# Database Configuration
DATABASE_URL=mysql://root:@localhost:3306/new_app_db  # DIFFERENT database name

# API Configuration
API_PORT=3001
FRONTEND_URL=http://10.2.1.27:5174    # DIFFERENT from HR's 5173

# JWT/Security (use DIFFERENT secrets)
JWT_SECRET=new-app-unique-secret-key-here

# CORS (allow both apps)
CORS_ORIGIN=http://10.2.1.27:5174,http://10.2.1.27:5173
```

### **2. Server Configuration**
In your server file (e.g., `server.js`, `index.js`, `app.js`):

```javascript
// Use PORT from environment variable, default to 3001 (NOT 3000!)
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **3. Frontend Configuration**
Update API base URL to use the new port:

```javascript
// config.js or api.js
const API_BASE_URL = process.env.VITE_API_URL || 'http://10.2.1.27:3001';
```

### **4. Vite Configuration (if using Vite)**
```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 5174,  // DIFFERENT from HR's 5173
    host: true
  }
});
```

---

## 🔥 **FIREWALL CONFIGURATION:**

The server already has firewall rules for HR app. You'll need to add rules for the new app:

```powershell
# Add firewall rule for new app backend (e.g., port 3001)
New-NetFirewallRule -DisplayName "NewApp Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow

# Add firewall rule for new app frontend (e.g., port 5174)
New-NetFirewallRule -DisplayName "NewApp Frontend" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow
```

---

## 🚀 **DEPLOYMENT PROCESS:**

### **Step 1: Clone the Repository**
```powershell
# Navigate to a location OUTSIDE the HR app directory
cd C:\

# Clone the new app
git clone [repository-url] [NewAppName]
cd [NewAppName]
```

### **Step 2: Install Dependencies**
```powershell
# Install backend dependencies
cd backend  # or wherever your server code is
npm install

# Install frontend dependencies (if separate)
cd ../frontend
npm install
```

### **Step 3: Configure Environment**
```powershell
# Create .env file with ports that DON'T conflict
# Backend port: NOT 3000 (use 3001, 3002, etc.)
# Frontend port: NOT 5173 (use 5174, 5175, etc.)
# Database: NOT costaatt_hr (create new database)
```

### **Step 4: Setup Database**
```powershell
# Connect to MySQL
mysql -u root -p

# Create new database for this app
CREATE DATABASE new_app_db;
exit;

# Run migrations (if applicable)
npm run migrate
# or
npx prisma migrate deploy
```

### **Step 5: Test Locally First**
```powershell
# Start backend (in backend directory)
npm start
# or
npm run dev

# In a NEW terminal, start frontend (in frontend directory)
npm run dev
```

**VERIFY**:
- New app is accessible on its configured ports
- HR app is STILL accessible on http://10.2.1.27:5173 (port 5173)
- No port conflicts or errors

### **Step 6: Use PM2 for Production** (Recommended)
```powershell
# Install PM2 if not already installed
npm install -g pm2

# Start new app backend with PM2
pm2 start backend/server.js --name "newapp-backend"

# Start new app frontend with PM2
pm2 start npm --name "newapp-frontend" --cwd "C:\Path\To\NewApp\frontend" -- run dev

# Save PM2 configuration
pm2 save

# Verify all apps are running (should see HR apps + new app)
pm2 list
```

---

## ✅ **VERIFICATION CHECKLIST:**

After deployment, verify:

- [ ] **HR App Still Works**:
  - [ ] HR Frontend: `http://10.2.1.27:5173` is accessible
  - [ ] HR Backend: `http://10.2.1.27:3000` responds to API calls
  - [ ] HR Database: `costaatt_hr` database is untouched

- [ ] **New App Works**:
  - [ ] New Frontend: Accessible on configured port (e.g., `http://10.2.1.27:5174`)
  - [ ] New Backend: Responds on configured port (e.g., `http://10.2.1.27:3001`)
  - [ ] New Database: Separate database is created and accessible

- [ ] **No Conflicts**:
  - [ ] No port conflict errors
  - [ ] Both apps run simultaneously
  - [ ] No database connection issues

---

## 📊 **SERVER RESOURCE CHECK:**

Before deploying, verify available resources:

```powershell
# Check available RAM
Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory

# Check disk space
Get-PSDrive C | Select-Object Used,Free

# Check current port usage
netstat -ano | findstr "LISTENING"
```

**Minimum Requirements**:
- **RAM**: 2GB free (for new app)
- **Disk**: 5GB free
- **CPU**: 2 cores recommended

---

## 🌐 **DNS/NETWORK CONFIGURATION:**

### **Current HR App URLs:**
- IP: `http://10.2.1.27:5173`
- DNS: `http://hrpmg.costaatt.edu.tt:5173`

### **For New App:**
You can either:
1. **Use IP + Port**: `http://10.2.1.27:5174`
2. **Request DNS Name**: Ask IT to create a DNS entry (e.g., `newapp.costaatt.edu.tt`)

---

## 🆘 **TROUBLESHOOTING:**

### **Port Already in Use Error:**
```powershell
# Check what's using the port
netstat -ano | findstr :PORT_NUMBER

# If needed, kill the process
taskkill /PID [PID_NUMBER] /F

# Choose a different port for your app
```

### **Cannot Access from Other Computers:**
```powershell
# Add firewall rule for your app's port
New-NetFirewallRule -DisplayName "YourApp" -Direction Inbound -LocalPort YOUR_PORT -Protocol TCP -Action Allow
```

### **Database Connection Error:**
```sql
-- Verify your database exists
SHOW DATABASES;

-- Verify you're not trying to use costaatt_hr
-- Create your own database instead
```

### **HR App Stopped Working:**
```powershell
# Check if HR app is still running
pm2 list

# Restart HR app if needed
pm2 restart hr-backend
pm2 restart hr-frontend

# Check for port conflicts
netstat -ano | findstr "3000 5173"
```

---

## 📝 **DEPLOYMENT SUMMARY:**

### **What You MUST Do:**
✅ Use different ports (NOT 3000, 5173, 3306)
✅ Create separate database (NOT costaatt_hr)
✅ Deploy in separate directory (NOT C:\HR\HR\)
✅ Use separate .env file
✅ Add firewall rules for new ports
✅ Test that HR app still works

### **What You MUST NOT Do:**
🚫 Use port 3000, 5173, or 3306
🚫 Modify or use costaatt_hr database
🚫 Deploy inside C:\HR\HR\ directory
🚫 Modify HR app's .env file
🚫 Stop or modify HR app processes
🚫 Change HR app's configuration

---

## 📞 **IMPORTANT CONTACTS:**

If you encounter issues with the HR system:
- **Stop your deployment immediately**
- **Document the error**
- **Contact the HR system administrator**
- **Do not attempt to "fix" the HR system**

---

## 🎯 **QUICK REFERENCE:**

```
EXISTING HR SYSTEM:
├── Location: C:\HR\HR\
├── Backend Port: 3000
├── Frontend Port: 5173
├── Database: costaatt_hr (MySQL on 3306)
└── Status: PRODUCTION - DO NOT MODIFY

NEW APP (YOUR DEPLOYMENT):
├── Location: C:\[YourAppName]\ (SEPARATE!)
├── Backend Port: 3001+ (YOUR CHOICE, NOT 3000!)
├── Frontend Port: 5174+ (YOUR CHOICE, NOT 5173!)
├── Database: [your_app_db] (CREATE NEW, NOT costaatt_hr!)
└── Status: NEW DEPLOYMENT
```

---

## ✨ **FINAL CHECKLIST BEFORE YOU START:**

- [ ] I understand HR app is running on ports 3000 and 5173
- [ ] I will use DIFFERENT ports for my app
- [ ] I will create a SEPARATE database (not use costaatt_hr)
- [ ] I will deploy in a SEPARATE directory (not C:\HR\HR\)
- [ ] I will verify HR app still works after deployment
- [ ] I will contact admin if anything goes wrong

---

**Good luck with your deployment! Follow these instructions carefully to ensure both applications run smoothly side by side.** 🚀

