#!/bin/bash
# Database setup script for LearnSphere

echo "🔧 Setting up LearnSphere Database..."
echo "===================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in backend directory"
    echo "Please create a .env file with DATABASE_URL"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma Client..."
npx prisma generate

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "✅ Database setup complete!"
echo "===================================="
echo "You can now start the backend with: npm start"
