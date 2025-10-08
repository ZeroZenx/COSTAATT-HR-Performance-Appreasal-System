#!/bin/bash

echo "🚀 Setting up COSTAATT HR Performance Gateway..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build shared package
echo "🔨 Building shared package..."
npm run build --workspace=@costaatt/shared

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
npm run db:migrate --workspace=@costaatt/api

# Seed database
echo "🌱 Seeding database..."
npm run db:seed --workspace=@costaatt/api

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
echo "🚀 Visit http://localhost:5173 to get started!"

