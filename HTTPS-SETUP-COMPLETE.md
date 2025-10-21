# ✅ HTTPS Setup Complete - Self-Signed Certificate

## 🎉 Success!

Your HR Performance Management System now uses **HTTPS** with a self-signed SSL certificate for internal use.

---

## 🔒 What's Been Configured:

### **1. Self-Signed SSL Certificate Created** ✅
- **Certificate Name:** HR Performance Management System
- **Valid For:** 10 years
- **Domains Covered:**
  - `hrpmg.costaatt.edu.tt`
  - `www.hrpmg.costaatt.edu.tt`
  - `10.2.1.27`
- **Location:** `C:\tools\nginx-1.29.2\ssl\`
  - `hrpmg.crt` (Certificate file)
  - `hrpmg.key` (Private key file)

### **2. Nginx Configured for HTTPS** ✅
- **Port 80 (HTTP):** Automatically redirects to HTTPS
- **Port 443 (HTTPS):** Secure connection with SSL/TLS
- **SSL Protocols:** TLSv1.2 and TLSv1.3
- **Configuration:** `C:\tools\nginx-1.29.2\conf\nginx.conf`

### **3. Firewall Rules Added** ✅
- Port 80 (HTTP) - Redirect to HTTPS
- Port 443 (HTTPS) - Secure traffic

### **4. Automatic HTTP to HTTPS Redirect** ✅
All HTTP requests are automatically redirected to HTTPS:
```
http://hrpmg.costaatt.edu.tt → https://hrpmg.costaatt.edu.tt
http://10.2.1.27 → https://hrpmg.costaatt.edu.tt
```

---

## 🌐 Your New HTTPS URLs:

### **Primary URL (HTTPS):**
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

---

## ⚠️ Important: Browser Security Warning

Since this is a **self-signed certificate**, users will see a security warning the **first time** they visit:

### **What Users Will See:**

**Chrome/Edge:**
- "Your connection is not private"
- "NET::ERR_CERT_AUTHORITY_INVALID"

**Firefox:**
- "Warning: Potential Security Risk Ahead"

### **This is NORMAL for self-signed certificates!**

### **How to Proceed:**

#### **Chrome/Edge:**
1. Click "Advanced"
2. Click "Proceed to hrpmg.costaatt.edu.tt (unsafe)"
3. You won't see this warning again on that computer

#### **Firefox:**
1. Click "Advanced"
2. Click "Accept the Risk and Continue"
3. You won't see this warning again on that computer

#### **Alternative: Install Certificate (Recommended for Internal Use)**

To eliminate the warning completely, install the certificate on each client computer:

1. **Export Certificate from Server:**
   ```powershell
   # On the server, export the certificate
   $cert = Get-ChildItem -Path "cert:\LocalMachine\My" | Where-Object {$_.FriendlyName -eq "HR Performance Management System"}
   Export-Certificate -Cert $cert -FilePath "C:\tools\nginx-1.29.2\ssl\hrpmg-root.cer"
   ```

2. **Distribute to Client Computers:**
   - Copy `C:\tools\nginx-1.29.2\ssl\hrpmg-root.cer` to each client

3. **Install on Each Client:**
   - Double-click `hrpmg-root.cer`
   - Click "Install Certificate"
   - Select "Local Machine"
   - Choose "Place all certificates in the following store"
   - Click "Browse" → Select "Trusted Root Certification Authorities"
   - Click "Next" → "Finish"

**After installation, users will see a secure padlock with no warnings!** 🔒

---

## 🔧 System Architecture:

```
User Browser
    ↓
https://hrpmg.costaatt.edu.tt/login
    ↓
┌─────────────────────────┐
│   Nginx (Port 443)      │ ← SSL/TLS Encryption
│   HTTPS Secure          │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│   Nginx (Port 80)       │ ← Redirects to HTTPS
└─────────────────────────┘
    ↓
┌─────────┴─────────┐
↓                   ↓
Backend         Frontend
Port 3000       Port 5173
```

---

## 📊 SSL Certificate Details:

**View Certificate Info:**
```powershell
# View certificate details
$cert = Get-ChildItem -Path "cert:\LocalMachine\My" | Where-Object {$_.FriendlyName -eq "HR Performance Management System"}

$cert | Format-List Subject, Issuer, NotBefore, NotAfter, Thumbprint
```

**Certificate Information:**
- **Subject:** CN=hrpmg.costaatt.edu.tt
- **Issuer:** Self-signed
- **Valid From:** Today
- **Valid Until:** 10 years from today
- **Key Size:** 2048-bit RSA
- **Signature Algorithm:** SHA256

---

## 🔧 Managing HTTPS:

### **Nginx Commands:**

```powershell
# Navigate to Nginx directory
cd C:\tools\nginx-1.29.2

# Stop Nginx
.\nginx.exe -s stop

# Start Nginx
start nginx

# Reload configuration
.\nginx.exe -s reload

# Test configuration
.\nginx.exe -t
```

### **Check Status:**

```powershell
# Check if Nginx is running
Get-Process -Name nginx

# Check ports 80 and 443
netstat -ano | findstr ":80 :443" | findstr LISTENING

# View SSL error log
Get-Content C:\tools\nginx-1.29.2\logs\error.log -Tail 20
```

---

## 🆘 Troubleshooting:

### **Issue 1: "Connection is not secure" warning**

**This is NORMAL for self-signed certificates!**

**Quick Fix:** Click "Advanced" → "Proceed to site"

**Permanent Fix:** Install the certificate on each client computer (see above)

---

### **Issue 2: Can't connect via HTTPS**

**Check:**
1. Nginx is running:
   ```powershell
   Get-Process -Name nginx
   ```

2. Port 443 is listening:
   ```powershell
   netstat -ano | findstr :443
   ```

3. Firewall rule exists:
   ```powershell
   Get-NetFirewallRule -DisplayName "Nginx HTTPS"
   ```

4. Check Nginx error log:
   ```powershell
   Get-Content C:\tools\nginx-1.29.2\logs\error.log -Tail 20
   ```

---

### **Issue 3: HTTP not redirecting to HTTPS**

**Solution:**
1. Test Nginx configuration:
   ```powershell
   cd C:\tools\nginx-1.29.2
   .\nginx.exe -t
   ```

2. Reload Nginx:
   ```powershell
   .\nginx.exe -s reload
   ```

3. Clear browser cache and try again

---

### **Issue 4: Certificate expired or invalid**

**Regenerate Certificate:**
```powershell
# Remove old certificate
$cert = Get-ChildItem -Path "cert:\LocalMachine\My" | Where-Object {$_.FriendlyName -eq "HR Performance Management System"}
Remove-Item -Path "cert:\LocalMachine\My\$($cert.Thumbprint)"

# Create new certificate (valid for 10 more years)
$newCert = New-SelfSignedCertificate -DnsName "hrpmg.costaatt.edu.tt","www.hrpmg.costaatt.edu.tt","10.2.1.27" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(10) -FriendlyName "HR Performance Management System"

# Export and convert (repeat steps from setup)
```

---

## 📋 File Locations:

```
SSL Certificates:
  C:\tools\nginx-1.29.2\ssl\hrpmg.crt     (Certificate)
  C:\tools\nginx-1.29.2\ssl\hrpmg.key     (Private key)
  C:\tools\nginx-1.29.2\ssl\hrpmg.pfx     (Backup)

Nginx Configuration:
  C:\tools\nginx-1.29.2\conf\nginx.conf   (Main config)

Nginx Logs:
  C:\tools\nginx-1.29.2\logs\hrpmg_access.log
  C:\tools\nginx-1.29.2\logs\hrpmg_error.log
  C:\tools\nginx-1.29.2\logs\error.log

Windows Certificate Store:
  cert:\LocalMachine\My\[Thumbprint]
```

---

## ✅ Verification Checklist:

- [ ] Nginx running (`Get-Process -Name nginx`)
- [ ] Port 80 listening (`netstat -ano | findstr :80`)
- [ ] Port 443 listening (`netstat -ano | findstr :443`)
- [ ] HTTPS URL works: `https://hrpmg.costaatt.edu.tt` ✅
- [ ] HTTP redirects to HTTPS ✅
- [ ] Login functionality works over HTTPS ✅
- [ ] Certificate warning appears (normal for self-signed) ✅
- [ ] Can proceed past warning ✅
- [ ] Backend and Frontend still running ✅

---

## 🎓 Benefits of HTTPS (Even with Self-Signed Certificate):

### **Security:**
- ✅ Encrypted communication (prevents eavesdropping)
- ✅ Data integrity (prevents tampering)
- ✅ Password protection (login credentials encrypted)

### **Compatibility:**
- ✅ Modern browser features that require HTTPS
- ✅ WebSocket secure connections
- ✅ Service workers and PWA support

### **Professional:**
- ✅ Green padlock (after certificate installation)
- ✅ Standard HTTPS protocol
- ✅ No port numbers in URL

---

## 🚀 Optional: Upgrade to Commercial SSL (Future)

If you ever need external access or want to eliminate certificate warnings completely:

1. **Purchase SSL Certificate:**
   - DigiCert, Let's Encrypt (free), Comodo, etc.

2. **Replace Self-Signed Certificate:**
   - Copy new certificate files to `C:\tools\nginx-1.29.2\ssl\`
   - Update Nginx config to point to new files
   - Reload Nginx

3. **No Code Changes Needed:**
   - Everything else stays the same!

---

## 📞 Quick Reference:

### **Access URLs:**
- **HTTPS (Secure):** `https://hrpmg.costaatt.edu.tt`
- **HTTP (Redirects):** `http://hrpmg.costaatt.edu.tt`

### **Ports:**
- **80:** HTTP → HTTPS redirect
- **443:** HTTPS secure connection
- **3000:** Backend (internal)
- **5173:** Frontend (internal)

### **Management:**
- **Stop:** `cd C:\tools\nginx-1.29.2 && .\nginx.exe -s stop`
- **Start:** `cd C:\tools\nginx-1.29.2 && start nginx`
- **Reload:** `cd C:\tools\nginx-1.29.2 && .\nginx.exe -s reload`

---

## 🎉 Summary:

**You now have:**
- ✅ HTTPS enabled with self-signed SSL certificate
- ✅ Automatic HTTP to HTTPS redirect
- ✅ Secure encrypted connections
- ✅ Clean URLs (no port numbers)
- ✅ Professional setup for internal use

**Users access via:**
```
https://hrpmg.costaatt.edu.tt
```

**Perfect for internal corporate networks!** 🔒

---

## 📚 Additional Resources:

- **Nginx HTTPS Guide:** `NGINX-REVERSE-PROXY-SETUP.md`
- **Quick Reference:** `NGINX-QUICK-REFERENCE.txt`
- **Clean URL Setup:** `CLEAN-URL-SETUP-COMPLETE.md`

---

**Your HR system is now secure with HTTPS!** 🎯🔒

