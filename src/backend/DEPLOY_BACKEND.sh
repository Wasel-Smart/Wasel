#!/bin/bash

###############################################################################
# WASEL BACKEND DEPLOYMENT SCRIPT
# Automated production deployment for backend services
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Banner
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    WASEL BACKEND DEPLOYMENT SCRIPT                           ║
║                      Production Services Deployment                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF

echo ""

# Step 1: Environment checks
log "Checking environment..."

if [ ! -f ".env" ]; then
    error ".env file not found. Please create from .env.example"
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    error "Node.js not installed"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js version must be 18 or higher"
fi

info "Node.js version: $(node -v)"

log "Environment checks completed ✓"

# Step 2: Install dependencies
log "Installing dependencies..."

npm ci --prefer-offline --no-audit

log "Dependencies installed ✓"

# Step 3: TypeScript compilation
log "Compiling TypeScript..."

npm run build

if [ ! -d "dist" ]; then
    error "Build failed - dist directory not created"
fi

log "TypeScript compilation completed ✓"

# Step 4: Start services
log "Starting backend services..."

# Stop any existing processes
if pgrep -f "node dist/server.js" > /dev/null; then
    info "Stopping existing server..."
    pkill -f "node dist/server.js"
    sleep 2
fi

# Start server in production mode
if [ "$1" == "--daemon" ]; then
    info "Starting server as daemon..."
    nohup npm start > server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > server.pid
    info "Server started with PID: $SERVER_PID"
else
    info "Starting server..."
    npm start
fi

log "Backend services started ✓"

# Step 5: Health check
log "Performing health check..."

sleep 3

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    log "Health check passed ✓"
else
    error "Health check failed - server not responding"
fi

# Display status
echo ""
log "═══════════════════════════════════════════════════════════════════════════"
log "                    BACKEND DEPLOYMENT COMPLETED!                          "
log "═══════════════════════════════════════════════════════════════════════════"
echo ""

info "Backend API: http://localhost:3001"
info "Health check: http://localhost:3001/api/health"
info "Environment: ${NODE_ENV:-development}"
echo ""

log "Backend is ready for production use! 🚀"
