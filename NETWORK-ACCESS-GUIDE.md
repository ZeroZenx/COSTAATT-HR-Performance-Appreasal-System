# 🌐 Network Access Guide for COSTAATT HR Performance Gateway

## 📋 **Current Status**
- ✅ Backend Server: Running on `http://10.2.1.27:3000`
- ✅ Frontend Server: Running on `http://10.2.1.27:5173`
- ✅ Database: MySQL connected successfully
- ✅ SendGrid Email: Configured and ready

## 🔧 **Network Access Setup**

### **Step 1: Windows Firewall Configuration**

#### **Allow Node.js Through Firewall:**
1. **Open Windows Defender Firewall**
   - Press `Win + R`, type `wf.msc`, press Enter

2. **Create Inbound Rules:**
   - Click "Inbound Rules" → "New Rule"
   - Select "Program" → Next
   - Browse to: `C:\Program Files\nodejs\node.exe`
   - Select "Allow the connection" → Next
   - Check all profiles (Domain, Private, Public) → Next
   - Name: "Node.js HR Gateway" → Finish

3. **Create Port Rules:**
   - **Port 3000 (Backend):**
     - New Rule → Port → TCP → Specific Ports: 3000
     - Allow connection → All profiles → Name: "HR Gateway Backend"
   
   - **Port 5173 (Frontend):**
     - New Rule → Port → TCP → Specific Ports: 5173
     - Allow connection → All profiles → Name: "HR Gateway Frontend"

### **Step 2: Router/Network Configuration**

#### **Ensure Network Accessibility:**
1. **Check Network Type:**
   - Ensure your network is set to "Private" (not Public)
   - Go to: Settings → Network & Internet → Wi-Fi/Ethernet → Properties

2. **Router Configuration (if needed):**
   - No port forwarding required for local network access
   - Ensure devices are on the same subnet (10.2.1.x)

### **Step 3: Test Network Access**

#### **From Another Computer on the Same Network:**

1. **Open Web Browser**
2. **Navigate to:**
   ```
   http://10.2.1.27:5173
   ```

3. **Expected Results:**
   - ✅ Login page loads
   - ✅ Can access all features
   - ✅ Backend API calls work

#### **Login Credentials:**
```
Email: dheadley@costaatt.edu.tt
Password: P@ssw0rd!
```

## 🔍 **Troubleshooting Network Access**

### **If Other Computers Can't Access:**

#### **1. Check Windows Firewall:**
```powershell
# Run as Administrator
netsh advfirewall firewall add rule name="HR Gateway Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="HR Gateway Frontend" dir=in action=allow protocol=TCP localport=5173
```

#### **2. Check Network Discovery:**
- Go to: Control Panel → Network and Sharing Center
- Click "Change advanced sharing settings"
- Enable "Network discovery" and "File and printer sharing"

#### **3. Check IP Address:**
```cmd
ipconfig
```
Ensure the IP is `10.2.1.27` and other devices are on the same subnet.

#### **4. Test Connectivity:**
From another computer:
```cmd
ping 10.2.1.27
telnet 10.2.1.27 3000
telnet 10.2.1.27 5173
```

### **Alternative Access Methods:**

#### **Option 1: Use Computer Name**
Instead of IP, try:
```
http://[COMPUTER-NAME]:5173
```

#### **Option 2: Check All Network Interfaces**
```cmd
ipconfig /all
```
Look for the correct IP address on your network adapter.

## 🚀 **Quick Network Setup Script**

Run this PowerShell script as Administrator:

```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js HR Gateway" dir=in action=allow program="C:\Program Files\nodejs\node.exe"

# Allow specific ports
netsh advfirewall firewall add rule name="HR Gateway Backend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="HR Gateway Frontend" dir=in action=allow protocol=TCP localport=5173

# Enable network discovery
netsh advfirewall set allprofiles state off
netsh advfirewall set allprofiles state on

Write-Host "✅ Network access configured successfully!"
Write-Host "🌐 Access your HR Gateway at: http://10.2.1.27:5173"
```

## 📱 **Access from Different Devices**

### **From Windows Computers:**
- Use any web browser
- Navigate to: `http://10.2.1.27:5173`

### **From Mac/Linux:**
- Same URL: `http://10.2.1.27:5173`
- May need to adjust firewall settings

### **From Mobile Devices:**
- Connect to same Wi-Fi network
- Open browser: `http://10.2.1.27:5173`

## 🔒 **Security Considerations**

### **For Production Use:**
1. **Change Default Passwords**
2. **Use HTTPS** (SSL certificates)
3. **Implement VPN** for remote access
4. **Regular Security Updates**
5. **Monitor Access Logs**

### **Current Development Setup:**
- ✅ Local network only
- ✅ Basic authentication
- ✅ Firewall protection
- ✅ No external internet exposure

## 📞 **Support Information**

### **If Issues Persist:**
1. Check Windows Event Viewer for firewall logs
2. Verify network adapter settings
3. Test with different browsers
4. Check antivirus software settings
5. Ensure Windows Defender isn't blocking connections

### **Network Commands for Diagnosis:**
```cmd
# Check listening ports
netstat -an | findstr ":3000"
netstat -an | findstr ":5173"

# Check network connectivity
ping 10.2.1.27
tracert 10.2.1.27

# Check firewall status
netsh advfirewall show allprofiles
```

---

## 🎯 **Expected Result**
After following this guide, any computer on your network should be able to access:
- **Main Application:** `http://10.2.1.27:5173`
- **Backend API:** `http://10.2.1.27:3000`

The COSTAATT HR Performance Gateway will be fully accessible across your local network! 🚀

