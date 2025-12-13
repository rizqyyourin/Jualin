#!/bin/bash

echo "🚀 Starting Jualin in Docker..."

# Load .env file if it exists to make variables available
if [ -f .env ]; then
  echo "📄 Loading configuration from .env..."
  # Use set -a to automatically export variables from the sourced file
  # This handles comments (#) correctly unlike the previous xargs method
  set -a
  source .env
  set +a
else
  echo "⚠️  No .env file found in root directory!"
  echo "   Using default ports (Frontend: 3000, Backend: 8000)."
  echo "   To change ports, create a .env file here."
fi

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

# Get effective ports (use defaults if env vars not set)
F_PORT=${FRONTEND_PORT:-3000}
B_PORT=${BACKEND_PORT:-8000}

echo ""
echo "✅ Services are starting!"
echo "👉 Frontend: http://localhost:$F_PORT"
echo "👉 Backend:  http://localhost:$B_PORT"
echo ""
echo "To stop: $COMPOSE_CMD down"
echo "To view logs: $COMPOSE_CMD logs -f"
