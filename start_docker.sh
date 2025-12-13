#!/bin/bash

echo "🚀 Starting Jualin in Docker..."

# Stop any running containers
docker-compose down

# Build and start containers
docker-compose up -d --build

echo ""
echo "✅ Services are starting!"
echo "👉 Frontend: http://localhost:3000"
echo "👉 Backend:  http://localhost:8000"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f"
