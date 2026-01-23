@echo off
echo ========================================
echo WASEL APP - DIAGNOSTIC CHECK
echo ========================================
echo.

echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    pause
    exit /b 1
) else (
    echo ✅ Node.js installed
    node --version
)
echo.

echo [2/6] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    echo ✅ npm installed
    npm --version
)
echo.

echo [3/6] Checking if node_modules exists...
if exist "node_modules\" (
    echo ✅ node_modules folder found
) else (
    echo ⚠️  node_modules not found
    echo    Running npm install...
    npm install
)
echo.

echo [4/6] Checking .env file...
if exist ".env" (
    echo ✅ .env file found
) else (
    echo ⚠️  .env file not found
    if exist ".env.example" (
        echo    Copying .env.example to .env...
        copy .env.example .env
    ) else (
        echo ❌ No .env.example found either!
    )
)
echo.

echo [5/6] Checking public folder and favicon...
if exist "public\" (
    echo ✅ public folder exists
    if exist "public\favicon.svg" (
        echo ✅ favicon.svg found (temporary favicon)
    ) else (
        echo ⚠️  favicon.svg not found (will be created)
    )
    if exist "public\favicon.png" (
        echo ✅ favicon.png found (your Wasel logo)
    ) else (
        echo ⚠️  favicon.png not found
        echo    📝 TODO: Add your Wasel logo as public\favicon.png
    )
) else (
    echo ❌ public folder not found!
)
echo.

echo [6/6] Checking port 3000 availability...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is already in use
    echo    You may need to stop the existing process or use a different port
) else (
    echo ✅ Port 3000 is available
)
echo.

echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo 📋 SUMMARY:
echo.
echo Next steps:
echo 1. If you haven't already, add your Wasel logo to public\favicon.png
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo For detailed instructions, see: FAVICON_AND_STARTUP_GUIDE.md
echo.
pause
