# 🚀 Quick Start - Run Wassel App

## Option 1: Windows (Double-click)
1. Double-click `start.bat`
2. Follow the prompts

## Option 2: Command Line

### Prerequisites
- Node.js 18+ installed
- npm installed

### Steps
```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your API keys (required)
# VITE_SUPABASE_PROJECT_ID=your_project_id
# VITE_SUPABASE_ANON_KEY=your_anon_key

# 4. Start the app
npm run dev
```

## Option 3: Demo Mode (No Setup Required)
```bash
# Run with mock data (no backend needed)
VITE_ENABLE_MOCK_AUTH=true npm run dev
```

## 📱 Access the App
- **URL**: http://localhost:5173
- **Mobile**: Use your computer's IP address (e.g., http://192.168.1.100:5173)

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Missing Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables
Make sure `.env` file contains:
```env
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🎯 What You'll See
1. **Landing Page** - Welcome screen with language toggle
2. **Authentication** - Sign up/Login forms
3. **Dashboard** - Main app interface
4. **Find Ride** - Search for available trips
5. **Offer Ride** - Create new trips
6. **Messages** - Real-time chat
7. **Profile** - User settings

## 🚗 Ready to Go!
The app is now running and ready for testing!