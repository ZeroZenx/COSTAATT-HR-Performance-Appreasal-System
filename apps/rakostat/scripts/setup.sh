#!/bin/bash

# Rakostat Setup Script
echo "🚀 Setting up Rakostat - COSTAATT Room Booking System"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 15+ first."
    exit 1
fi

echo "✅ PostgreSQL detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "📝 Created .env file. Please update it with your configuration."
fi

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd apps/api
npx prisma generate

# Setup database
echo "🗄️ Setting up database..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

cd ../..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "📝 Don't forget to:"
echo "   1. Update .env with your Azure AD configuration"
echo "   2. Configure your database connection"
echo "   3. Set up Microsoft 365 SSO"
