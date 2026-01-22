@echo off
REM =============================================================================
REM Wasel - Data Connect Setup Script
REM Initializes Firebase Data Connect for the project
REM =============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║           Firebase Data Connect - Setup Wizard                        ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Firebase CLI is installed
echo [1/4] Checking Firebase CLI...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI not found
    echo Installing globally...
    npm install -g firebase-tools
)
echo ✓ Firebase CLI found

REM Login to Firebase
echo.
echo [2/4] Firebase authentication...
firebase login

REM Initialize Data Connect
echo.
echo [3/4] Initializing Data Connect...
firebase init dataconnect

REM Install dependencies
echo.
echo [4/4] Installing dependencies...
npm install

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                  ✓ Setup Complete!                                    ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.
echo 📚 Next steps:
echo   1. Open VS Code Extensions: Ctrl+Shift+X
echo   2. Search: "Firebase Data Connect for VS Code"
echo   3. Install the extension
echo.
echo 🚀 To start developing:
echo   firebase emulators:start --only dataconnect
echo   npm run dev
echo.
echo 📖 See DATA_CONNECT_SETUP.md for detailed guides
echo.
pause
