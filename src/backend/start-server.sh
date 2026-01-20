#!/bin/bash

echo "========================================"
echo "Wasel Backend - Startup Script (Unix)"
echo "========================================"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed!"
    exit 1
fi

echo "✓ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "[2/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies!"
    exit 1
fi
echo "✓ Dependencies installed"

# Check .env
echo ""
echo "[3/5] Checking environment variables..."
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please create .env file with required variables"
    exit 1
fi
echo "✓ Environment file found"

# Build TypeScript
echo ""
echo "[4/5] Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "⚠️  WARNING: TypeScript build had errors"
    echo "Trying to run with ts-node instead..."
    echo ""
    echo "[5/5] Starting development server..."
    npm run dev:simple
    exit 0
fi
echo "✓ Build successful"

# Start server
echo ""
echo "[5/5] Starting server..."
npm start

echo ""
echo "Server stopped."
