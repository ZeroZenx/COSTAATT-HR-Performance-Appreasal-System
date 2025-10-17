# COSTAATT HR Performance Gateway - Network Access Setup
# Run this script as Administrator

Write-Host "🌐 Setting up network access for COSTAATT HR Performance Gateway..." -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Allow Node.js through firewall
Write-Host "🔧 Configuring Windows Firewall..." -ForegroundColor Yellow
try {
    # Remove existing rules (if any)
    netsh advfirewall firewall delete rule name="Node.js HR Gateway" 2>$null
    netsh advfirewall firewall delete rule name="HR Gateway Backend" 2>$null
    netsh advfirewall firewall delete rule name="HR Gateway Frontend" 2>$null
    
    # Add new rules
    netsh advfirewall firewall add rule name="Node.js HR Gateway" dir=in action=allow program="C:\Program Files\nodejs\node.exe"
    netsh advfirewall firewall add rule name="HR Gateway Backend" dir=in action=allow protocol=TCP localport=3000
    netsh advfirewall firewall add rule name="HR Gateway Frontend" dir=in action=allow protocol=TCP localport=5173
    
    Write-Host "✅ Firewall rules added successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configuring firewall: $($_.Exception.Message)" -ForegroundColor Red
}

# Display network information
Write-Host ""
Write-Host "📊 Network Information:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

# Get IP address
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "10.2.1.*" -or $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "172.16.*" -or $_.IPAddress -like "172.17.*" -or $_.IPAddress -like "172.18.*" -or $_.IPAddress -like "172.19.*" -or $_.IPAddress -like "172.20.*" -or $_.IPAddress -like "172.21.*" -or $_.IPAddress -like "172.22.*" -or $_.IPAddress -like "172.23.*" -or $_.IPAddress -like "172.24.*" -or $_.IPAddress -like "172.25.*" -or $_.IPAddress -like "172.26.*" -or $_.IPAddress -like "172.27.*" -or $_.IPAddress -like "172.28.*" -or $_.IPAddress -like "172.29.*" -or $_.IPAddress -like "172.30.*" -or $_.IPAddress -like "172.31.*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "🖥️  Server IP Address: $ipAddress" -ForegroundColor White
    Write-Host "🌐 Frontend URL: http://$ipAddress:5173" -ForegroundColor White
    Write-Host "🔧 Backend API: http://$ipAddress:3000" -ForegroundColor White
} else {
    Write-Host "⚠️  Could not determine IP address. Check network connection." -ForegroundColor Yellow
    Write-Host "🌐 Try: http://localhost:5173 or http://10.2.1.27:5173" -ForegroundColor White
}

# Check if ports are listening
Write-Host ""
Write-Host "🔍 Checking Server Status:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$backendPort = netstat -an | findstr ":3000"
$frontendPort = netstat -an | findstr ":5173"

if ($backendPort) {
    Write-Host "✅ Backend Server (Port 3000): Running" -ForegroundColor Green
} else {
    Write-Host "❌ Backend Server (Port 3000): Not Running" -ForegroundColor Red
    Write-Host "   Start with: npm run dev" -ForegroundColor Yellow
}

if ($frontendPort) {
    Write-Host "✅ Frontend Server (Port 5173): Running" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend Server (Port 5173): Not Running" -ForegroundColor Red
    Write-Host "   Start with: npm run dev" -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "==============" -ForegroundColor Green
Write-Host "1. Ensure servers are running: npm run dev" -ForegroundColor White
Write-Host "2. From another computer, open browser to:" -ForegroundColor White
Write-Host "   http://$ipAddress:5173" -ForegroundColor Cyan
Write-Host "3. Login with:" -ForegroundColor White
Write-Host "   Email: dheadley@costaatt.edu.tt" -ForegroundColor Cyan
Write-Host "   Password: P@ssw0rd!" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Network access setup complete!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

