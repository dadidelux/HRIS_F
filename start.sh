#!/bin/bash

echo "🚀 Starting HRIS Application..."
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "⚠️  Backend might not be ready yet"
fi

# Ask if user wants to seed database
read -p "📊 Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose exec backend python seed_data.py
fi

echo ""
echo "✨ HRIS Application is ready!"
echo "================================"
echo "🌐 Frontend:    http://localhost"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs:    http://localhost:8000/docs"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"
