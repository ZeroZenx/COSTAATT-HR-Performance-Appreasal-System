# COSTAATT HR Performance Gateway - Auto Startup Setup
# This script sets up automatic startup of services when Windows starts

Write-Host "🔧 Setting up COSTAATT HR Services for Auto-Startup..." -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

# Create a scheduled task for auto-startup
$taskName = "COSTAATT HR Services"
$scriptPath = "C:\HR\HR\start-services.ps1"

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create new scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Automatically starts COSTAATT HR Performance Gateway services on Windows startup"

Write-Host "✅ Auto-startup configured successfully!" -ForegroundColor Green
Write-Host "🚀 Services will now start automatically when Windows boots" -ForegroundColor Cyan
Write-Host "📋 Task Name: $taskName" -ForegroundColor Yellow

# Test the startup script
Write-Host "`n🧪 Testing startup script..." -ForegroundColor Yellow
& $scriptPath

