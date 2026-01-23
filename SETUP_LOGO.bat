@echo off
title WASEL - Logo Setup
color 0A
cls

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo            🌍 WASEL LOGO FAVICON SETUP 🌍
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   Your beautiful circular city logo will be set as:
echo   ✅ Browser tab favicon
echo   ✅ Bookmark icon
echo   ✅ Mobile app icon
echo.
echo ════════════════════════════════════════════════════════════
echo.

echo Please save your logo image as:
echo   public\wasel-logo.png
echo.
echo Then press any key to continue...
pause >nul

cls
echo.
echo Checking for logo file...
echo.

if exist "public\wasel-logo.png" (
    echo ✅ Logo found at: public\wasel-logo.png
    echo.
    echo Setting up favicon references...
    
    copy "public\wasel-logo.png" "public\favicon.png" >nul 2>&1
    
    if %errorlevel% equ 0 (
        echo ✅ Favicon created successfully!
        echo.
        echo Your Wasel circular city logo is now set as the favicon.
        echo.
        echo Next steps:
        echo 1. Run: npm run dev
        echo 2. Open: http://localhost:3000
        echo 3. Check browser tab for your logo
        echo.
    ) else (
        echo ❌ Error creating favicon
    )
) else if exist "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" (
    echo ✅ Found logo in assets folder
    echo.
    echo Copying logo to public folder...
    
    copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\favicon.png" >nul 2>&1
    copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\wasel-logo.png" >nul 2>&1
    
    if %errorlevel% equ 0 (
        echo ✅ Favicon created successfully!
        echo.
        echo Your Wasel circular city logo is now set as the favicon.
        echo.
        echo Next steps:
        echo 1. Run: npm run dev
        echo 2. Open: http://localhost:3000
        echo 3. Check browser tab for your beautiful circular logo
        echo.
    ) else (
        echo ❌ Error creating favicon
    )
) else (
    echo ❌ Logo not found!
    echo.
    echo Please save your circular city logo as one of these:
    echo   • public\wasel-logo.png  (recommended)
    echo   • src\assets\wasel-logo.png
    echo.
    echo Then run this script again.
)

echo.
echo ════════════════════════════════════════════════════════════
pause
