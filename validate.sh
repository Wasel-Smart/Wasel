#!/bin/bash

echo "════════════════════════════════════════════════════"
echo "🔍 Wasel App - Pre-Flight Validation Check"
echo "════════════════════════════════════════════════════"
echo ""

ERRORS=0
WARNINGS=0

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✓ Node.js installed: $NODE_VERSION"
else
    echo "   ✗ Node.js not found!"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✓ npm installed: $NPM_VERSION"
else
    echo "   ✗ npm not found!"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check if node_modules exists
echo "📂 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules folder exists"
else
    echo "   ⚠ node_modules folder missing"
    echo "   → Run: npm install"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check if .env exists
echo "⚙️  Checking environment..."
if [ -f ".env" ]; then
    echo "   ✓ .env file exists"
    
    # Check critical env vars
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "   ✓ VITE_SUPABASE_URL configured"
    else
        echo "   ⚠ VITE_SUPABASE_URL not set"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "   ✓ VITE_SUPABASE_ANON_KEY configured"
    else
        echo "   ⚠ VITE_SUPABASE_ANON_KEY not set"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ✗ .env file missing!"
    echo "   → Copy .env.example to .env"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check critical files
echo "📄 Checking critical files..."
FILES=(
    "src/main.tsx"
    "src/App.tsx"
    "src/index.css"
    "tailwind.config.js"
    "vite.config.ts"
    "index.html"
    "src/utils/supabase/client.ts"
    "src/utils/supabase/info.tsx"
    "src/theme/design-tokens.ts"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo "   ✓ $FILE"
    else
        echo "   ✗ $FILE missing!"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Check for import issues
echo "🔍 Checking import paths..."

# Check Supabase client import
if grep -q "from './info.tsx'" "src/utils/supabase/client.ts"; then
    echo "   ✓ Supabase client: import path correct"
else
    echo "   ✗ Supabase client: import path issue"
    ERRORS=$((ERRORS + 1))
fi

# Check Tailwind config import
if grep -q "from './src/theme/design-tokens.ts'" "tailwind.config.js"; then
    echo "   ✓ Tailwind config: import path correct"
else
    echo "   ✗ Tailwind config: import path issue"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check for Vite cache
echo "🗑️  Checking cache..."
if [ -d "node_modules/.vite" ]; then
    echo "   ⚠ Vite cache exists"
    echo "   → Consider clearing: rm -rf node_modules/.vite"
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✓ No stale cache"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════"
echo "📊 Summary"
echo "════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready to run."
    echo ""
    echo "Start the app with:"
    echo "  npm run dev"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found, but should work"
    echo ""
    echo "Start the app with:"
    echo "  npm run dev"
    echo ""
    exit 0
else
    echo "❌ $ERRORS error(s) found"
    if [ $WARNINGS -gt 0 ]; then
        echo "⚠️  $WARNINGS warning(s) found"
    fi
    echo ""
    echo "Fix the errors above before running the app."
    echo ""
    exit 1
fi
