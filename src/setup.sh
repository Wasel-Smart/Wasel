#!/bin/bash

echo "🚗 Wassel - Environment Setup"
echo "=============================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install additional UI dependencies
echo ""
echo "🎨 Installing UI components..."
npm install @radix-ui/react-accordion@^1.1.2 \
           @radix-ui/react-alert-dialog@^1.0.5 \
           @radix-ui/react-avatar@^1.0.4 \
           @radix-ui/react-checkbox@^1.0.4 \
           @radix-ui/react-dialog@^1.0.5 \
           @radix-ui/react-dropdown-menu@^2.0.6 \
           @radix-ui/react-label@^2.0.2 \
           @radix-ui/react-popover@^1.0.7 \
           @radix-ui/react-progress@^1.0.3 \
           @radix-ui/react-radio-group@^1.1.3 \
           @radix-ui/react-select@^2.0.0 \
           @radix-ui/react-separator@^1.0.3 \
           @radix-ui/react-slider@^1.1.2 \
           @radix-ui/react-switch@^1.0.3 \
           @radix-ui/react-tabs@^1.0.4 \
           @radix-ui/react-toast@^1.1.5 \
           @radix-ui/react-tooltip@^1.0.7 \
           sonner@^1.4.0 \
           react-router-dom@^6.8.0 \
           date-fns@^2.30.0

# Install dev dependencies
echo ""
echo "🛠️  Installing development dependencies..."
npm install --save-dev tailwindcss-animate@^1.0.7 @types/node@^20.0.0

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:5173"
echo ""