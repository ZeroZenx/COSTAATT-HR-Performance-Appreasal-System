# HR System DNS Setup for Client Computers
# Run this script as Administrator to add DNS entry to hosts file

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HR System - Client DNS Setup" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Configuration
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hrServerIP = "10.2.1.27"
$hrDomain = "hrpmg.costaatt.edu.tt"
$hostsEntry = "$hrServerIP    $hrDomain"

# Backup hosts file
Write-Host "Creating backup of hosts file..." -ForegroundColor Yellow
$backupPath = "$hostsPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item -Path $hostsPath -Destination $backupPath -Force
Write-Host "✓ Backup created: $backupPath" -ForegroundColor Green
Write-Host ""

# Check if entry already exists
Write-Host "Checking hosts file..." -ForegroundColor Yellow
$hostsContent = Get-Content $hostsPath -Raw

if ($hostsContent -like "*$hrDomain*") {
    Write-Host "⚠ Entry already exists in hosts file" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Current entry:" -ForegroundColor Cyan
    Get-Content $hostsPath | Select-String $hrDomain | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    Write-Host ""
    
    $overwrite = Read-Host "Do you want to update it? (Y/N)"
    if ($overwrite -eq 'Y' -or $overwrite -eq 'y') {
        # Remove old entry
        $newContent = (Get-Content $hostsPath) | Where-Object { $_ -notlike "*$hrDomain*" }
        Set-Content -Path $hostsPath -Value $newContent -Force
        
        # Add new entry
        Add-Content -Path $hostsPath -Value "`n$hostsEntry" -Force
        Write-Host "✓ Entry updated" -ForegroundColor Green
    } else {
        Write-Host "Skipping update" -ForegroundColor Yellow
    }
} else {
    # Add new entry
    Write-Host "Adding entry to hosts file..." -ForegroundColor Yellow
    Add-Content -Path $hostsPath -Value "`n# HR Performance Management System" -Force
    Add-Content -Path $hostsPath -Value $hostsEntry -Force
    Write-Host "✓ Entry added successfully" -ForegroundColor Green
}

Write-Host ""

# Flush DNS cache
Write-Host "Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "✓ DNS cache flushed" -ForegroundColor Green
Write-Host ""

# Test DNS resolution
Write-Host "Testing DNS resolution..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName $hrDomain -Count 2 -ErrorAction Stop
    Write-Host "✓ DNS resolution successful!" -ForegroundColor Green
    Write-Host "  $hrDomain resolves to $hrServerIP" -ForegroundColor Cyan
} catch {
    Write-Host "⚠ DNS test failed, but hosts file entry was added" -ForegroundColor Yellow
    Write-Host "  This may be due to firewall/network settings" -ForegroundColor Gray
}

Write-Host ""

# Test HTTPS connectivity
Write-Host "Testing HTTPS connectivity..." -ForegroundColor Yellow
try {
    $testConnection = Test-NetConnection -ComputerName $hrServerIP -Port 443 -WarningAction SilentlyContinue
    if ($testConnection.TcpTestSucceeded) {
        Write-Host "✓ HTTPS port (443) is reachable" -ForegroundColor Green
    } else {
        Write-Host "⚠ Cannot reach HTTPS port (443)" -ForegroundColor Yellow
        Write-Host "  Make sure you're on the COSTAATT network" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠ Connection test failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You can now access the HR system at:" -ForegroundColor Cyan
Write-Host "  https://hrpmg.costaatt.edu.tt" -ForegroundColor Yellow -BackgroundColor DarkGreen
Write-Host ""

Write-Host "⚠ IMPORTANT: Security Warning" -ForegroundColor Yellow
Write-Host "When you first access the site, you'll see a security warning." -ForegroundColor White
Write-Host "This is normal for internal systems with self-signed certificates." -ForegroundColor White
Write-Host ""
Write-Host "To proceed:" -ForegroundColor Cyan
Write-Host "  1. Click 'Advanced'" -ForegroundColor White
Write-Host "  2. Click 'Proceed to hrpmg.costaatt.edu.tt'" -ForegroundColor White
Write-Host "  3. You'll only need to do this once" -ForegroundColor White
Write-Host ""

# Offer to open browser
Write-Host "Would you like to open the HR system in your browser now? (Y/N)" -ForegroundColor Cyan
$openBrowser = Read-Host

if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Yellow
    Start-Process "https://hrpmg.costaatt.edu.tt"
    Write-Host "✓ Browser opened" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup script completed successfully!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"

