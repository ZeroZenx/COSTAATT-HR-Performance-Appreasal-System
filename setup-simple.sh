#!/bin/bash

echo "🚀 Setting up COSTAATT HR Performance Gateway (Simple Mode)..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Step 1: Install dependencies for each workspace separately
echo "📦 Installing dependencies for shared package..."
cd packages/shared
npm install
npm run build
cd "$SCRIPT_DIR"

echo "📦 Installing dependencies for API..."
cd apps/api
npm install
cd "$SCRIPT_DIR"

echo "📦 Installing dependencies for Web..."
cd apps/web
npm install
cd "$SCRIPT_DIR"

# Step 2: Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Step 3: Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 30

# Step 4: Run database migrations
echo "🗄️ Running database migrations..."
cd apps/api
npm run db:migrate
cd "$SCRIPT_DIR"

# Step 5: Seed database
echo "🌱 Seeding database..."
cd apps/api
npm run db:seed
cd "$SCRIPT_DIR"

echo "🎉 Setup complete!"
echo ""
echo "📊 Services running:"
echo "  • API: http://localhost:3000"
echo "  • Web App: http://localhost:5173"
echo "  • MinIO Console: http://localhost:9002"
echo "  • MailHog: http://localhost:8025"
echo ""
echo "🔑 Demo credentials:"
echo "  • Admin: admin@costaatt.edu.tt / P@ssw0rd!"
echo "  • Supervisor: john.doe@costaatt.edu.tt / password123"
echo "  • Employee: mike.johnson@costaatt.edu.tt / password123"
echo ""
echo "🚀 To start the development servers, run:"
echo "  Terminal 1: cd apps/api && npm run dev"
echo "  Terminal 2: cd apps/web && npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:5173"
