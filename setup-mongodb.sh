#!/bin/bash

# MongoDB Replica Set Setup Script for YMechanics

echo "🚀 Setting up MongoDB Replica Set..."

# Start MongoDB container
echo "📦 Starting MongoDB container..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to initialize..."
sleep 10

# Check replica set status
echo "✅ Checking replica set status..."
docker exec ymechanics-mongodb mongosh --eval "rs.status()" || echo "Replica set is initializing..."

echo ""
echo "✨ MongoDB Replica Set is ready!"
echo ""
echo "📝 Connection Details:"
echo "  - Host: localhost:27017"
echo "  - Username: admin"
echo "  - Password: password123"
echo "  - Replica Set: rs0"
echo ""
echo "🔗 Update your .env file with:"
echo 'DATABASE_URL="mongodb://admin:password123@localhost:27017/ymechanics?authSource=admin&replicaSet=rs0&retryWrites=true"'
echo ""
echo "🔄 Next steps:"
echo "  1. Update your .env file with the DATABASE_URL above"
echo "  2. Run: npx prisma generate"
echo "  3. Run: npm run dev"
