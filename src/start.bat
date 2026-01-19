@echo off
echo 🚗 Starting Wassel Ride-Sharing Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy .env.example .env
    echo 📝 Please edit .env file with your API keys before running the app.
    echo    Required: VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY
    pause
    exit /b 1
)

REM Start the development server
echo 🚀 Starting Wassel application...
echo 📱 Open http://localhost:5173 in your browser
echo 🛑 Press Ctrl+C to stop the server

npm run dev