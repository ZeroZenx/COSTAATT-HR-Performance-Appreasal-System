# DNS Entry Request for HR Performance Management System

## 📋 Request Summary

Please create a DNS A record for the HR Performance Management System, similar to how you created the CMMS DNS entry.

---

## 🌐 DNS Entry Details

### **Primary Domain:**
- **Hostname:** `hrpmg.costaatt.edu.tt`
- **Record Type:** A Record
- **IP Address:** `10.2.1.27`
- **TTL:** 3600 (or your standard default)

### **Optional - WWW Subdomain:**
- **Hostname:** `www.hrpmg.costaatt.edu.tt`
- **Record Type:** CNAME
- **Target:** `hrpmg.costaatt.edu.tt`
- **TTL:** 3600 (or your standard default)

---

## ✅ Example - Already Working

You've already successfully created this DNS entry:

```
cmms.costaatt.edu.tt → 10.2.1.27 ✅
```

We need the same setup for the HR system:

```
hrpmg.costaatt.edu.tt → 10.2.1.27 (Please create)
```

**Both domains will point to the same IP address** - this is completely normal and how virtual hosting works.

---

## 🔧 Technical Details

### **Current Status:**
- **Server IP:** 10.2.1.27
- **CMMS DNS:** Already configured and working ✅
- **HR DNS:** Needs to be created

### **After DNS Creation:**
Both systems will be accessible on the same server:
- CMMS: `https://cmms.costaatt.edu.tt` → 10.2.1.27
- HR: `https://hrpmg.costaatt.edu.tt` → 10.2.1.27

Apache virtual hosting will route traffic to the correct application based on the domain name.

---

## ✅ Verification Steps

After creating the DNS entry, please test:

```powershell
nslookup hrpmg.costaatt.edu.tt
```

**Expected Result:**
```
Server:  MCCDNS01-2016.costaatt.edu.tt
Address:  10.2.0.24

Name:    hrpmg.costaatt.edu.tt
Address:  10.2.1.27
```

---

## 📞 Contact

If you have any questions about this request, please contact the HR system administrator.

---

## 🎯 Priority

**Standard Priority** - The system is currently accessible via `https://10.2.1.27` but we need the DNS entry for a cleaner, more professional URL.

---

Thank you!


