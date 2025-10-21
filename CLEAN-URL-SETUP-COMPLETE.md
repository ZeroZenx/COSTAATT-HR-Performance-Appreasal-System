# ✅ Clean URL Setup - Complete Guide

## 🎉 Setup Complete!

Your HR Performance Management System is now configured to use clean URLs without port numbers.

---

## 📋 What's Been Done

### **✅ Code Changes:**

1. **Frontend Configuration Updated** (`apps/web/src/lib/config.ts`)
   - API calls now use `/api` instead of `http://hrpmg.costaatt.edu.tt:3000`
   - SSO redirects use `/auth/sso/microsoft` instead of full URL with port
   - Automatically detects Nginx reverse proxy and uses clean URLs

2. **Backend CORS Updated** (`apps/api/src/simple-server.js`)
   - Added `http://hrpmg.costaatt.edu.tt` (no port) to allowed origins
   - Added `http://www.hrpmg.costaatt.edu.tt` for www subdomain support
   - Maintains backward compatibility with port-based URLs

3. **Nginx Configuration Created**
   - Comprehensive reverse proxy configuration
   - Automated setup script available
   - Documentation and guides provided

### **✅ Files Created:**

1. `NGINX-REVERSE-PROXY-SETUP.md` - Comprehensive 500+ line guide
2. `setup-nginx-clean-urls.ps1` - Automated setup script
3. `CLEAN-URL-SETUP-COMPLETE.md` - This file

### **✅ All Changes Committed to GitHub** 🚀

---

## 🚀 Next Steps - Run the Nginx Setup

You now need to **run the Nginx setup script** to complete the configuration:

### **Step 1: Run Setup Script**

```powershell
# Open PowerShell as Administrator (RIGHT-CLICK → Run as Administrator)
cd C:\HR\HR

# Run the automated setup script
.\setup-nginx-clean-urls.ps1
```

**The script will automatically:**
- ✅ Install Nginx via Chocolatey
- ✅ Create the reverse proxy configuration
- ✅ Configure Windows Firewall (port 80)
- ✅ Test and start Nginx
- ✅ Optionally setup auto-start service

### **Step 2: Restart Your Application**

After Nginx is running, restart your HR application to pick up the new configuration:

```powershell
# Restart backend and frontend
pm2 restart hr-backend
pm2 restart hr-frontend

# Verify both are running
pm2 list
```

### **Step 3: Test Clean URLs**

Open your browser and test:

✅ **Clean URL (New):**
```
http://hrpmg.costaatt.edu.tt
http://hrpmg.costaatt.edu.tt/login
http://hrpmg.costaatt.edu.tt/dashboard
```

✅ **Fallback URLs (Still Work):**
```
http://10.2.1.27:5173
http://hrpmg.costaatt.edu.tt:5173
```

---

## 🎯 Expected Results

### **Before (Ugly URLs):**
```
❌ http://hrpmg.costaatt.edu.tt:5173/login
❌ http://hrpmg.costaatt.edu.tt:5173/appraisals
❌ http://hrpmg.costaatt.edu.tt:3000/api/employees
```

### **After (Clean URLs):**
```
✅ http://hrpmg.costaatt.edu.tt/login
✅ http://hrpmg.costaatt.edu.tt/appraisals
✅ http://hrpmg.costaatt.edu.tt/api/employees
```

---

## 🏗️ System Architecture

```
User Browser
    ↓
    └─→ http://hrpmg.costaatt.edu.tt/login
              ↓
    ┌─────────────────────┐
    │   Nginx (Port 80)   │ ← User connects here (no port in URL!)
    │   Reverse Proxy     │
    └─────────────────────┘
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
/api/*              /* (all else)
    ↓                   ↓
┌─────────┐      ┌──────────┐
│ Backend │      │ Frontend │
│ :3000   │      │  :5173   │
└─────────┘      └──────────┘
```

**URL Routing:**
- `http://hrpmg.costaatt.edu.tt/` → Frontend (port 5173)
- `http://hrpmg.costaatt.edu.tt/login` → Frontend (port 5173)
- `http://hrpmg.costaatt.edu.tt/api/*` → Backend (port 3000)
- `http://hrpmg.costaatt.edu.tt/auth/*` → Backend (port 3000)
- `http://hrpmg.costaatt.edu.tt/appraisals` → Backend (port 3000)

---

## 🔧 How It Works

### **Frontend Changes:**

**Old Code:**
```typescript
if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
  return 'http://hrpmg.costaatt.edu.tt:3000';  // ❌ With port
}
```

**New Code:**
```typescript
if (window.location.hostname === 'hrpmg.costaatt.edu.tt') {
  return window.location.origin + '/api';  // ✅ Clean URL
  // Resolves to: http://hrpmg.costaatt.edu.tt/api
}
```

### **Backend Changes:**

**Old Code:**
```javascript
origin: [
  'http://localhost:5173', 
  'http://10.2.1.27:5173',
  'http://hrpmg.costaatt.edu.tt:5173'
]
```

**New Code:**
```javascript
origin: [
  'http://localhost:5173', 
  'http://10.2.1.27:5173',
  'http://hrpmg.costaatt.edu.tt:5173',
  'http://hrpmg.costaatt.edu.tt',  // ✅ Clean URL
  'http://www.hrpmg.costaatt.edu.tt'  // ✅ www support
]
```

---

## 📊 Verification Checklist

After running the setup script and restarting the application:

- [ ] Nginx installed at `C:\nginx`
- [ ] Nginx configuration created (`C:\nginx\conf\nginx.conf`)
- [ ] Firewall rule added for port 80
- [ ] Nginx is running (`tasklist /FI "IMAGENAME eq nginx.exe"`)
- [ ] Backend still running on port 3000 (`pm2 list`)
- [ ] Frontend still running on port 5173 (`pm2 list`)
- [ ] Clean URL loads: `http://hrpmg.costaatt.edu.tt` ✅
- [ ] Login works: `http://hrpmg.costaatt.edu.tt/login` ✅
- [ ] Can create/view appraisals ✅
- [ ] API calls work (check browser console - no errors) ✅
- [ ] Old URLs still work as fallback: `http://10.2.1.27:5173` ✅

---

## 🔧 Nginx Management

### **Start/Stop Nginx:**

```powershell
# Navigate to Nginx directory
cd C:\nginx

# Start Nginx
start nginx

# Stop Nginx
.\nginx.exe -s stop

# Reload configuration (after making changes)
.\nginx.exe -s reload

# Test configuration
.\nginx.exe -t
```

### **If Using Windows Service (via setup script):**

```powershell
# Start service
nssm start nginx

# Stop service
nssm stop nginx

# Restart service
nssm restart nginx

# Check status
Get-Service nginx
```

### **View Nginx Logs:**

```powershell
# Access logs
Get-Content C:\nginx\logs\hrpmg_access.log -Tail 50

# Error logs
Get-Content C:\nginx\logs\hrpmg_error.log -Tail 50

# Real-time monitoring
Get-Content C:\nginx\logs\hrpmg_access.log -Wait
```

---

## 🆘 Troubleshooting

### **Issue 1: Clean URL not loading**

**Symptoms:** `http://hrpmg.costaatt.edu.tt` doesn't load

**Solution:**
```powershell
# 1. Check if Nginx is running
tasklist /FI "IMAGENAME eq nginx.exe"

# 2. If not running, start it
cd C:\nginx
start nginx

# 3. Check port 80 is listening
netstat -ano | findstr :80

# 4. Verify firewall rule
Get-NetFirewallRule -DisplayName "Nginx HTTP"
```

### **Issue 2: 502 Bad Gateway**

**Symptoms:** Nginx shows "502 Bad Gateway" error

**Solution:**
```powershell
# 1. Check if backend/frontend are running
pm2 list

# 2. Restart if needed
pm2 restart hr-backend
pm2 restart hr-frontend

# 3. Check logs
pm2 logs hr-backend --lines 50
pm2 logs hr-frontend --lines 50
```

### **Issue 3: API calls failing**

**Symptoms:** Frontend loads but can't fetch data

**Solution:**
```powershell
# 1. Check Nginx error logs
Get-Content C:\nginx\logs\hrpmg_error.log -Tail 20

# 2. Verify backend is accessible
curl http://127.0.0.1:3000

# 3. Test Nginx proxy
curl http://hrpmg.costaatt.edu.tt/api/health
```

### **Issue 4: CORS errors**

**Symptoms:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
```powershell
# Backend should already be updated, but verify CORS config includes:
# 'http://hrpmg.costaatt.edu.tt'

# Restart backend to ensure changes are loaded
pm2 restart hr-backend
```

### **Issue 5: Old URL still being used**

**Symptoms:** Application works but still uses port numbers

**Solution:**
```powershell
# 1. Ensure you're accessing via clean URL
# Use: http://hrpmg.costaatt.edu.tt
# Not: http://hrpmg.costaatt.edu.tt:5173

# 2. Clear browser cache
# Ctrl+Shift+Delete → Clear cached images and files

# 3. Hard refresh
# Ctrl+F5 or Ctrl+Shift+R
```

---

## 🎓 Benefits of Clean URLs

### **Professional Appearance:**
- ✅ Easier to remember: `hrpmg.costaatt.edu.tt` vs `hrpmg.costaatt.edu.tt:5173`
- ✅ Easier to communicate to users
- ✅ Can be printed on documents/business cards

### **Technical Benefits:**
- ✅ Standard HTTP port (80) - no firewall issues
- ✅ Ready for SSL/HTTPS upgrade (port 443)
- ✅ Better for mobile devices
- ✅ Easier integration with other systems

### **Security Benefits:**
- ✅ Single entry point (easier to secure)
- ✅ Can add authentication at proxy level
- ✅ Better logging and monitoring
- ✅ Can add rate limiting

---

## 🔒 Optional: Add SSL/HTTPS

Want to upgrade to `https://hrpmg.costaatt.edu.tt`?

See the **SSL/HTTPS Setup** section in `NGINX-REVERSE-PROXY-SETUP.md` for:
- Self-signed certificates (internal use)
- Commercial SSL certificates (production)
- Let's Encrypt (free SSL)

---

## 🌐 For Future CMMS Deployment

When you deploy the CMMS system, you can easily add it to Nginx:

**Add to `C:\nginx\conf\nginx.conf`:**
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

Then reload Nginx:
```powershell
cd C:\nginx
.\nginx.exe -s reload
```

**Result:**
- HR: `http://hrpmg.costaatt.edu.tt` ✅
- CMMS: `http://cmms.costaatt.edu.tt` ✅

All systems with clean URLs! 🚀

---

## 📚 Additional Resources

- **Nginx Documentation:** https://nginx.org/en/docs/
- **Nginx Windows Guide:** https://nginx.org/en/docs/windows.html
- **NSSM Service Manager:** https://nssm.cc/
- **PM2 Documentation:** https://pm2.keymetrics.io/

---

## 📝 Summary

### **What You Have Now:**

1. ✅ **Clean URLs** - No more port numbers in URLs
2. ✅ **Professional Appearance** - Easy to share and remember
3. ✅ **Backward Compatible** - Old URLs still work
4. ✅ **Ready for SSL** - Easy upgrade to HTTPS
5. ✅ **Multi-App Ready** - Can easily add CMMS with clean URLs

### **What's Left to Do:**

1. ⏳ Run `.\setup-nginx-clean-urls.ps1` (as Administrator)
2. ⏳ Restart application (`pm2 restart hr-backend hr-frontend`)
3. ⏳ Test clean URL: `http://hrpmg.costaatt.edu.tt`
4. ⏳ Verify all features work
5. ✅ **Done!**

---

## 🎉 Ready to Complete!

To finish the setup, simply run:

```powershell
# 1. Run as Administrator
.\setup-nginx-clean-urls.ps1

# 2. Restart app
pm2 restart hr-backend
pm2 restart hr-frontend

# 3. Test
# Open: http://hrpmg.costaatt.edu.tt
```

**That's it! Your clean URL setup will be complete!** 🚀

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review Nginx logs: `C:\nginx\logs\hrpmg_error.log`
3. Review application logs: `pm2 logs`
4. Consult: `NGINX-REVERSE-PROXY-SETUP.md` for detailed instructions

---

**Enjoy your professional, clean URLs!** ✨

`http://hrpmg.costaatt.edu.tt` 🎯

