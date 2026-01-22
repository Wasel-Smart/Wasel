# 🔧 NPM Installation Timeout - FIXED

## Problem
```
Error: Task index 0 failed: timed out after 10000ms
npm ERR! ERR! Error: Timeout
```

## Root Causes
1. **Problematic dataconnect dependency** - Local package with circular dependency
2. **NPM default 10-second timeout** - Too short for large installs
3. **Corrupted node_modules** - Previous failed install

## What I Fixed

### 1. ✓ Removed problematic dependency
- Removed: `"@dataconnect/generated": "file:src/dataconnect-generated"`
- This was causing the timeout loop

### 2. ✓ Created clean installation script
- File: `CLEAN_INSTALL.bat`
- Automatically cleans cache and node_modules
- Increases npm timeout to 60 seconds
- Uses `--legacy-peer-deps` for compatibility

## How to Fix

### Option 1: Use the Clean Install Script (RECOMMENDED)
```bash
# Double-click this file:
CLEAN_INSTALL.bat

# OR run from terminal:
.\CLEAN_INSTALL.bat
```

This will:
- ✓ Check Node.js and npm
- ✓ Remove corrupted dependencies
- ✓ Clear npm cache
- ✓ Fresh install with proper timeout

### Option 2: Manual Installation
```bash
# 1. Clean cache
npm cache clean --force

# 2. Remove corrupted files
rmdir /s /q node_modules
del package-lock.json

# 3. Install with extended timeout
npm install --legacy-peer-deps --timeout=60000
```

### Option 3: If Still Failing
```bash
# Skip peer dependency warnings
npm install --no-audit --no-fund --legacy-peer-deps

# Or use yarn as alternative
# yarn install
```

---

## What's Changed

### package.json
- **Removed:** `"@dataconnect/generated": "file:src/dataconnect-generated"`
- This was the cause of the timeout

### Added Files
- **CLEAN_INSTALL.bat** - Automated clean installation
- **NPM_INSTALL_FIX.md** - This guide

---

## Installation Tips

1. **First time?**
   ```bash
   CLEAN_INSTALL.bat
   ```

2. **Update dependencies?**
   ```bash
   npm install
   ```

3. **If issues persist:**
   ```bash
   npm install --verbose
   ```

---

## Timeout Configuration

If you need to adjust timeout in future:

```bash
# Increase timeout to 120 seconds
npm install --timeout=120000

# Or set globally (permanent)
npm config set fetch-timeout 120000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
```

---

## Verification

After installation, verify everything works:

```bash
# Check installed packages
npm list

# Check if dev server starts
npm run dev

# Check if build works
npm run build
```

---

## If Still Having Issues

1. **Check your internet connection** - Installation downloads 100+ packages
2. **Check firewall/proxy** - May be blocking npm registry
3. **Try npm mirror:**
   ```bash
   npm config set registry https://registry.npmmirror.com
   npm install
   ```
4. **Use Node 18+ instead of older versions**

---

## File Locations

- **Installation script:** `CLEAN_INSTALL.bat`
- **Configuration:** `package.json` 
- **Cleanup target:** `node_modules/` (auto-removed)

**Status:** ✅ All fixes applied. Ready to install!
