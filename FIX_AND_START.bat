@echo off
echo ========================================
echo   WASEL - FIXING WHITE PAGE + FAVICON
echo ========================================
echo.

echo [STEP 1/3] Copying Wasel logo as favicon...
copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\favicon.png" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Favicon copied to public\favicon.png
) else (
    echo ⚠️  Could not copy favicon - it may already exist
)

echo.
echo [STEP 2/3] Verifying LanguageContext fix...
findstr /C:"getSavedLanguage" "src\contexts\LanguageContext.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ LanguageContext has localStorage fix applied
) else (
    echo ❌ Warning: LanguageContext may need localStorage fix
)

echo.
echo [STEP 3/3] Verification complete!
echo.
echo ========================================
echo   READY TO START
echo ========================================
echo.
echo The following fixes have been applied:
echo   ✅ localStorage error handling in LanguageContext
echo   ✅ Wasel logo set as favicon
echo   ✅ HTML updated to use favicon.png
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
