# Setup Windows Startup for HR Gateway Services
# This script creates a Windows Task Scheduler task to start HR services on boot

Write-Host "🔧 Setting up Windows startup for HR Gateway services..." -ForegroundColor Green

# Create the task action (run the batch file)
$action = New-ScheduledTaskAction -Execute "C:\HR\HR\start-hr-services.bat"

# Create the task trigger (at startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create the principal (run as current user with highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType InteractiveToken -RunLevel Highest

# Create the task
$taskName = "HR Gateway Services"
$taskDescription = "Automatically start HR Gateway backend and frontend services on Windows startup"

try {
    # Remove existing task if it exists
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    
    # Register the new task
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $taskDescription
    
    Write-Host "✅ Successfully created startup task: '$taskName'" -ForegroundColor Green
    Write-Host "🔄 The HR Gateway services will now start automatically when Windows boots" -ForegroundColor Yellow
    Write-Host "📋 To manage the task, open Task Scheduler and look for '$taskName'" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error creating startup task: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Try running PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host "`n🚀 To test the startup, you can run: C:\HR\HR\start-hr-services.bat" -ForegroundColor Green
