@echo off
REM =============================================================================
REM WASEL - Clean Installation Script
REM Fixes npm timeout and dataconnect issues
REM =============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║           WASEL - Clean Installation & Setup                          ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js not found
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

REM Check npm
echo [2/4] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm not found
    pause
    exit /b 1
)
echo ✓ npm found

REM Clean cache and old dependencies
echo.
echo [3/4] Cleaning cache and old dependencies...
echo Removing node_modules...
if exist node_modules (
    rmdir /s /q node_modules 2>nul
)
echo Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
)
echo Clearing npm cache...
call npm cache clean --force

echo ✓ Cleanup complete

REM Fresh install
echo.
echo [4/4] Installing dependencies (this may take a few minutes)...
echo.
call npm install --legacy-peer-deps --timeout=60000

if errorlevel 1 (
    echo.
    echo ❌ Installation failed
    echo Try running: npm install --no-audit --no-fund
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                     ✓ Installation Complete!                          ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Ready to start development!
echo.
echo Next steps:
echo   npm run dev          - Start development server
echo   npm run build        - Build for production
echo   npm run test         - Run tests
echo.
pause
