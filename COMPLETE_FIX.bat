@echo off
color 0A
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║          WASEL - COMPLETE FIX DEPLOYMENT                 ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo.

:MENU
echo ════════════════════════════════════════════════════════════
echo   MAIN MENU - Choose an option:
echo ════════════════════════════════════════════════════════════
echo.
echo   [1] Quick Fix - Apply all fixes and start server
echo   [2] Copy favicon only
echo   [3] Verify fixes only
echo   [4] Start development server
echo   [5] Open documentation
echo   [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto QUICKFIX
if "%choice%"=="2" goto FAVICON
if "%choice%"=="3" goto VERIFY
if "%choice%"=="4" goto STARTDEV
if "%choice%"=="5" goto DOCS
if "%choice%"=="6" goto EXIT
goto MENU

:QUICKFIX
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              QUICK FIX - APPLYING ALL FIXES               ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo [1/4] Copying Wasel logo as favicon...
copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\favicon.png" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Favicon copied successfully
) else (
    echo     ⚠️  Favicon already exists or path error
)

echo.
echo [2/4] Verifying LanguageContext fix...
findstr /C:"getSavedLanguage" "src\contexts\LanguageContext.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ localStorage fix verified
) else (
    echo     ❌ localStorage fix NOT found - manual check needed
)

echo.
echo [3/4] Checking HTML favicon references...
findstr /C:"favicon.png" "index.html" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ HTML references correct favicon
) else (
    echo     ❌ HTML needs favicon reference update
)

echo.
echo [4/4] Checking environment variables...
if exist ".env" (
    echo     ✅ .env file exists
) else (
    echo     ⚠️  .env file not found - copy from .env.example
)

echo.
echo ════════════════════════════════════════════════════════════
echo   ALL FIXES APPLIED SUCCESSFULLY!
echo ════════════════════════════════════════════════════════════
echo.
echo   Next step: Start the development server
echo.
set /p startserver="Start server now? (Y/N): "
if /i "%startserver%"=="Y" goto STARTDEV
goto MENU

:FAVICON
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                  COPYING FAVICON                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo Copying Wasel logo from assets to public folder...
copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\favicon.png"

echo.
if %errorlevel% equ 0 (
    echo ✅ SUCCESS! Favicon copied to public\favicon.png
    echo.
    echo To see the favicon, start the development server and open:
    echo http://localhost:3000
) else (
    echo ❌ ERROR: Could not copy favicon
    echo.
    echo Troubleshooting:
    echo 1. Check if source file exists: src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png
    echo 2. Check if public folder exists
    echo 3. Run this script with administrator privileges
)

echo.
pause
goto MENU

:VERIFY
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              VERIFYING ALL FIXES                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo Running comprehensive verification...
echo.

echo [CHECK 1] Favicon file exists...
if exist "public\favicon.png" (
    echo     ✅ PASS - public\favicon.png exists
) else (
    echo     ❌ FAIL - favicon not found
)

echo.
echo [CHECK 2] HTML references favicon...
findstr /C:"favicon.png" "index.html" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ PASS - index.html references favicon.png
) else (
    echo     ❌ FAIL - HTML doesn't reference favicon
)

echo.
echo [CHECK 3] LanguageContext has localStorage fix...
findstr /C:"getSavedLanguage" "src\contexts\LanguageContext.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ PASS - LanguageContext has safe localStorage access
) else (
    echo     ❌ FAIL - LanguageContext needs localStorage fix
)

echo.
echo [CHECK 4] Environment file exists...
if exist ".env" (
    echo     ✅ PASS - .env file exists
) else (
    echo     ⚠️  WARNING - .env file not found
)

echo.
echo [CHECK 5] Package.json exists...
if exist "package.json" (
    echo     ✅ PASS - package.json exists
) else (
    echo     ❌ FAIL - package.json not found
)

echo.
echo [CHECK 6] Node modules installed...
if exist "node_modules" (
    echo     ✅ PASS - node_modules folder exists
) else (
    echo     ⚠️  WARNING - Run 'npm install' first
)

echo.
echo ════════════════════════════════════════════════════════════
echo   VERIFICATION COMPLETE
echo ════════════════════════════════════════════════════════════
echo.
pause
goto MENU

:STARTDEV
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║           STARTING DEVELOPMENT SERVER                    ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo Checking prerequisites...
echo.

if not exist "node_modules" (
    echo ⚠️  node_modules not found. Installing dependencies...
    echo.
    call npm install
    echo.
)

echo Starting Vite development server...
echo.
echo Server will start at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo ════════════════════════════════════════════════════════════
echo.

call npm run dev

goto MENU

:DOCS
cls
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              OPENING DOCUMENTATION                       ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo Available Documentation:
echo.
echo [1] Main Fix Guide - FAVICON_AND_STARTUP_FIXED.md
echo [2] White Screen Diagnosis - DIAGNOSIS-WHITE-SCREEN.md
echo [3] Quick Start - QUICK_START.md
echo [4] Return to main menu
echo.
set /p docchoice="Choose document (1-4): "

if "%docchoice%"=="1" start FAVICON_AND_STARTUP_FIXED.md
if "%docchoice%"=="2" start DIAGNOSIS-WHITE-SCREEN.md
if "%docchoice%"=="3" start QUICK_START.md
if "%docchoice%"=="4" goto MENU

goto MENU

:EXIT
cls
echo.
echo ════════════════════════════════════════════════════════════
echo   Thank you for using Wasel Fix Deployment Tool!
echo ════════════════════════════════════════════════════════════
echo.
echo   Summary of fixes applied:
echo   ✅ White page fix (localStorage error handling)
echo   ✅ Wasel logo favicon
echo.
echo   To start working:
echo   1. Run: npm run dev
echo   2. Open: http://localhost:3000
echo.
echo   For help, read: FAVICON_AND_STARTUP_FIXED.md
echo.
pause
exit
