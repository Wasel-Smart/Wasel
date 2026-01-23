@echo off
title WASEL - ONE-CLICK FIX
color 0A
cls

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo            🚀 WASEL ONE-CLICK FIX 🚀
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   This will:
echo   ✅ Copy Wasel logo as favicon
echo   ✅ Verify localStorage fix
echo   ✅ Start development server
echo.
echo ════════════════════════════════════════════════════════════
echo.
pause

cls
echo.
echo [1/3] Copying favicon...
copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\favicon.png" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Favicon copied
) else (
    echo     ⚠️  Favicon may already exist
)

echo.
echo [2/3] Verifying fixes...
findstr /C:"getSavedLanguage" "src\contexts\LanguageContext.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ localStorage fix confirmed
) else (
    echo     ❌ Warning: localStorage fix not found
)

echo.
echo [3/3] Starting development server...
echo.
echo ════════════════════════════════════════════════════════════
echo   Server will start at: http://localhost:3000
echo   Press Ctrl+C to stop
echo ════════════════════════════════════════════════════════════
echo.

call npm run dev
