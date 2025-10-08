#!/bin/bash

# COSTAATT HR Performance Gateway - Employee Reconciliation Cron Job Setup
# This script sets up a weekly cron job to run employee reconciliation every Friday at 6 PM

echo "🔄 Setting up weekly employee reconciliation cron job..."

# Get the current directory (project root)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"

# Check if the reconciliation script exists
if [ ! -f "$API_DIR/scripts/reconcileEmployees.ts" ]; then
    echo "❌ Error: Reconciliation script not found at $API_DIR/scripts/reconcileEmployees.ts"
    exit 1
fi

# Create a wrapper script for the cron job
cat > "$API_DIR/scripts/run-reconciliation.sh" << 'EOF'
#!/bin/bash

# Employee Reconciliation Cron Job Wrapper
# This script runs the employee reconciliation process

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/costaatt_hr"
export JWT_SECRET="your-super-secret-jwt-key-change-in-production"
export JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
export NODE_ENV="development"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Log file for cron job output
LOG_FILE="$PROJECT_ROOT/logs/reconciliation-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

# Change to the API directory
cd "$SCRIPT_DIR"

# Run the reconciliation script
echo "$(date): Starting employee reconciliation..." >> "$LOG_FILE"
npx ts-node reconcileEmployees.ts >> "$LOG_FILE" 2>&1

# Check if the script ran successfully
if [ $? -eq 0 ]; then
    echo "$(date): Employee reconciliation completed successfully" >> "$LOG_FILE"
else
    echo "$(date): Employee reconciliation failed" >> "$LOG_FILE"
fi

# Keep only the last 10 log files to prevent disk space issues
cd "$PROJECT_ROOT/logs"
ls -t reconciliation-*.log | tail -n +11 | xargs -r rm

echo "$(date): Cron job completed" >> "$LOG_FILE"
EOF

# Make the wrapper script executable
chmod +x "$API_DIR/scripts/run-reconciliation.sh"

# Create the cron job entry
CRON_ENTRY="0 18 * * 5 $API_DIR/scripts/run-reconciliation.sh"

# Check if the cron job already exists
if crontab -l 2>/dev/null | grep -q "run-reconciliation.sh"; then
    echo "⚠️  Cron job already exists. Updating..."
    # Remove existing entry and add new one
    (crontab -l 2>/dev/null | grep -v "run-reconciliation.sh"; echo "$CRON_ENTRY") | crontab -
else
    echo "➕ Adding new cron job..."
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

echo "✅ Cron job setup completed!"
echo "📅 Schedule: Every Friday at 6:00 PM"
echo "📁 Logs will be saved to: $PROJECT_ROOT/logs/"
echo "🔧 Wrapper script: $API_DIR/scripts/run-reconciliation.sh"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e (then delete the line)"
echo "To test the script manually: $API_DIR/scripts/run-reconciliation.sh"
