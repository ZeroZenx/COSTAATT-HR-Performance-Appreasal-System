# 🔄 COSTAATT HR Performance Gateway - Service Management

This guide explains how to ensure the COSTAATT HR services automatically restart and run reliably.

## 🚀 Quick Start

### Option 1: PM2 Process Manager (Recommended)
```powershell
# Start services with auto-restart
.\start-services.ps1

# Monitor services
.\monitor-services.ps1

# Stop services
.\stop-services.ps1
```

### Option 2: Windows Service (Advanced)
```powershell
# Install as Windows Service
cd apps\api
node install-service.js
```

## 📋 Available Scripts

| Script | Purpose | Description |
|--------|---------|-------------|
| `start-services.ps1` | Start | Starts both API and Web services with PM2 |
| `stop-services.ps1` | Stop | Stops all services |
| `monitor-services.ps1` | Monitor | Shows service status and health |
| `setup-auto-startup.ps1` | Auto-start | Sets up Windows auto-startup |

## 🔧 PM2 Commands

```bash
# View status
pm2 status

# Real-time monitoring
pm2 monit

# View logs
pm2 logs

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Delete all services
pm2 delete all
```

## 🛠️ Service Configuration

### API Server (Port 3000)
- **File**: `apps/api/ecosystem.config.js`
- **Auto-restart**: ✅ Enabled
- **Memory limit**: 1GB
- **Logs**: `C:\HR\HR\logs\api-*.log`

### Web App (Port 5173)
- **File**: `apps/web/ecosystem.config.js`
- **Auto-restart**: ✅ Enabled
- **Memory limit**: 1GB
- **Logs**: `C:\HR\HR\logs\web-*.log`

## 🔄 Auto-Restart Features

### PM2 Auto-Restart
- ✅ **Crash Recovery**: Automatically restarts if service crashes
- ✅ **Memory Management**: Restarts if memory usage exceeds 1GB
- ✅ **Startup Recovery**: Restarts if system reboots
- ✅ **Health Monitoring**: Continuous process monitoring

### Windows Service Auto-Startup
- ✅ **Boot Startup**: Services start when Windows boots
- ✅ **System Account**: Runs with system privileges
- ✅ **High Priority**: Runs with highest priority
- ✅ **Battery Aware**: Works on battery power

## 📊 Monitoring & Logs

### Log Files Location
```
C:\HR\HR\logs\
├── api-error.log      # API error logs
├── api-out.log        # API output logs
├── api-combined.log   # API all logs
├── web-error.log      # Web error logs
├── web-out.log        # Web output logs
└── web-combined.log   # Web all logs
```

### Health Check URLs
- **API Health**: http://10.2.1.27:3000/appraisals/cmgjh70jm0001pbgn9qw93tbi
- **Web Health**: http://10.2.1.27:5173

## 🚨 Troubleshooting

### Services Won't Start
1. Check if ports 3000 and 5173 are available
2. Verify Node.js is installed
3. Check logs in `C:\HR\HR\logs\`
4. Run `pm2 logs` for real-time debugging

### Services Keep Crashing
1. Check memory usage: `pm2 monit`
2. Review error logs: `pm2 logs --err`
3. Increase memory limit in ecosystem.config.js
4. Check database connectivity

### Auto-Startup Not Working
1. Run `setup-auto-startup.ps1` as Administrator
2. Check Windows Task Scheduler
3. Verify service account permissions
4. Test manual startup first

## 🔧 Advanced Configuration

### Custom PM2 Configuration
Edit `ecosystem.config.js` files to modify:
- Memory limits
- Restart policies
- Environment variables
- Log file locations
- Instance counts

### Windows Service Configuration
Edit `install-service.js` to modify:
- Service name and description
- Node.js options
- Environment variables
- Working directory

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Run `monitor-services.ps1` for status
3. Try restarting with `stop-services.ps1` then `start-services.ps1`
4. Check Windows Event Viewer for system errors

## 🎯 Best Practices

1. **Regular Monitoring**: Use `monitor-services.ps1` daily
2. **Log Rotation**: Set up log rotation to prevent disk space issues
3. **Backup Configuration**: Keep ecosystem.config.js files backed up
4. **Test Restarts**: Periodically test service restart functionality
5. **Update Dependencies**: Keep Node.js and PM2 updated

