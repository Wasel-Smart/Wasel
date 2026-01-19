#!/bin/bash

# Wassel Application Startup Script
echo "🚗 Starting Wassel Ride-Sharing Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys before running the app."
    echo "   Required: VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

# Start the development server
echo "🚀 Starting Wassel application..."
echo "📱 Open http://localhost:5173 in your browser"
echo "🛑 Press Ctrl+C to stop the server"

npm run dev