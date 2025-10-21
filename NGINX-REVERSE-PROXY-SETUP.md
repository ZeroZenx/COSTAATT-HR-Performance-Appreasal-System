# 🌐 Nginx Reverse Proxy Setup - Clean URLs Without Ports

## 🎯 Goal
Transform ugly URLs with ports into clean, professional URLs:

**Before:**
- ❌ `http://hrpmg.costaatt.edu.tt:5173/login`
- ❌ `http://hrpmg.costaatt.edu.tt:3000/api/...`

**After:**
- ✅ `http://hrpmg.costaatt.edu.tt/login`
- ✅ `http://hrpmg.costaatt.edu.tt/api/...`

---

## 📋 Table of Contents
1. [What is a Reverse Proxy?](#what-is-a-reverse-proxy)
2. [Option 1: Nginx (Recommended)](#option-1-nginx-recommended)
3. [Option 2: Windows IIS](#option-2-windows-iis)
4. [Update Application Configuration](#update-application-configuration)
5. [DNS Configuration](#dns-configuration)
6. [SSL/HTTPS Setup (Optional)](#ssl-https-setup)
7. [Troubleshooting](#troubleshooting)

---

## 🤔 What is a Reverse Proxy?

A reverse proxy sits in front of your applications and routes incoming requests to the correct backend service:

```
User Request: http://hrpmg.costaatt.edu.tt/login
                        ↓
            ┌──────────────────────┐
            │   Nginx (Port 80)    │ ← Single entry point
            └──────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
┌──────────────┐              ┌──────────────┐
│   Frontend   │              │   Backend    │
│   Port 5173  │              │   Port 3000  │
└──────────────┘              └──────────────┘
```

**Benefits:**
- ✅ Clean URLs (no ports)
- ✅ Easy SSL/HTTPS setup
- ✅ Load balancing
- ✅ Better security
- ✅ Professional appearance

---

## 🚀 Option 1: Nginx (Recommended)

### **Step 1: Install Nginx on Windows**

```powershell
# Download Nginx for Windows
# Visit: http://nginx.org/en/download.html
# Download: nginx/Windows-x.x.x (stable version)

# Or use Chocolatey
choco install nginx -y

# Default installation location: C:\nginx
```

**Manual Installation:**
1. Download from: `http://nginx.org/download/nginx-1.24.0.zip`
2. Extract to `C:\nginx`
3. Verify installation:
```powershell
cd C:\nginx
.\nginx.exe -v
```

---

### **Step 2: Configure Nginx for HR System**

Create/edit `C:\nginx\conf\nginx.conf`:

```nginx
# Nginx Configuration for HR Performance Management System

worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Upstream definitions for HR System
    upstream hr_frontend {
        server 127.0.0.1:5173;
    }

    upstream hr_backend {
        server 127.0.0.1:3000;
    }

    # HR System - Clean URL Configuration
    server {
        listen       80;
        server_name  hrpmg.costaatt.edu.tt;

        # Increase buffer sizes for larger requests
        client_max_body_size 50M;
        proxy_buffer_size   128k;
        proxy_buffers   4 256k;
        proxy_busy_buffers_size   256k;

        # Logging
        access_log  logs/hrpmg_access.log;
        error_log   logs/hrpmg_error.log;

        # Backend API requests (must come first)
        location /api/ {
            proxy_pass http://hr_backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeout settings
            proxy_connect_timeout 600;
            proxy_send_timeout 600;
            proxy_read_timeout 600;
            send_timeout 600;
        }

        # Auth endpoints
        location /auth/ {
            proxy_pass http://hr_backend/auth/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # All other backend endpoints (appraisals, employees, etc.)
        location ~ ^/(appraisals|employees|competencies|cycles|templates|self-evaluations|users) {
            proxy_pass http://hr_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Frontend (all other requests)
        location / {
            proxy_pass http://hr_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # WebSocket support for Vite dev server
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Error pages
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }

    # Optional: Redirect www to non-www
    server {
        listen       80;
        server_name  www.hrpmg.costaatt.edu.tt;
        return 301 http://hrpmg.costaatt.edu.tt$request_uri;
    }

    # Optional: Catch-all for IP address access (redirect to domain)
    server {
        listen       80 default_server;
        server_name  _;
        return 301 http://hrpmg.costaatt.edu.tt$request_uri;
    }
}
```

---

### **Step 3: Test Nginx Configuration**

```powershell
# Test configuration syntax
cd C:\nginx
.\nginx.exe -t

# Expected output:
# nginx: the configuration file C:\nginx/conf/nginx.conf syntax is ok
# nginx: configuration file C:\nginx/conf/nginx.conf test is successful
```

---

### **Step 4: Configure Windows Firewall**

```powershell
# Allow HTTP (port 80) through firewall
New-NetFirewallRule -DisplayName "Nginx HTTP" `
  -Direction Inbound `
  -LocalPort 80 `
  -Protocol TCP `
  -Action Allow

# Verify firewall rule
Get-NetFirewallRule -DisplayName "Nginx HTTP"
```

---

### **Step 5: Start Nginx**

```powershell
# Navigate to Nginx directory
cd C:\nginx

# Start Nginx
start nginx

# Or run as process
.\nginx.exe

# Verify Nginx is running
tasklist /FI "IMAGENAME eq nginx.exe"

# Check if port 80 is listening
netstat -ano | findstr :80
```

---

### **Step 6: Create Nginx Windows Service (Auto-Start)**

Download NSSM (Non-Sucking Service Manager):

```powershell
# Install NSSM using Chocolatey
choco install nssm -y

# Or download from: https://nssm.cc/download
```

Create Windows Service:

```powershell
# Create Nginx service
nssm install nginx "C:\nginx\nginx.exe"

# Set service parameters
nssm set nginx AppDirectory "C:\nginx"
nssm set nginx DisplayName "Nginx Reverse Proxy"
nssm set nginx Description "Nginx reverse proxy for HR and CMMS systems"
nssm set nginx Start SERVICE_AUTO_START

# Start the service
nssm start nginx

# Verify service is running
Get-Service nginx

# Set to start automatically
Set-Service -Name nginx -StartupType Automatic
```

**Alternative: Using Task Scheduler**

```powershell
# Create startup script: C:\nginx\start-nginx.bat
@echo off
cd C:\nginx
start nginx.exe

# Create scheduled task to run at startup
$action = New-ScheduledTaskAction -Execute "C:\nginx\start-nginx.bat"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -TaskName "Start Nginx" -Description "Start Nginx reverse proxy at startup"
```

---

### **Step 7: Manage Nginx**

```powershell
# Start Nginx
cd C:\nginx
start nginx

# Stop Nginx
.\nginx.exe -s stop

# Reload configuration (after changes)
.\nginx.exe -s reload

# Restart Nginx
.\nginx.exe -s quit
start nginx

# Or using NSSM service:
nssm start nginx
nssm stop nginx
nssm restart nginx
```

---

## 🔧 Update Application Configuration

Now that Nginx is handling port 80, update your application to use clean URLs.

### **Frontend Configuration**

Update `apps/web/src/lib/config.ts`:

```typescript
// Configuration utility for dynamic API URL resolution

export const getApiBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;

  // Check if we're accessing via DNS-friendly name
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    // With Nginx reverse proxy, use clean URL
    return window.location.origin + '/api';
    // This resolves to: http://hrpmg.costaatt.edu.tt/api
  }

  // Fallback to IP address with port for local development
  return 'http://10.2.1.27:3000';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function for SSO redirect URL
export const getSSORedirectUrl = () => {
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    // With Nginx reverse proxy
    return window.location.origin + '/auth/sso/microsoft';
    // This resolves to: http://hrpmg.costaatt.edu.tt/auth/sso/microsoft
  }
  return 'http://10.2.1.27:3000/auth/sso/microsoft';
};
```

**Or even simpler - always use relative URLs:**

```typescript
export const getApiBaseUrl = () => {
  // Use environment variable if set
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;

  // In production with Nginx, use relative path
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    return '/api'; // Nginx will proxy to backend
  }

  // Fallback for direct access
  return 'http://10.2.1.27:3000';
};

export const API_BASE_URL = getApiBaseUrl();

export const getSSORedirectUrl = () => {
  if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
    return '/auth/sso/microsoft'; // Nginx will proxy to backend
  }
  return 'http://10.2.1.27:3000/auth/sso/microsoft';
};
```

### **Backend Configuration**

Update `apps/api/src/simple-server.js` CORS settings:

```javascript
// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://10.2.1.27:5173',
    'http://hrpmg.costaatt.edu.tt:5173',
    'http://hrpmg.costaatt.edu.tt',  // ← ADD THIS (without port)
    'http://www.hrpmg.costaatt.edu.tt'  // ← ADD THIS if using www
  ],
  credentials: true
}));
```

### **Environment Variables**

Update `.env` files:

**Frontend (`apps/web/.env`):**
```env
# Production with Nginx reverse proxy
VITE_API_URL=/api

# Or use full URL
# VITE_API_URL=http://hrpmg.costaatt.edu.tt/api

VITE_PORT=5173
```

**Backend (`apps/api/.env`):**
```env
# No changes needed - backend still runs on port 3000
PORT=3000
NODE_ENV=production
```

---

## 🌐 DNS Configuration

Ensure your DNS is properly configured:

### **Check Current DNS:**

```powershell
nslookup hrpmg.costaatt.edu.tt
```

**Expected result:**
```
Server:  your-dns-server
Address:  10.2.0.24

Name:    hrpmg.costaatt.edu.tt
Address:  10.2.1.27
```

### **If DNS Needs Update:**

Contact your network administrator to ensure:
- **A Record:** `hrpmg.costaatt.edu.tt` → `10.2.1.27`
- **CNAME (optional):** `www.hrpmg.costaatt.edu.tt` → `hrpmg.costaatt.edu.tt`

---

## 🔒 SSL/HTTPS Setup (Optional but Recommended)

To use `https://hrpmg.costaatt.edu.tt` instead of `http://`:

### **Option 1: Self-Signed Certificate (Internal Use)**

```powershell
# Create self-signed certificate
$cert = New-SelfSignedCertificate `
  -DnsName "hrpmg.costaatt.edu.tt" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -NotAfter (Get-Date).AddYears(5)

# Export certificate
$certPath = "C:\nginx\ssl"
New-Item -ItemType Directory -Force -Path $certPath

$password = ConvertTo-SecureString -String "YourPassword123" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "$certPath\hrpmg.pfx" -Password $password

# Convert to PEM format for Nginx (requires OpenSSL)
# Install OpenSSL: choco install openssl -y
openssl pkcs12 -in "C:\nginx\ssl\hrpmg.pfx" -out "C:\nginx\ssl\hrpmg.crt" -clcerts -nokeys -password pass:YourPassword123
openssl pkcs12 -in "C:\nginx\ssl\hrpmg.pfx" -out "C:\nginx\ssl\hrpmg.key" -nocerts -nodes -password pass:YourPassword123
```

### **Option 2: Commercial SSL Certificate (Public/Production)**

1. Purchase SSL certificate from provider (e.g., DigiCert, Let's Encrypt)
2. Generate CSR (Certificate Signing Request)
3. Download certificate files
4. Place in `C:\nginx\ssl\`

### **Update Nginx Configuration for HTTPS:**

```nginx
http {
    # ... existing config ...

    # HTTP to HTTPS redirect
    server {
        listen       80;
        server_name  hrpmg.costaatt.edu.tt;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen       443 ssl;
        server_name  hrpmg.costaatt.edu.tt;

        # SSL certificate files
        ssl_certificate      C:/nginx/ssl/hrpmg.crt;
        ssl_certificate_key  C:/nginx/ssl/hrpmg.key;

        # SSL settings
        ssl_session_cache    shared:SSL:1m;
        ssl_session_timeout  5m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers  on;

        # ... rest of server config (same as HTTP version) ...
        
        location /api/ {
            proxy_pass http://hr_backend/;
            # ... proxy settings ...
        }
        
        location / {
            proxy_pass http://hr_frontend;
            # ... proxy settings ...
        }
    }
}
```

**Firewall for HTTPS:**
```powershell
New-NetFirewallRule -DisplayName "Nginx HTTPS" `
  -Direction Inbound `
  -LocalPort 443 `
  -Protocol TCP `
  -Action Allow
```

---

## ✅ Verification Steps

### **1. Test Nginx Configuration:**
```powershell
cd C:\nginx
.\nginx.exe -t
```

### **2. Test Clean URLs:**

**From a web browser:**
- [ ] `http://hrpmg.costaatt.edu.tt` → Should load HR system
- [ ] `http://hrpmg.costaatt.edu.tt/login` → Should load login page
- [ ] Login and verify functionality

**From command line:**
```powershell
# Test frontend
curl http://hrpmg.costaatt.edu.tt

# Test API
curl http://hrpmg.costaatt.edu.tt/api/health
```

### **3. Verify Backend Routing:**

**Test API endpoints:**
```powershell
# Health check (if you have one)
curl http://hrpmg.costaatt.edu.tt/api/health

# Test authentication endpoint
curl http://hrpmg.costaatt.edu.tt/auth/me
```

### **4. Check Nginx Logs:**

```powershell
# View access log
Get-Content C:\nginx\logs\hrpmg_access.log -Tail 20

# View error log
Get-Content C:\nginx\logs\hrpmg_error.log -Tail 20
```

### **5. Verify All Systems Running:**

```powershell
# Check PM2 processes (backend/frontend still running)
pm2 list

# Check Nginx
tasklist /FI "IMAGENAME eq nginx.exe"

# Check ports
netstat -ano | findstr -i "80 3000 5173"
```

**Expected output:**
- Port 80: Nginx listening
- Port 3000: HR backend running
- Port 5173: HR frontend running

---

## 🎯 Final Architecture

```
User Request: http://hrpmg.costaatt.edu.tt/login
                        ↓
            ┌──────────────────────┐
            │   Nginx (Port 80)    │
            │  hrpmg.costaatt...   │
            └──────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        ↓                               ↓
    /api/*                         /* (everything else)
        ↓                               ↓
┌──────────────┐              ┌──────────────┐
│   Backend    │              │   Frontend   │
│   Port 3000  │              │   Port 5173  │
│  (PM2 app)   │              │  (PM2 app)   │
└──────────────┘              └──────────────┘
        ↓                               
┌──────────────┐
│    MySQL     │
│   Port 3306  │
└──────────────┘
```

**URL Mapping:**
- `http://hrpmg.costaatt.edu.tt/` → Frontend (port 5173)
- `http://hrpmg.costaatt.edu.tt/login` → Frontend (port 5173)
- `http://hrpmg.costaatt.edu.tt/api/*` → Backend (port 3000)
- `http://hrpmg.costaatt.edu.tt/auth/*` → Backend (port 3000)
- `http://hrpmg.costaatt.edu.tt/appraisals` → Backend (port 3000)

---

## 🔧 Troubleshooting

### **Issue 1: 502 Bad Gateway**

**Error:** Nginx shows "502 Bad Gateway"

**Solution:**
```powershell
# Check if backend/frontend are running
pm2 list

# Restart backend/frontend
pm2 restart hr-backend
pm2 restart hr-frontend

# Check logs
pm2 logs hr-backend --lines 50
pm2 logs hr-frontend --lines 50
```

### **Issue 2: 404 Not Found on API Calls**

**Error:** API endpoints return 404

**Solution:**
- Check Nginx configuration: `/api/` location block comes **before** `/` block
- Verify backend is running: `pm2 list`
- Check backend URL in frontend config
- Review Nginx error logs: `C:\nginx\logs\hrpmg_error.log`

### **Issue 3: WebSocket Connection Failed**

**Error:** "WebSocket connection failed" (for Vite dev server)

**Solution:**
Add WebSocket headers to Nginx config:
```nginx
location / {
    proxy_pass http://hr_frontend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

### **Issue 4: CORS Errors**

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
Update backend CORS to include clean URL:
```javascript
app.use(cors({
  origin: [
    'http://hrpmg.costaatt.edu.tt',  // ← Add this
    'http://10.2.1.27:5173'
  ],
  credentials: true
}));
```

### **Issue 5: Nginx Won't Start**

**Error:** "nginx: [emerg] bind() to 0.0.0.0:80 failed"

**Solution:**
```powershell
# Check what's using port 80
netstat -ano | findstr :80

# If IIS is using it, stop IIS
iisreset /stop

# Or change Nginx to use different port temporarily
# In nginx.conf: listen 8080; instead of listen 80;
```

### **Issue 6: Changes Not Reflected**

**Error:** Made configuration changes but not seeing them

**Solution:**
```powershell
# Reload Nginx configuration
cd C:\nginx
.\nginx.exe -s reload

# Or restart completely
.\nginx.exe -s quit
start nginx
```

---

## 📋 Complete Setup Checklist

- [ ] Nginx installed (`C:\nginx`)
- [ ] Nginx configuration updated (`C:\nginx\conf\nginx.conf`)
- [ ] Configuration tested (`nginx -t`)
- [ ] Firewall rule added for port 80
- [ ] Nginx started and running
- [ ] Nginx service/auto-start configured
- [ ] Frontend config updated to use clean URLs
- [ ] Backend CORS updated to allow clean URL
- [ ] DNS resolves correctly (`nslookup hrpmg.costaatt.edu.tt`)
- [ ] Clean URL works: `http://hrpmg.costaatt.edu.tt`
- [ ] Login functionality works
- [ ] API calls working through `/api/` path
- [ ] Nginx logs showing successful requests
- [ ] PM2 processes still running (backend/frontend)
- [ ] Old URL still works: `http://10.2.1.27:5173` (fallback)
- [ ] SSL configured (if using HTTPS)

---

## 🎉 Success!

**Before:**
- ❌ `http://hrpmg.costaatt.edu.tt:5173/login`
- ❌ Ugly URL with port numbers
- ❌ Users need to remember :5173

**After:**
- ✅ `http://hrpmg.costaatt.edu.tt/login`
- ✅ Clean, professional URL
- ✅ Easy to remember and share
- ✅ Ready for SSL/HTTPS upgrade
- ✅ Standard port 80 (HTTP) or 443 (HTTPS)

---

## 📚 Additional Resources

- **Nginx Documentation:** https://nginx.org/en/docs/
- **Nginx Windows:** https://nginx.org/en/docs/windows.html
- **NSSM Service Manager:** https://nssm.cc/
- **Let's Encrypt (Free SSL):** https://letsencrypt.org/

---

## 🔄 For Future CMMS Deployment

When deploying CMMS with clean URLs, add to Nginx config:

```nginx
# CMMS System
server {
    listen       80;
    server_name  cmms.costaatt.edu.tt;

    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
        # ... proxy settings ...
    }

    location / {
        proxy_pass http://127.0.0.1:5174;
        # ... proxy settings ...
    }
}
```

Then users access:
- HR: `http://hrpmg.costaatt.edu.tt`
- CMMS: `http://cmms.costaatt.edu.tt`

Clean and professional! 🎯

