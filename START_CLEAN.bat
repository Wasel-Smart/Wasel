@echo off
echo ===============================================
echo Wasel App - Starting with Clean Cache
echo ===============================================
echo.

echo [1/4] Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo     ✓ Cache cleared
) else (
    echo     ℹ No cache to clear
)
echo.

echo [2/4] Checking dependencies...
if not exist "node_modules" (
    echo     ! node_modules not found
    echo     Running npm install...
    call npm install
) else (
    echo     ✓ Dependencies OK
)
echo.

echo [3/4] Environment check...
if exist ".env" (
    echo     ✓ .env file found
) else (
    echo     ⚠ .env file not found
    echo     Creating from .env.example...
    copy .env.example .env
)
echo.

echo [4/4] Starting dev server...
echo ===============================================
echo.
echo App will open at: http://localhost:3000
echo.
echo IMPORTANT: Check browser console (F12) for:
echo   ✓ "Wasel App mounted successfully!"
echo   ✓ No red error messages
echo.
echo Press Ctrl+C to stop the server
echo ===============================================
echo.

call npm run dev

pause
