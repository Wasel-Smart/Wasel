@echo off
echo Installing Wassel dependencies...

echo.
echo [1/4] Installing Node.js dependencies...
call npm install

echo.
echo [2/4] Installing additional UI dependencies...
call npm install @radix-ui/react-accordion@^1.1.2
call npm install @radix-ui/react-alert-dialog@^1.0.5
call npm install @radix-ui/react-avatar@^1.0.4
call npm install @radix-ui/react-checkbox@^1.0.4
call npm install @radix-ui/react-dialog@^1.0.5
call npm install @radix-ui/react-dropdown-menu@^2.0.6
call npm install @radix-ui/react-label@^2.0.2
call npm install @radix-ui/react-popover@^1.0.7
call npm install @radix-ui/react-progress@^1.0.3
call npm install @radix-ui/react-radio-group@^1.1.3
call npm install @radix-ui/react-select@^2.0.0
call npm install @radix-ui/react-separator@^1.0.3
call npm install @radix-ui/react-slider@^1.1.2
call npm install @radix-ui/react-switch@^1.0.3
call npm install @radix-ui/react-tabs@^1.0.4
call npm install @radix-ui/react-toast@^1.1.5
call npm install @radix-ui/react-tooltip@^1.0.7
call npm install sonner@^1.4.0
call npm install react-router-dom@^6.8.0
call npm install date-fns@^2.30.0

echo.
echo [3/4] Installing development dependencies...
call npm install --save-dev tailwindcss-animate@^1.0.7
call npm install --save-dev @types/node@^20.0.0

echo.
echo [4/4] Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
)

echo.
echo ✅ Installation complete!
echo.
echo Next steps:
echo 1. Edit .env file with your API keys
echo 2. Run: npm run dev
echo 3. Open: http://localhost:5173
echo.
pause