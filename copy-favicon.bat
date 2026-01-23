@echo off
echo Copying Wasel logo to public folder as favicon...

copy "src\assets\1ccf434105a811706fd618a3b652ae052ecf47e1.png" "public\favicon.png"

if %errorlevel% equ 0 (
    echo ✅ Favicon copied successfully!
) else (
    echo ❌ Error copying favicon
)

pause
