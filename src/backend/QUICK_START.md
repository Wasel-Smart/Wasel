# 🚀 Quick Start Guide - Running Wasel Backend

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ npm or yarn installed
- ✅ All API keys rotated (new keys after exposure)

---

## Option 1: Quick Start (Recommended)

### Windows Users:

1. **Open Command Prompt in backend folder:**
   ```
   cd C:\Users\user\OneDrive\Desktop\Wasel 14 new.worktrees\Wasel\src\backend
   ```

2. **Double-click `START_SERVER.bat`**
   - This will automatically install dependencies and start the server

### Mac/Linux Users:

```bash
cd src/backend
chmod +x start-server.sh
./start-server.sh
```

---

## Option 2: Manual Start

### Step 1: Navigate to Backend Folder

```bash
cd "C:\Users\user\OneDrive\Desktop\Wasel 14 new.worktrees\Wasel\src\backend"
```

### Step 2: Install Dependencies

```bash
npm install
```

Expected output:
```
added 150 packages in 30s
```

### Step 3: Update Environment Variables

**IMPORTANT:** Make sure you've rotated all exposed API keys first!

Check your `.env` file has these variables (with NEW values):
```bash
# Server
PORT=3002
NODE_ENV=development

# Supabase (use new keys after rotation)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_new_anon_key

# Google Maps (use new key after rotation)
GOOGLE_MAPS_API_KEY=your_new_google_key

# Stripe (use new keys after rotation)
STRIPE_SECRET_KEY=sk_test_your_new_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_new_key

# Twilio (use new keys after rotation)
TWILIO_ACCOUNT_SID=your_new_account_sid
TWILIO_AUTH_TOKEN=your_new_auth_token
TWILIO_VERIFY_SERVICE_SID=your_new_verify_sid
```

### Step 4: Start the Server

Choose one of these methods:

#### A. Development Mode (with auto-reload):
```bash
npm run dev
```

#### B. Simple Development Mode:
```bash
npm run dev:simple
```

#### C. Production Build:
```bash
npm run build
npm start
```

---

## Verify Server is Running

### 1. Check Server Output

You should see:
```
======================================================================
🚀 Wasel Backend Server - STARTED
======================================================================
📡 Server:      http://localhost:3002
🌍 Environment: development
⏰ Started:     2026-01-21T...
======================================================================
✅ Core Services:
   - Express API Server
   - WebSocket (Socket.IO)
   - Supabase Connection
======================================================================
```

### 2. Test Health Endpoint

Open a new terminal and run:
```bash
curl http://localhost:3002/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-21T...",
  "version": "1.0.0",
  "services": {
    "database": "up",
    "websocket": "up",
    "api": "up"
  }
}
```

### 3. Test in Browser

Open your browser and go to:
- http://localhost:3002
- http://localhost:3002/api/health
- http://localhost:3002/api/docs

---

## Common Issues & Solutions

### Issue 1: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: "Port 3002 is already in use"

**Solution:**
```bash
# Find and kill the process using port 3002
# Windows:
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3002
kill -9 <PID>

# Or use a different port:
PORT=3003 npm run dev
```

### Issue 3: "Supabase connection failed"

**Solution:**
```bash
# Check your .env file has correct values
# Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set
# Test connection:
curl https://your-project.supabase.co/rest/v1/
```

### Issue 4: TypeScript errors

**Solution:**
```bash
# Use the simple startup which skips build
npm run dev:simple
```

### Issue 5: "Missing API keys"

**Solution:**
Check that ALL these are in your `.env`:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- GOOGLE_MAPS_API_KEY
- STRIPE_SECRET_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN

---

## Testing the API

### 1. Test Phone Verification

```bash
curl -X POST http://localhost:3002/api/auth/verify/send \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\": \"+962777777777\", \"channel\": \"sms\"}"
```

### 2. Test Maps API

First, get a token from Supabase, then:

```bash
curl -X POST http://localhost:3002/api/maps/geocode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"address\": \"Amman, Jordan\"}"
```

### 3. Test WebSocket

Open browser console and run:
```javascript
const socket = io('http://localhost:3002');
socket.on('connect', () => console.log('Connected!'));
```

---

## Next Steps

After the server is running:

1. **Test all endpoints** using the `TESTING_GUIDE_COMPLETE.md`
2. **Check logs** for any errors or warnings
3. **Monitor health** at http://localhost:3002/api/health
4. **Start building** your frontend to connect to the API

---

## Development Workflow

### Recommended Setup:

**Terminal 1** (Backend):
```bash
cd src/backend
npm run dev
```

**Terminal 2** (Frontend - if separate):
```bash
cd src
npm run dev
```

**Terminal 3** (Logs/Testing):
```bash
# Run tests or monitor logs
tail -f backend.log
```

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

The server will gracefully shutdown:
```
SIGINT received, shutting down gracefully...
Server closed
```

---

## Production Deployment

Once everything works locally, follow the `DEPLOYMENT_GUIDE_COMPLETE.md` for production deployment.

---

## Getting Help

If you encounter issues:

1. **Check server logs** for error messages
2. **Verify environment variables** are all set correctly
3. **Test health endpoint** to see which service is failing
4. **Check the TESTING_GUIDE_COMPLETE.md** for specific tests
5. **Review error messages** carefully

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start simple server (skip build)
npm run dev:simple

# Build for production
npm run build

# Start production server
npm start

# Check health
curl http://localhost:3002/api/health

# View logs
tail -f server.log

# Stop server
Ctrl + C
```

---

**Ready to run!** 🎉

Your Wasel backend is now configured and ready to start. Follow the steps above and you'll be up and running in minutes.
