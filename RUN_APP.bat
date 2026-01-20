@echo off
REM =============================================================================
REM Wasel App - Development Server Startup Script
REM =============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                 WASEL APP - DEVELOPMENT SERVER                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found: 
node --version
echo.

REM Check if npm is installed
echo [2/5] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm is not installed
    pause
    exit /b 1
)
echo ✅ npm found: 
npm --version
echo.

REM Check if node_modules exists
echo [3/5] Checking dependencies...
if not exist "node_modules\" (
    echo ⚠️  node_modules not found, installing dependencies...
    echo This may take 2-3 minutes...
    call npm install
    if errorlevel 1 (
        echo ❌ ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)
echo.

REM Check if .env exists
echo [4/5] Checking environment configuration...
if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ⚠️  WARNING: Please review .env and update with your actual API keys
    echo Press any key to continue...
    pause
) else (
    echo ✅ Environment file exists
)
echo.

REM Clear Vite cache
echo [5/5] Preparing dev server...
if exist "node_modules\.vite\" (
    rmdir /s /q "node_modules\.vite" >nul 2>&1
)
echo ✅ Ready to start!
echo.

REM Start dev server
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║            Starting Development Server (http://localhost:3000)        ║
echo ║                  Press Ctrl+C to stop the server                      ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

npm run dev
