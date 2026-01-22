# 🔧 FIREBASE INITIALIZATION - TROUBLESHOOTING GUIDE

## Issue: HTTP Error 429 - Quota Exceeded

```
Error: Request to https://serviceusage.googleapis.com/v1/projects/laith-nassar/services/developerconnect.googleapis.com: 
enable had HTTP Error: 429, Quota exceeded for quota metric 'Mutate requests' and limit 'Mutate requests per minute'
```

### Root Cause
The Firebase project "laith-nassar" has exceeded its quota for API mutations (service enablement requests).

---

## SOLUTIONS

### Option 1: Wait and Retry (Fastest)
The quota resets every minute. Simply wait 1-2 minutes and try again:

```bash
# Wait 2 minutes, then retry
firebase init
```

**Time Required:** 2 minutes

---

### Option 2: Use a Different Firebase Project (Recommended)

If quota issues persist, create a new Firebase project:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Click "Create Project" or "Add Project"

2. **Create New Project**
   - Project Name: `wasel-app` (or similar)
   - Accept defaults
   - Create project

3. **Update Your `.firebaserc`**
   ```json
   {
     "projects": {
       "default": "wasel-app"
     }
   }
   ```

4. **Run Firebase Init Again**
   ```bash
   firebase init
   ```

---

### Option 3: Skip Firebase for Now

If you don't need Firebase Hosting, initialize with just specific features:

```bash
# Initialize Firestore only (skip Hosting which triggers API calls)
firebase init firestore

# Or use interactive mode and deselect Hosting
firebase init --no-import
```

---

## Quick Fix Steps

### Step 1: Check Current Firebase Project
```bash
firebase projects:list
firebase use --add
```

### Step 2: If Using `laith-nassar` Project
```bash
# Option A: Wait and retry
timeout 120  # Wait 2 minutes
firebase init

# Option B: Switch project
firebase use --add
# Select or create new project
```

### Step 3: Proceed with Initialization
```bash
firebase init

# Select features:
# ✓ Authentication
# ✓ Firestore Database  
# ✓ Cloud Storage
# ✓ Hosting (optional - this causes the quota issue)
```

---

## For Wasel Application

Since you're using Supabase as your main backend, you only need Firebase for:
- **Push Notifications** (optional)

### Minimal Firebase Setup
```bash
# Initialize with just basic setup
firebase init

# Skip App Hosting - select only:
# - Authentication (optional)
# - Cloud Messaging (for notifications)
```

---

## Environment Variable Update

Once Firebase init completes, update your `.env`:

```env
# Get these from Firebase Console > Project Settings > General
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>

# For web push notifications, generate this from:
# Firebase Console > Cloud Messaging > Web credentials
VITE_FIREBASE_VAPID_KEY=<your-vapid-key>
```

---

## Prevention Tips

1. **Don't re-initialize constantly** - Each `firebase init` makes API calls
2. **Use `--no-import` flag** - Skips heavy API operations:
   ```bash
   firebase init --no-import
   ```

3. **Check quota limits** - Google Cloud Console > APIs & Services > Quotas

---

## Alternative: Skip Firebase Init

If Firebase initialization keeps failing, you can manually set up Firebase:

1. Create Firebase project at: https://console.firebase.google.com
2. Get credentials from Project Settings > General
3. Add to `.env` manually
4. Use the Firebase Web SDK directly in your app

---

## Next Steps

Choose one approach:

```bash
# OPTION 1: Quick Retry (Wait 2 minutes first)
firebase init

# OPTION 2: Create New Project  
firebase login  # If needed
firebase init --no-import
# Follow prompts and create new project

# OPTION 3: Skip Firebase Setup (Use Supabase only)
# Just update .env with Supabase credentials and proceed
```

---

## Verification

After successful Firebase init:

```bash
# Check if .firebaserc was created
cat .firebaserc

# Check if firebase.json exists
ls -la firebase.json

# Verify Firebase CLI is working
firebase --version
```

---

**Recommended:** Try **Option 1** first (wait 2 minutes and retry). If it persists, use **Option 2** (new Firebase project).
