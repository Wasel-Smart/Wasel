@echo off
echo ========================================
echo Wasel Backend - Startup Script
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found: 
node --version

echo.
echo [2/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/5] Checking environment variables...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with required variables
    pause
    exit /b 1
)
echo ✓ Environment file found

echo.
echo [4/5] Building TypeScript...
call npm run build
if errorlevel 1 (
    echo WARNING: TypeScript build had errors
    echo Trying to run with ts-node instead...
    goto rundev
)
echo ✓ Build successful

echo.
echo [5/5] Starting server...
call npm start
goto end

:rundev
echo.
echo [5/5] Starting development server...
call npm run dev:simple

:end
echo.
echo Server stopped.
pause
