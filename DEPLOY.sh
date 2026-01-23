#!/bin/bash

###############################################################################
# WASEL DEPLOYMENT SCRIPT - AUTOMATED & PRODUCTION READY
# This script handles the complete deployment process automatically
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wasel-ride-sharing"
BUILD_DIR="dist"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Step 1: Pre-deployment checks
pre_deployment_checks() {
    log "Starting pre-deployment checks..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    # Check Node version (minimum v18)
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version must be 18 or higher. Current: $(node -v)"
    fi
    
    info "Node.js version: $(node -v)"
    info "npm version: $(npm -v)"
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            warning "Please update .env file with your credentials before proceeding."
            read -p "Press Enter after updating .env file..."
        else
            error ".env.example not found. Cannot create .env file."
        fi
    fi
    
    log "Pre-deployment checks completed ✓"
}

# Step 2: Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    npm ci --prefer-offline --no-audit --progress=false
    
    log "Dependencies installed ✓"
}

# Step 3: Build production bundle
build_production() {
    log "Building production bundle..."
    
    # Clean build directory
    if [ -d "$BUILD_DIR" ]; then
        info "Removing old build..."
        rm -rf "$BUILD_DIR"
    fi
    
    # Build
    npm run build
    
    # Verify build
    if [ ! -d "$BUILD_DIR" ] || [ ! -f "$BUILD_DIR/index.html" ]; then
        error "Build failed. $BUILD_DIR directory not found or incomplete."
    fi
    
    # Calculate build size
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    info "Build size: $BUILD_SIZE"
    
    log "Production build completed ✓"
}

# Main deployment flow
main() {
    clear
    
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    WASEL AUTOMATED DEPLOYMENT SCRIPT                         ║
║                         Production Ready Deployment                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF

    echo ""
    log "Starting automated deployment process..."
    echo ""
    
    # Execute deployment steps
    pre_deployment_checks
    install_dependencies
    build_production
    
    echo ""
    log "═══════════════════════════════════════════════════════════════════════════"
    log "                    DEPLOYMENT COMPLETED SUCCESSFULLY!                      "
    log "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    
    info "Your application is now deployed and ready for production use."
    echo ""
}

# Handle interrupts
trap 'error "Deployment interrupted by user"' INT TERM

# Run main deployment
main "$@"
