#!/bin/bash

echo "🚀 Starting Jualin in Docker..."

# Detect environment (production vs local)
detect_environment() {
  # Check if we're on a VPS (common indicators)
  if [ -f /etc/nginx/nginx.conf ] || [ -d /etc/nginx/sites-available ]; then
    echo "production"
  elif [ -n "$PRODUCTION" ] && [ "$PRODUCTION" = "true" ]; then
    echo "production"
  else
    echo "local"
  fi
}

ENV_TYPE=$(detect_environment)
echo "🔍 Detected environment: $ENV_TYPE"

# Create or validate .env file
if [ ! -f .env ]; then
  echo "📝 Creating .env file from example..."
  
  if [ "$ENV_TYPE" = "production" ]; then
    # Production defaults
    cat > .env << 'EOF'
FRONTEND_PORT=3005
BACKEND_PORT=8005
NEXT_PUBLIC_API_URL=/api
EOF
    echo "✅ Created .env with PRODUCTION settings"
  else
    # Local development defaults
    cat > .env << 'EOF'
FRONTEND_PORT=3005
BACKEND_PORT=8005
NEXT_PUBLIC_API_URL=http://localhost:8005/api
EOF
    echo "✅ Created .env with LOCAL development settings"
  fi
else
  echo "📄 Loading configuration from .env..."
fi

# Load .env variables
set -a
source .env
set +a

# Validate and fix NEXT_PUBLIC_API_URL based on environment
validate_api_url() {
  local current_url="$NEXT_PUBLIC_API_URL"
  export API_URL_CHANGED="false"
  
  if [ "$ENV_TYPE" = "production" ]; then
    # Production should use relative path
    if [[ "$current_url" != "/api" ]]; then
      echo "⚠️  WARNING: NEXT_PUBLIC_API_URL is '$current_url'"
      echo "   For production, it should be '/api' (relative path)"
      echo "   Fixing automatically..."
      
      # Update .env file
      if grep -q "NEXT_PUBLIC_API_URL=" .env; then
        sed -i 's|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=/api|' .env
      else
        echo "NEXT_PUBLIC_API_URL=/api" >> .env
      fi
      
      # Reload
      export NEXT_PUBLIC_API_URL="/api"
      export API_URL_CHANGED="true"
      echo "✅ Fixed: NEXT_PUBLIC_API_URL=/api"
    else
      echo "✅ NEXT_PUBLIC_API_URL is correctly set for production: /api"
    fi
  else
    # Local should use localhost with port
    if [[ "$current_url" != http://localhost:* ]]; then
      echo "⚠️  WARNING: NEXT_PUBLIC_API_URL is '$current_url'"
      echo "   For local development, it should be 'http://localhost:8005/api'"
      echo "   Fixing automatically..."
      
      local backend_port=${BACKEND_PORT:-8005}
      
      # Update .env file
      if grep -q "NEXT_PUBLIC_API_URL=" .env; then
        sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://localhost:${backend_port}/api|" .env
      else
        echo "NEXT_PUBLIC_API_URL=http://localhost:${backend_port}/api" >> .env
      fi
      
      # Reload
      export NEXT_PUBLIC_API_URL="http://localhost:${backend_port}/api"
      export API_URL_CHANGED="true"
      echo "✅ Fixed: NEXT_PUBLIC_API_URL=http://localhost:${backend_port}/api"
    else
      echo "✅ NEXT_PUBLIC_API_URL is correctly set for local: $current_url"
    fi
  fi
}

# Run validation
validate_api_url

# Check for backend/.env
if [ ! -f backend/.env ]; then
  echo "⚠️  backend/.env not found! Creating from example..."
  cp backend/.env.example backend/.env
fi

# Ensure SQLite database file exists
if [ ! -f backend/database/database.sqlite ]; then
  echo "🗄️  Creating SQLite database file..."
  touch backend/database/database.sqlite
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

# Build and start containers (force rebuild frontend if env changed)
if [ -n "$API_URL_CHANGED" ] && [ "$API_URL_CHANGED" = "true" ]; then
  echo "🔨 Rebuilding frontend due to API URL change..."
  $COMPOSE_CMD build --no-cache frontend
  $COMPOSE_CMD up -d
else
  $COMPOSE_CMD up -d --build
fi

echo "🔧 Configuring Backend..."
# Generate key if missing
$COMPOSE_CMD exec -T backend php artisan key:generate
# Run migrations
$COMPOSE_CMD exec -T backend php artisan migrate --force

# Get effective ports (use defaults if env vars not set)
F_PORT=${FRONTEND_PORT:-3000}
B_PORT=${BACKEND_PORT:-8000}

echo ""
echo "✅ Services are running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Environment: $ENV_TYPE"
echo "🌐 API URL: $NEXT_PUBLIC_API_URL"
echo ""
if [ "$ENV_TYPE" = "production" ]; then
  echo "👉 Access via: https://jualin.yourin.my.id (or your domain)"
  echo "   Frontend: Port $F_PORT (via nginx)"
  echo "   Backend:  Port $B_PORT (via nginx /api)"
else
  echo "👉 Frontend: http://localhost:$F_PORT"
  echo "👉 Backend:  http://localhost:$B_PORT"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To stop: $COMPOSE_CMD down"
echo "To view logs: $COMPOSE_CMD logs -f"
echo "To rebuild frontend: $COMPOSE_CMD build --no-cache frontend"

