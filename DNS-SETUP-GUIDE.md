# 🌐 DNS Setup Guide for HR System Access

## ❌ Error You're Seeing:

```
This site can't be reached
hrpmg.costaatt.edu.tt's server IP address could not be found.
ERR_NAME_NOT_RESOLVED
```

## 📋 What This Means:

Your computer cannot resolve `hrpmg.costaatt.edu.tt` to the IP address `10.2.1.27` because:
- The DNS name doesn't exist in your organization's DNS server yet, OR
- You're not on the COSTAATT network, OR
- Your computer needs the DNS entry added locally

---

## ✅ Solutions (Choose One):

### **Solution 1: Add to Organization DNS Server** (RECOMMENDED for Production)

**Best for:** All users across the organization

**Steps:**
1. Contact your **IT/Network Administrator**
2. Request they add a DNS A record:
   ```
   Hostname: hrpmg.costaatt.edu.tt
   Type: A Record
   IP Address: 10.2.1.27
   TTL: 3600 (or default)
   ```

**Once added:**
- All computers on the network can access `https://hrpmg.costaatt.edu.tt`
- No individual computer configuration needed
- Professional, enterprise solution

**Who to contact:**
- Network Administrator
- Domain Controller Administrator
- IT Helpdesk

---

### **Solution 2: Add to Windows Hosts File** (Individual Computer Fix)

**Best for:** Testing, temporary access, or single computers

**Steps for EACH computer that needs access:**

#### **On Windows:**

1. **Open Notepad as Administrator:**
   - Press `Win + S`, type "Notepad"
   - Right-click "Notepad" → **Run as administrator**

2. **Open the hosts file:**
   - Click `File` → `Open`
   - Navigate to: `C:\Windows\System32\drivers\etc\`
   - Change filter from "Text Documents" to **"All Files"**
   - Open the file named `hosts`

3. **Add this line at the bottom:**
   ```
   10.2.1.27    hrpmg.costaatt.edu.tt
   ```

4. **Save and close** the file

5. **Flush DNS cache:**
   - Open Command Prompt as Administrator
   - Run: `ipconfig /flushdns`

6. **Test access:**
   - Open browser
   - Go to: `https://hrpmg.costaatt.edu.tt`
   - Accept the security warning (self-signed certificate)
   - ✅ You should see the HR login page

#### **On macOS:**

1. **Open Terminal**

2. **Edit the hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

3. **Add this line:**
   ```
   10.2.1.27    hrpmg.costaatt.edu.tt
   ```

4. **Save:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

5. **Flush DNS cache:**
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

6. **Test access:**
   - Open browser
   - Go to: `https://hrpmg.costaatt.edu.tt`

#### **On Linux:**

1. **Open Terminal**

2. **Edit the hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

3. **Add this line:**
   ```
   10.2.1.27    hrpmg.costaatt.edu.tt
   ```

4. **Save:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

5. **Test access:**
   - Open browser
   - Go to: `https://hrpmg.costaatt.edu.tt`

---

### **Solution 3: Use IP Address Directly** (Temporary Workaround)

**If DNS cannot be set up yet:**

Instead of: `https://hrpmg.costaatt.edu.tt`

Use: `http://10.2.1.27:5173`

**Limitations:**
- Not as professional
- Shows port number
- No HTTPS (no SSL/TLS encryption)
- Requires users to remember IP address

---

## 🧪 Testing After DNS Setup:

### **Test DNS Resolution:**

**Windows:**
```powershell
ping hrpmg.costaatt.edu.tt
nslookup hrpmg.costaatt.edu.tt
```

**macOS/Linux:**
```bash
ping hrpmg.costaatt.edu.tt
nslookup hrpmg.costaatt.edu.tt
```

**Expected result:**
```
Pinging hrpmg.costaatt.edu.tt [10.2.1.27] with 32 bytes of data:
Reply from 10.2.1.27: bytes=32 time<1ms TTL=128
```

### **Test HTTP/HTTPS Access:**

1. **Open browser**

2. **Go to:** `http://hrpmg.costaatt.edu.tt`
   - Should redirect to HTTPS

3. **Or go directly to:** `https://hrpmg.costaatt.edu.tt`
   - You'll see a security warning (self-signed certificate)
   - Click "Advanced" → "Proceed to hrpmg.costaatt.edu.tt"
   - ✅ You should see the HR login page

---

## 🔒 About the Security Warning:

When accessing `https://hrpmg.costaatt.edu.tt`, you'll see:

```
⚠️ Your connection is not private
NET::ERR_CERT_AUTHORITY_INVALID
```

**This is NORMAL!** Here's why:

1. The HR system uses a **self-signed SSL certificate**
2. It's not signed by a commercial Certificate Authority
3. The connection is still **encrypted** (secure)
4. It's safe to proceed for internal use

**To proceed:**
1. Click **"Advanced"**
2. Click **"Proceed to hrpmg.costaatt.edu.tt (unsafe)"**
3. You'll only need to do this once per browser

**The warning appears because:**
- Self-signed certificates are perfect for internal networks
- They provide encryption without the cost of commercial certificates
- Enterprise environments often use self-signed certificates for internal apps

---

## 📊 Network Requirements:

For users to access the HR system:

### **Connectivity:**
- ✅ Must be on the **COSTAATT network** (or VPN)
- ✅ Must have network access to `10.2.1.27`
- ✅ Firewall must allow HTTP (80) and HTTPS (443)

### **DNS (Choose one):**
- **Option A:** Organization DNS has `hrpmg.costaatt.edu.tt` → `10.2.1.27`
- **Option B:** Local hosts file has the entry
- **Option C:** Use IP address directly: `http://10.2.1.27:5173`

---

## 🚀 Recommended Deployment Steps:

### **For IT Administrator:**

**Step 1: Add DNS Entry (Organization DNS Server)**
```
Type: A Record
Name: hrpmg
Domain: costaatt.edu.tt
Full FQDN: hrpmg.costaatt.edu.tt
IP Address: 10.2.1.27
TTL: 3600
```

**Step 2: Verify DNS Propagation**
```powershell
nslookup hrpmg.costaatt.edu.tt
# Should return: 10.2.1.27
```

**Step 3: Test from Multiple Computers**
```
https://hrpmg.costaatt.edu.tt
```

**Step 4: Communicate to Users**
- Send email with the URL
- Explain the security warning is normal
- Provide instructions to proceed past the warning

---

## 📝 Sample Email to Users:

```
Subject: New HR Performance Management System Now Available

Dear Team,

Our new HR Performance Management System is now available at:
🔗 https://hrpmg.costaatt.edu.tt

FIRST TIME ACCESS:
You will see a security warning. This is normal for internal systems.
1. Click "Advanced"
2. Click "Proceed to hrpmg.costaatt.edu.tt"
3. You'll only need to do this once

The connection is encrypted and secure for internal use.

Login with your COSTAATT email and password.

For support, contact IT Helpdesk.

Best regards,
IT Department
```

---

## 🔧 Troubleshooting:

### **Error: ERR_NAME_NOT_RESOLVED**

**Cause:** Computer cannot resolve `hrpmg.costaatt.edu.tt` to IP address

**Fix:**
1. Check if you're on the COSTAATT network
2. Add entry to hosts file (see Solution 2 above)
3. Contact IT to add DNS entry (see Solution 1 above)
4. Or use IP address: `http://10.2.1.27:5173`

---

### **Error: This site can't be reached / Timeout**

**Cause:** Cannot connect to server

**Fix:**
1. Verify server is running:
   ```powershell
   ping 10.2.1.27
   ```
2. Check if services are running on server:
   ```powershell
   Get-Service nginx
   pm2 list
   ```
3. Verify firewall allows connections:
   ```powershell
   Test-NetConnection -ComputerName 10.2.1.27 -Port 443
   ```

---

### **Error: ERR_CONNECTION_REFUSED**

**Cause:** Server not listening on port

**Fix on server:**
```powershell
# Check Nginx status
Get-Service nginx

# If not running, start it
Start-Service nginx

# Check PM2 processes
pm2 list

# If not running, start them
pm2 start ecosystem.hr.config.js
```

---

### **Error: NET::ERR_CERT_AUTHORITY_INVALID**

**Cause:** Self-signed certificate warning

**Fix:** This is **normal and expected**
1. Click "Advanced"
2. Click "Proceed to hrpmg.costaatt.edu.tt"
3. Connection is still encrypted

---

## 📋 Current System Status:

### **Server Configuration:**
- **Server IP:** `10.2.1.27`
- **Domain Name:** `hrpmg.costaatt.edu.tt`
- **HTTP Port:** 80 (redirects to HTTPS)
- **HTTPS Port:** 443
- **SSL Certificate:** Self-signed (10-year validity)

### **DNS Status:**
- ✅ Server hosts file: Configured
- ⚠️  Organization DNS: **Needs to be added by Network Admin**
- ⚠️  Client hosts files: **Add manually per computer** (temporary)

### **Services:**
- ✅ Nginx: Running (ports 80, 443)
- ✅ HR Backend: Running (port 3000)
- ✅ HR Frontend: Running (port 5173)

---

## ✅ Quick Reference:

### **Access URLs:**
| URL | Purpose | Status |
|-----|---------|--------|
| `https://hrpmg.costaatt.edu.tt` | Primary URL (HTTPS) | ✅ Recommended |
| `http://hrpmg.costaatt.edu.tt` | HTTP (redirects to HTTPS) | ✅ Works |
| `http://10.2.1.27:5173` | Direct IP access | ✅ Temporary workaround |

### **DNS Configuration Needed:**
| Record Type | Name | Value | Status |
|-------------|------|-------|--------|
| A Record | hrpmg.costaatt.edu.tt | 10.2.1.27 | ⚠️ **Needs DNS Admin** |

### **Hosts File Entry:**
```
10.2.1.27    hrpmg.costaatt.edu.tt
```

---

## 🎯 Next Steps:

### **For Network/IT Administrator:**
1. [ ] Add DNS A record: `hrpmg.costaatt.edu.tt` → `10.2.1.27`
2. [ ] Test DNS resolution from client computers
3. [ ] Document the change in DNS management system
4. [ ] Communicate URL to users

### **For Individual Users (Temporary):**
1. [ ] Add entry to hosts file (see Solution 2)
2. [ ] Flush DNS cache
3. [ ] Test access to `https://hrpmg.costaatt.edu.tt`
4. [ ] Accept security warning (self-signed cert)
5. [ ] Log in with COSTAATT credentials

### **For HR Administrator:**
1. [ ] Wait for DNS setup by IT
2. [ ] Send announcement email to staff
3. [ ] Provide user training/documentation
4. [ ] Monitor initial adoption

---

## 📞 Support:

**DNS Issues:**
- Contact: Network/Domain Administrator
- Provide: This document (DNS-SETUP-GUIDE.md)
- Request: DNS A record for `hrpmg.costaatt.edu.tt` → `10.2.1.27`

**Server Issues:**
- Check: `AUTO-START-COMPLETE.md`
- Check: `HTTPS-SETUP-COMPLETE.md`
- Run: `pm2 list` and `Get-Service nginx`

**Application Issues:**
- Check: Application logs
- Run: `pm2 logs`

---

**Summary:** The HR system is working perfectly on the server. Other computers need DNS configuration to access it by name.

