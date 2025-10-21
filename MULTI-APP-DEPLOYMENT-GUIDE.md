# Multi-App Deployment Guide
## Running Multiple Applications on the Same Server

This guide explains how to deploy multiple applications on the same server alongside the HR Performance Management System.

---

## **Method 1: Different Ports (Simplest)**

### Current HR App Configuration:
- **Frontend**: Port `5173` → `http://10.2.1.27:5173` or `http://hrpmg.costaatt.edu.tt:5173`
- **Backend**: Port `3000` → `http://10.2.1.27:3000`
- **Database**: Port `3306` (MySQL)

### For New App:
1. **Choose different ports** (e.g., 5174 for frontend, 3001 for backend)
2. **Update new app's configuration**:
   ```javascript
   // New app backend (e.g., server.js)
   const PORT = 3001; // Different from HR app's 3000
   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

3. **Update new app's frontend**:
   ```typescript
   // New app frontend API config
   const API_BASE_URL = 'http://10.2.1.27:3001'; // Different from HR app's 3000
   ```

4. **Start both apps**:
   ```powershell
   # Terminal 1: HR App Backend
   cd C:\HR\HR\apps\api
   npm run dev

   # Terminal 2: HR App Frontend
   cd C:\HR\HR\apps\web
   npm run dev

   # Terminal 3: New App Backend
   cd C:\Path\To\NewApp\backend
   npm start

   # Terminal 4: New App Frontend
   cd C:\Path\To\NewApp\frontend
   npm run dev
   ```

---

## **Method 2: PM2 Process Manager (Recommended)**

PM2 manages multiple apps and keeps them running even after server restart.

### Installation:
```powershell
npm install -g pm2
```

### Setup PM2 for HR App:
```powershell
# Navigate to HR project root
cd C:\HR\HR

# Start HR backend
cd apps\api
pm2 start src\simple-server.js --name "hr-backend" --cwd "C:\HR\HR\apps\api"

# Start HR frontend (with Vite)
cd ..\web
pm2 start npm --name "hr-frontend" -- run dev

# Go back to root
cd ..\..
```

### Setup PM2 for New App:
```powershell
# Start new app backend
cd C:\Path\To\NewApp
pm2 start backend\server.js --name "newapp-backend" --cwd "C:\Path\To\NewApp\backend"

# Start new app frontend
pm2 start npm --name "newapp-frontend" --cwd "C:\Path\To\NewApp\frontend" -- run dev
```

### Manage PM2 Apps:
```powershell
# View all running apps
pm2 list

# View logs
pm2 logs hr-backend
pm2 logs newapp-backend

# Restart an app
pm2 restart hr-backend

# Stop an app
pm2 stop newapp-frontend

# Save configuration (persist across reboots)
pm2 save

# Setup auto-start on Windows
pm2 startup
```

---

## **Method 3: Nginx Reverse Proxy (Professional Setup)**

This allows you to use clean URLs without ports.

### Install Nginx on Windows:
1. Download from https://nginx.org/en/download.html
2. Extract to `C:\nginx`

### Configure Nginx:
Edit `C:\nginx\conf\nginx.conf`:

```nginx
http {
    # HR App
    server {
        listen 80;
        server_name hrpmg.costaatt.edu.tt;

        location / {
            proxy_pass http://localhost:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }

    # New App
    server {
        listen 80;
        server_name newapp.costaatt.edu.tt;

        location / {
            proxy_pass http://localhost:5174;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### Start Nginx:
```powershell
cd C:\nginx
start nginx
```

### Access Apps:
- HR App: `http://hrpmg.costaatt.edu.tt` (no port needed!)
- New App: `http://newapp.costaatt.edu.tt` (no port needed!)

---

## **Method 4: Path-Based Routing**

If you don't want to create new subdomains, use paths:

```nginx
server {
    listen 80;
    server_name costaatt.edu.tt;

    # HR App at /hr
    location /hr {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # New App at /booking (or any other path)
    location /booking {
        proxy_pass http://localhost:5174;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Access:**
- HR App: `http://costaatt.edu.tt/hr`
- New App: `http://costaatt.edu.tt/booking`

---

## **⚠️ Important Considerations:**

### 1. **Database Separation**
If your new app also uses MySQL:
- Create a **separate database** for the new app
- Don't share databases between apps

```sql
-- For HR app (existing)
USE costaatt_hr;

-- For new app (create new)
CREATE DATABASE new_app_db;
USE new_app_db;
```

### 2. **Memory Management**
Running multiple apps requires sufficient RAM:
- HR App: ~500MB-1GB
- New App: ~500MB-1GB
- MySQL: ~500MB
- **Total Recommended**: 4GB+ RAM

Monitor with Task Manager or:
```powershell
# Check memory usage
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Select-Object ProcessName, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet / 1MB, 2)}}
```

### 3. **Port Conflicts**
Ensure no port conflicts:
```powershell
# Check what's using a port
netstat -ano | findstr :3001
```

### 4. **Environment Variables**
Keep separate `.env` files for each app:
```
HR App:     C:\HR\HR\.env
New App:    C:\Path\To\NewApp\.env
```

### 5. **Firewall Rules**
Open ports in Windows Firewall for each app:
```powershell
# HR App ports (already done)
New-NetFirewallRule -DisplayName "HR Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "HR Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# New App ports
New-NetFirewallRule -DisplayName "NewApp Frontend" -Direction Inbound -LocalPort 5174 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "NewApp Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

## **🎯 Recommended Setup for Your Server:**

For the COSTAATT server, I recommend:

1. **Use PM2** to manage all apps (easy to restart, auto-start on reboot)
2. **Use Nginx** for clean URLs (optional but professional)
3. **Different ports** for each app (simple and effective)
4. **Separate databases** for each app (data isolation)

### Example Final Setup:
```
HR App:
- Frontend: PM2 → Port 5173 → Nginx → http://hrpmg.costaatt.edu.tt
- Backend: PM2 → Port 3000 → Nginx → http://hrpmg.costaatt.edu.tt/api
- Database: MySQL → costaatt_hr

New App (e.g., Booking System):
- Frontend: PM2 → Port 5174 → Nginx → http://booking.costaatt.edu.tt
- Backend: PM2 → Port 3001 → Nginx → http://booking.costaatt.edu.tt/api
- Database: MySQL → booking_db
```

---

## **📋 Quick Start Checklist:**

- [ ] Choose port numbers for new app (avoid 3000, 5173, 3306)
- [ ] Update new app's configuration files with new ports
- [ ] Create separate database for new app
- [ ] Install PM2 if not already installed
- [ ] Start new app with PM2
- [ ] Test new app works without affecting HR app
- [ ] (Optional) Setup Nginx for clean URLs
- [ ] Save PM2 configuration
- [ ] Setup Windows startup scripts

---

## **🆘 Troubleshooting:**

### Apps conflict or won't start:
```powershell
# Check port usage
netstat -ano | findstr :PORT_NUMBER

# Kill process using a port
taskkill /PID <PID_NUMBER> /F
```

### Apps crash after server reboot:
```powershell
# Ensure PM2 auto-start is configured
pm2 startup
pm2 save
```

### Can't access apps from other computers:
```powershell
# Check firewall rules
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*HR*"}

# Add firewall rule if missing
New-NetFirewallRule -DisplayName "App Name" -Direction Inbound -LocalPort PORT -Protocol TCP -Action Allow
```

---

## **📞 Need Help?**

If you encounter issues deploying multiple apps:
1. Check PM2 logs: `pm2 logs`
2. Check Windows Event Viewer
3. Verify port availability
4. Ensure sufficient server resources (RAM, CPU)

---

**This setup will allow you to run as many applications as your server resources permit without any conflicts!**

