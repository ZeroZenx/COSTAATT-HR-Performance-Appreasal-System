# 🌐 Add HR System to Windows DNS Server

## 📋 Current Situation:

**DNS Server:** `MCCDNS01-2016.costaatt.edu.tt` (IP: `10.2.0.24`)  
**Status:** ❌ `hrpmg.costaatt.edu.tt` is NOT in the DNS server  
**Impact:** Other computers cannot access the HR system by domain name

---

## ✅ What Needs to Be Done:

Add a DNS **A Record** to your Windows DNS Server so ALL computers on the network can access:
```
https://hrpmg.costaatt.edu.tt
```

---

## 🔧 Steps to Add DNS Entry:

### **Step 1: Access DNS Server**

1. **Log into the DNS Server:**
   - Server Name: `MCCDNS01-2016.costaatt.edu.tt`
   - IP Address: `10.2.0.24`
   - Or use Remote Desktop from another computer

2. **Open DNS Manager:**
   - Press `Win + R`
   - Type: `dnsmgmt.msc`
   - Press Enter

---

### **Step 2: Navigate to Forward Lookup Zone**

1. In **DNS Manager**, expand the left panel:
   ```
   MCCDNS01-2016
   └─ Forward Lookup Zones
      └─ costaatt.edu.tt  ← Click this
   ```

2. Right-click on `costaatt.edu.tt`
3. Select **"New Host (A or AAAA)..."**

---

### **Step 3: Add the A Record**

A dialog box will appear. Fill in:

**Name (uses parent domain name if blank):**
```
hrpmg
```

**Fully qualified domain name (FQDN):**
```
hrpmg.costaatt.edu.tt
```
*(This should auto-fill when you type "hrpmg")*

**IP address:**
```
10.2.1.27
```

**☐ Create associated pointer (PTR) record**
- You can check this if you want reverse DNS (optional)

**Time to live (TTL):**
- Leave default, or set to `3600` seconds (1 hour)

---

### **Step 4: Confirm and Add**

1. Click **"Add Host"**
2. You should see: 
   ```
   The host record hrpmg.costaatt.edu.tt was successfully created
   ```
3. Click **"OK"**
4. Click **"Done"** to close the dialog

---

### **Step 5: Verify the Record**

1. In DNS Manager, you should now see:
   ```
   Name         Type    Data
   hrpmg        A       10.2.1.27
   ```

2. **Test from DNS Server itself:**
   - Open PowerShell
   - Run:
     ```powershell
     nslookup hrpmg.costaatt.edu.tt
     ```
   - Should return:
     ```
     Name:    hrpmg.costaatt.edu.tt
     Address: 10.2.1.27
     ```

---

### **Step 6: Test from Client Computer**

1. **On a different computer**, open PowerShell

2. **Flush DNS cache:**
   ```powershell
   ipconfig /flushdns
   ```

3. **Test DNS resolution:**
   ```powershell
   nslookup hrpmg.costaatt.edu.tt
   ```
   
   **Expected result:**
   ```
   Server:  MCCDNS01-2016.costaatt.edu.tt
   Address: 10.2.0.24

   Name:    hrpmg.costaatt.edu.tt
   Address: 10.2.1.27
   ```

4. **Test in browser:**
   - Open browser
   - Go to: `https://hrpmg.costaatt.edu.tt`
   - Accept the security warning (self-signed certificate)
   - ✅ You should see the HR login page!

---

## 🎯 Quick Reference:

### **DNS Entry Details:**

| Field | Value |
|-------|-------|
| **DNS Server** | MCCDNS01-2016.costaatt.edu.tt (10.2.0.24) |
| **Zone** | costaatt.edu.tt |
| **Host Name** | hrpmg |
| **Full FQDN** | hrpmg.costaatt.edu.tt |
| **Record Type** | A |
| **IP Address** | 10.2.1.27 |
| **TTL** | 3600 (or default) |

---

## 🔧 Alternative Method: PowerShell (Faster)

If you have access to the DNS server, you can add the record via PowerShell:

```powershell
# Run this on MCCDNS01-2016.costaatt.edu.tt as Administrator

Add-DnsServerResourceRecordA `
    -Name "hrpmg" `
    -ZoneName "costaatt.edu.tt" `
    -IPv4Address "10.2.1.27" `
    -TimeToLive 01:00:00

# Verify it was added
Get-DnsServerResourceRecord -ZoneName "costaatt.edu.tt" -Name "hrpmg"
```

---

## 🧪 Complete Testing Checklist:

After adding the DNS entry:

### **On DNS Server (MCCDNS01-2016):**
```powershell
# 1. Check DNS record exists
Get-DnsServerResourceRecord -ZoneName "costaatt.edu.tt" -Name "hrpmg"

# 2. Test resolution
nslookup hrpmg.costaatt.edu.tt

# 3. Test ping
ping hrpmg.costaatt.edu.tt
```

### **On HR Server (10.2.1.27):**
```powershell
# Verify services are running
Get-Service nginx
pm2 list

# Test local access
curl http://localhost:80 -UseBasicParsing
```

### **On Any Client Computer:**
```powershell
# 1. Flush DNS cache
ipconfig /flushdns

# 2. Test DNS resolution
nslookup hrpmg.costaatt.edu.tt

# 3. Test connectivity
Test-NetConnection -ComputerName hrpmg.costaatt.edu.tt -Port 443

# 4. Test in browser
Start-Process "https://hrpmg.costaatt.edu.tt"
```

---

## ❓ Troubleshooting:

### **Issue: nslookup still can't find hrpmg.costaatt.edu.tt**

**Possible causes:**

1. **DNS record not added correctly**
   - Check DNS Manager for the "hrpmg" A record
   - Verify IP is `10.2.1.27`

2. **DNS service needs restart**
   ```powershell
   # On DNS server
   Restart-Service DNS
   ```

3. **DNS replication delay** (if multiple DNS servers)
   - Wait 15 minutes for replication
   - Or force replication in AD Sites and Services

---

### **Issue: Can resolve DNS but can't connect**

**Possible causes:**

1. **Firewall blocking ports 80/443**
   - Check Windows Firewall on HR server (10.2.1.27)
   - Verify rules for ports 80 and 443

2. **Nginx not running**
   ```powershell
   # On HR server
   Get-Service nginx
   # If stopped, start it
   Start-Service nginx
   ```

3. **PM2 apps not running**
   ```powershell
   # On HR server
   pm2 list
   # If not running, start them
   pm2 start ecosystem.hr.config.js
   ```

---

### **Issue: DNS works from some computers but not others**

**Possible causes:**

1. **DNS cache on client computers**
   ```powershell
   # On each client computer
   ipconfig /flushdns
   ```

2. **Client computer using different DNS server**
   ```powershell
   # Check which DNS server client is using
   ipconfig /all | findstr "DNS Servers"
   
   # Should show: 10.2.0.24 (or another COSTAATT DNS server)
   ```

3. **Hosts file override**
   - Check: `C:\Windows\System32\drivers\etc\hosts`
   - Remove any conflicting entries for `hrpmg.costaatt.edu.tt`

---

## 📊 Before vs After:

### **BEFORE DNS Entry Added:**

```
Client Computer
    ↓
"What's the IP for hrpmg.costaatt.edu.tt?"
    ↓
DNS Server: "I don't know that domain"
    ↓
❌ ERR_NAME_NOT_RESOLVED
```

### **AFTER DNS Entry Added:**

```
Client Computer
    ↓
"What's the IP for hrpmg.costaatt.edu.tt?"
    ↓
DNS Server: "That's 10.2.1.27"
    ↓
Client connects to 10.2.1.27
    ↓
Nginx receives request (port 443)
    ↓
Nginx proxies to HR Frontend (port 5173)
    ↓
✅ HR Login Page Loads!
```

---

## 📧 Email Template for DNS Administrator:

If you need to request this from someone else:

---

**Subject:** DNS Entry Request - HR Performance Management System

**Body:**

Hi [DNS Administrator Name],

We need a DNS A record added for the new HR Performance Management System.

**Details:**
- **DNS Server:** MCCDNS01-2016.costaatt.edu.tt
- **Zone:** costaatt.edu.tt
- **Host Name:** hrpmg
- **Record Type:** A
- **IP Address:** 10.2.1.27
- **Full FQDN:** hrpmg.costaatt.edu.tt

**Purpose:** Internal HR system for performance appraisals and employee management.

**PowerShell command** (if needed):
```powershell
Add-DnsServerResourceRecordA -Name "hrpmg" -ZoneName "costaatt.edu.tt" -IPv4Address "10.2.1.27"
```

Please let me know once this is added so we can test.

Thank you!

---

---

## ✅ Success Criteria:

After adding the DNS entry, you should be able to:

1. ✅ Run `nslookup hrpmg.costaatt.edu.tt` from any computer and get `10.2.1.27`
2. ✅ Run `ping hrpmg.costaatt.edu.tt` from any computer and get replies from `10.2.1.27`
3. ✅ Open `https://hrpmg.costaatt.edu.tt` in a browser from any computer on the network
4. ✅ See the HR login page (after accepting the self-signed certificate warning)

---

## 🎯 Summary:

**Current Status:**
- ❌ DNS Server does NOT have the entry
- ✅ Server hosts file has it (only works ON the server)
- ❌ Other computers cannot access by domain name

**Action Required:**
1. Add DNS A record on `MCCDNS01-2016.costaatt.edu.tt`
2. Record: `hrpmg.costaatt.edu.tt` → `10.2.1.27`
3. Test from client computers

**Once completed:**
- ✅ All users can access `https://hrpmg.costaatt.edu.tt`
- ✅ No individual computer configuration needed
- ✅ Professional, enterprise-ready deployment

---

## 📞 Need Help?

**For DNS Server Access:**
- Contact: IT/Network Administrator
- Need: Access to `MCCDNS01-2016.costaatt.edu.tt`
- Need: Permissions to manage DNS records

**For Testing/Verification:**
- Use the testing checklist above
- Check DNS-SETUP-GUIDE.md for client-side troubleshooting

---

**This is the ONLY thing preventing network-wide access to your HR system!**

