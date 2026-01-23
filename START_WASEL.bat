@echo off
title Wasel App - Startup
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║                    🚀 WASEL APP LAUNCHER 🚀                  ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Starting Wasel development server...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [WARNING] node_modules not found!
    echo [ACTION] Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo [SOLUTION] Please run: npm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    if exist ".env.example" (
        echo [ACTION] Creating .env from .env.example...
        copy .env.example .env >nul
        echo [SUCCESS] .env file created!
    ) else (
        echo [ERROR] No .env.example found!
    )
    echo.
)

REM Clear Vite cache for fresh start
if exist "node_modules\.vite" (
    echo [INFO] Clearing Vite cache...
    rd /s /q "node_modules\.vite" 2>nul
    echo [SUCCESS] Cache cleared!
    echo.
)

echo ═══════════════════════════════════════════════════════════════
echo.
echo [INFO] Starting development server...
echo [INFO] The app will open automatically in your browser
echo [INFO] URL: http://localhost:3000
echo.
echo ✅ What to expect:
echo    • App loads (no white screen)
echo    • Landing page or Dashboard visible  
echo    • Favicon in browser tab
echo.
echo 📝 TODO: Add your Wasel logo
echo    Copy your logo PNG to: public\favicon.png
echo    Then refresh your browser (Ctrl+Shift+R)
echo.
echo ⌨️  Press Ctrl+C to stop the server
echo.
echo ═══════════════════════════════════════════════════════════════
echo.

REM Start the development server
call npm run dev

REM If npm run dev fails
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start development server!
    echo.
    echo [TROUBLESHOOTING]
    echo 1. Check if port 3000 is already in use
    echo 2. Verify Node.js is installed: node --version
    echo 3. Try: npm ci (clean install)
    echo 4. Check for errors above
    echo.
    echo [HELP] See FAVICON_AND_STARTUP_GUIDE.md for detailed help
    echo.
    pause
    exit /b 1
)
