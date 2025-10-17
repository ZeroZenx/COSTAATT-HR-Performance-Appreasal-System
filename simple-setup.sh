#!/bin/bash

echo "🚀 Setting up COSTAATT HR Performance Gateway (Simplified)..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Check if we have the right structure
if [ ! -f "package.json" ]; then
    echo "❌ Not in the right directory. Please run this from the project root."
    exit 1
fi

echo "✅ Found project root"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Start Docker services (minimal)
echo "🐳 Starting essential Docker services..."
docker-compose up -d db minio mailhog

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 30

echo "🎉 Basic setup complete!"
echo ""
echo "📊 Services running:"
echo "  • Database: PostgreSQL on port 5432"
echo "  • MinIO: http://localhost:9000"
echo "  • MailHog: http://localhost:8025"
echo ""
echo "🔧 Next steps:"
echo "  1. The project structure needs to be completed"
echo "  2. We need to create the actual app directories"
echo "  3. Then install and start the development servers"
echo ""
echo "📁 Current structure:"
ls -la
