#!/bin/bash

echo "🚀 Starting Jualin in Docker..."

# Determine which docker compose command to use
if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Error: Docker Compose is not installed!"
    exit 1
fi

echo "Using: $COMPOSE_CMD"

# Stop any running containers
$COMPOSE_CMD down

# Build and start containers
$COMPOSE_CMD up -d --build

echo ""
echo "✅ Services are starting!"
echo "👉 Frontend: http://localhost:3000"
echo "👉 Backend:  http://localhost:8000"
echo ""
echo "To stop: $COMPOSE_CMD down"
echo "To view logs: $COMPOSE_CMD logs -f"
