# ✅ Apache SSL & Clean URLs Setup - Complete Guide

## 🎉 Overview

Your HR Performance Management System has been configured with:
- ✅ **SSL/HTTPS** with self-signed certificate
- ✅ **Clean URLs** without port numbers
- ✅ **Automatic HTTP to HTTPS redirect**
- ✅ **Reverse proxy** configuration

---

## 🌐 Your New URLs

### **Primary URLs (Use These!):**
```
https://hrpmg.costaatt.edu.tt
https://hrpmg.costaatt.edu.tt/login
https://hrpmg.costaatt.edu.tt/dashboard
https://hrpmg.costaatt.edu.tt/appraisals
```

### **HTTP URLs (Auto-Redirect to HTTPS):**
```
http://hrpmg.costaatt.edu.tt → https://hrpmg.costaatt.edu.tt
```

### **Old URLs (Still Work as Fallback):**
```
http://10.2.1.27:5173
http://hrpmg.costaatt.edu.tt:5173
```

---

## 🏗️ System Architecture

```
User Browser
    ↓
https://hrpmg.costaatt.edu.tt/login
    ↓
┌─────────────────────────┐
│   Apache (Port 443)     │ ← SSL/TLS Encryption
│   HTTPS Secure          │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│   Apache (Port 80)      │ ← Redirects to HTTPS
└─────────────────────────┘
    ↓
┌─────────┴─────────┐
↓                   ↓
Backend (3000)   Frontend (5173)
    ↓
  MySQL (3306)
```

**URL Routing:**
- `https://hrpmg.costaatt.edu.tt/` → Frontend (port 5173)
- `https://hrpmg.costaatt.edu.tt/login` → Frontend (port 5173)
- `https://hrpmg.costaatt.edu.tt/api/*` → Backend (port 3000)
- `https://hrpmg.costaatt.edu.tt/auth/*` → Backend (port 3000)
- `https://hrpmg.costaatt.edu.tt/appraisals` → Backend (port 3000)

---

## 🔒 SSL Certificate Information

### **Certificate Details:**
- **Location:** `C:\xampp\apache\conf\ssl.crt\hrpmg.costaatt.edu.tt.crt`
- **Private Key:** `C:\xampp\apache\conf\ssl.key\hrpmg.costaatt.edu.tt.key`
- **Type:** Self-signed certificate
- **Valid For:** 10 years
- **Domains Covered:**
  - `hrpmg.costaatt.edu.tt`
  - `www.hrpmg.costaatt.edu.tt`
  - `10.2.1.27`

### **Certificate Store:**
The certificate is also installed in:
- Windows Certificate Store: `cert:\LocalMachine\My`
- Friendly Name: "HR Performance Management System"

---

## ⚠️ Browser Security Warning (Self-Signed Certificate)

Since this is a **self-signed certificate**, users will see a security warning on their **first visit**:

### **What Users Will See:**

#### **Chrome/Edge:**
- "Your connection is not private"
- "NET::ERR_CERT_AUTHORITY_INVALID"

#### **Firefox:**
- "Warning: Potential Security Risk Ahead"

### **This is NORMAL for self-signed certificates!**

### **How Users Should Proceed:**

#### **Chrome/Edge:**
1. Click "**Advanced**"
2. Click "**Proceed to hrpmg.costaatt.edu.tt (unsafe)**"
3. You won't see this warning again on that computer

#### **Firefox:**
1. Click "**Advanced**"
2. Click "**Accept the Risk and Continue**"
3. You won't see this warning again on that computer

---

## 🔧 Removing the Certificate Warning (Optional)

To eliminate the warning completely, install the certificate on each client computer:

### **Step 1: Export Certificate from Server**

On the server, open PowerShell as Administrator:

```powershell
# Find the certificate
$cert = Get-ChildItem -Path "cert:\LocalMachine\My" | Where-Object {$_.FriendlyName -eq "HR Performance Management System"}

# Export as .cer file
Export-Certificate -Cert $cert -FilePath "C:\xampp\apache\conf\ssl.crt\hrpmg-root.cer"
```

### **Step 2: Distribute to Client Computers**

Copy `C:\xampp\apache\conf\ssl.crt\hrpmg-root.cer` to each client computer.

### **Step 3: Install on Each Client**

On each client computer:
1. Double-click `hrpmg-root.cer`
2. Click "**Install Certificate**"
3. Select "**Local Machine**"
4. Choose "**Place all certificates in the following store**"
5. Click "**Browse**" → Select "**Trusted Root Certification Authorities**"
6. Click "**Next**" → "**Finish**"

**After installation, users will see a secure padlock with no warnings!** 🔒

---

## 🚀 Managing Apache

### **Start/Stop/Restart Apache:**

#### **Using XAMPP Control Panel (Recommended):**
1. Open XAMPP Control Panel
2. Click "Stop" next to Apache
3. Click "Start" next to Apache

#### **Using Command Line:**

```powershell
# Restart Apache
C:\xampp\apache\bin\httpd.exe -k restart

# Stop Apache
C:\xampp\apache\bin\httpd.exe -k stop

# Start Apache
C:\xampp\apache\bin\httpd.exe -k start

# Test configuration
C:\xampp\apache\bin\httpd.exe -t
```

### **Check Apache Status:**

```powershell
# Check if Apache is running
Get-Process httpd

# Check ports 80 and 443
netstat -ano | findstr ":80 :443"
```

---

## 📊 Verification Checklist

After setup, verify everything works:

- [ ] Apache is running (`Get-Process httpd`)
- [ ] Port 80 is listening (`netstat -ano | findstr :80`)
- [ ] Port 443 is listening (`netstat -ano | findstr :443`)
- [ ] Backend is running (`pm2 list` - hr-backend online)
- [ ] Frontend is running (`pm2 list` - hr-frontend online)
- [ ] HTTP redirects to HTTPS: `http://hrpmg.costaatt.edu.tt` → `https://hrpmg.costaatt.edu.tt`
- [ ] HTTPS URL loads: `https://hrpmg.costaatt.edu.tt` ✅
- [ ] Login page loads: `https://hrpmg.costaatt.edu.tt/login` ✅
- [ ] Can log in successfully ✅
- [ ] Dashboard loads after login ✅
- [ ] Can view appraisals ✅
- [ ] No CORS errors in browser console ✅

---

## 📝 View Apache Logs

```powershell
# Access log
Get-Content C:\xampp\apache\logs\hrpmg.costaatt.edu.tt_ssl_access.log -Tail 50

# Error log
Get-Content C:\xampp\apache\logs\hrpmg.costaatt.edu.tt_ssl_error.log -Tail 50

# Real-time monitoring
Get-Content C:\xampp\apache\logs\hrpmg.costaatt.edu.tt_ssl_access.log -Wait
```

---

## 🆘 Troubleshooting

### **Issue 1: Certificate Warning Persists**

**This is normal for self-signed certificates!**

**Solution:** Click "Advanced" → "Proceed to site" or install the certificate on client computers (see above).

---

### **Issue 2: Can't Access Site (Connection Refused)**

**Check:**

1. Apache is running:
   ```powershell
   Get-Process httpd
   ```

2. If not running, start it:
   ```powershell
   C:\xampp\apache\bin\httpd.exe -k start
   ```

3. Check error logs:
   ```powershell
   Get-Content C:\xampp\apache\logs\error.log -Tail 50
   ```

---

### **Issue 3: 502 Bad Gateway**

**Cause:** Apache is running but backend/frontend are not.

**Solution:**

```powershell
# Check PM2 processes
pm2 list

# Restart backend and frontend
pm2 restart hr-backend
pm2 restart hr-frontend

# Verify they're online
pm2 list
```

---

### **Issue 4: Login Not Working / API Errors**

**Cause:** CORS or backend configuration issue.

**Solution:**

1. Check backend logs:
   ```powershell
   pm2 logs hr-backend --lines 50
   ```

2. Verify backend is accessible:
   ```powershell
   curl http://127.0.0.1:3000/health
   ```

3. Restart backend:
   ```powershell
   pm2 restart hr-backend
   ```

---

### **Issue 5: Port 80 or 443 Already in Use**

**Cause:** Another service (IIS, Nginx) is using the port.

**Check what's using the port:**

```powershell
netstat -ano | findstr ":80 :443"
```

**If IIS is using it:**

```powershell
# Stop IIS
iisreset /stop

# Disable IIS auto-start
Set-Service -Name W3SVC -StartupType Disabled
```

**If Nginx is using it:**

```powershell
# Stop Nginx
cd C:\tools\nginx-1.29.2
.\nginx.exe -s stop
```

---

### **Issue 6: HTTP Not Redirecting to HTTPS**

**Solution:**

1. Test Apache configuration:
   ```powershell
   C:\xampp\apache\bin\httpd.exe -t
   ```

2. Restart Apache:
   ```powershell
   C:\xampp\apache\bin\httpd.exe -k restart
   ```

3. Clear browser cache (Ctrl+Shift+Delete)

---

## 🔧 Configuration Files

### **Apache Virtual Host:**
`C:\xampp\apache\conf\extra\httpd-vhosts.conf`

### **SSL Certificate:**
`C:\xampp\apache\conf\ssl.crt\hrpmg.costaatt.edu.tt.crt`

### **SSL Private Key:**
`C:\xampp\apache\conf\ssl.key\hrpmg.costaatt.edu.tt.key`

### **Frontend Configuration:**
`apps\web\src\lib\config.ts`

### **Backend Configuration:**
`apps\api\src\simple-server.js`

---

## 📈 Benefits of This Setup

### **Security:**
- ✅ Encrypted communication (HTTPS)
- ✅ Data integrity (prevents tampering)
- ✅ Password protection (credentials encrypted)
- ✅ Secure session cookies

### **Professional:**
- ✅ Clean URLs (no port numbers)
- ✅ Easy to remember and share
- ✅ Can be printed on documents
- ✅ Professional appearance

### **Technical:**
- ✅ Standard ports (80, 443)
- ✅ Reverse proxy (single entry point)
- ✅ Better logging and monitoring
- ✅ Ready for load balancing

---

## 🔄 Updating Certificate (When Expired)

If your certificate expires in 10 years, regenerate it:

```powershell
# Remove old certificate
$cert = Get-ChildItem -Path "cert:\LocalMachine\My" | Where-Object {$_.FriendlyName -eq "HR Performance Management System"}
Remove-Item -Path "cert:\LocalMachine\My\$($cert.Thumbprint)"

# Re-run the setup script
.\setup-apache-ssl-clean-urls.ps1
```

---

## 🌐 For Future CMMS Deployment

When you deploy CMMS, you can easily add it to the same Apache server:

**Add to `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:**

```apache
# CMMS System
<VirtualHost *:443>
    ServerName cmms.costaatt.edu.tt
    
    SSLEngine on
    SSLCertificateFile "conf/ssl.crt/cmms.costaatt.edu.tt.crt"
    SSLCertificateKeyFile "conf/ssl.key/cmms.costaatt.edu.tt.key"
    
    ProxyPass /api/ http://127.0.0.1:4000/
    ProxyPassReverse /api/ http://127.0.0.1:4000/
    
    ProxyPass / http://127.0.0.1:5174/
    ProxyPassReverse / http://127.0.0.1:5174/
</VirtualHost>
```

Then restart Apache:
```powershell
C:\xampp\apache\bin\httpd.exe -k restart
```

**Result:**
- HR: `https://hrpmg.costaatt.edu.tt` ✅
- CMMS: `https://cmms.costaatt.edu.tt` ✅

---

## 📞 Quick Reference Commands

```powershell
# Check Apache status
Get-Process httpd

# Restart Apache
C:\xampp\apache\bin\httpd.exe -k restart

# Check PM2 services
pm2 list

# Restart backend
pm2 restart hr-backend

# Restart frontend
pm2 restart hr-frontend

# View Apache error log
Get-Content C:\xampp\apache\logs\error.log -Tail 20

# View HR error log
Get-Content C:\xampp\apache\logs\hrpmg.costaatt.edu.tt_ssl_error.log -Tail 20

# Test Apache configuration
C:\xampp\apache\bin\httpd.exe -t

# Check ports
netstat -ano | findstr ":80 :443 :3000 :5173"
```

---

## 🎉 Summary

**You now have:**
- ✅ HTTPS enabled with self-signed SSL certificate
- ✅ Automatic HTTP to HTTPS redirect
- ✅ Clean URLs (no port numbers)
- ✅ Secure encrypted connections
- ✅ Professional setup for internal use
- ✅ Apache reverse proxy configured

**Users access via:**
```
https://hrpmg.costaatt.edu.tt
```

**Perfect for internal corporate networks!** 🔒

---

## 📚 Additional Resources

- **Apache Documentation:** https://httpd.apache.org/docs/
- **SSL/TLS Configuration:** https://httpd.apache.org/docs/2.4/ssl/
- **XAMPP Documentation:** https://www.apachefriends.org/docs/
- **PM2 Documentation:** https://pm2.keymetrics.io/

---

**Your HR system is now secure with HTTPS and accessible via clean URLs!** 🎯🔒


