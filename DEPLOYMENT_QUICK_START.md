# Wasel - Deployment Quick Start Guide

## 🚀 Fast Track to Production (30 minutes)

This guide will get your Wasel application deployed and live.

---

## ✅ Pre-Deployment Checklist

### Required Items
- [ ] Node.js v18+ installed
- [ ] npm installed
- [ ] Git configured
- [ ] Supabase account (free tier available)
- [ ] Vercel or Netlify account (free tier available)
- [ ] GitHub repository (for deployment)

### Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in Supabase credentials
- [ ] Fill in Firebase config (optional)
- [ ] Verify all credentials are correct

---

## 🔧 Local Development (10 minutes)

### 1. Install Dependencies
```bash
cd Wasel
npm install
```

### 2. Verify Installation
```bash
npm run lint
```

### 3. Start Development Server
```bash
npm run dev
```

Access the app at: `http://localhost:3000`

### 4. Test New Features
- Navigate to "Special Services" in sidebar
- Click "Elderly Care" → Test trip scheduling
- Click "Kids Activity" → Test route creation
- Try adding to home screen (PWA test)

---

## 📦 Build for Production (5 minutes)

### 1. Create Production Build
```bash
npm run build
```

This creates optimized bundle in `build/` folder

### 2. Test Production Build
```bash
npm run preview
```

Access the preview at: `http://localhost:4173`

### 3. Verify Service Worker
Open DevTools → Application → Service Workers  
Status should show: ✅ "Service Worker: Activated and running"

---

## 🌐 Deploy to Vercel (5 minutes)

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy --prod
```

### Option B: GitHub Integration

1. Push code to GitHub:
```bash
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your repository
5. Framework: Vite
6. Click "Deploy"

---

## 🌐 Deploy to Netlify (5 minutes)

### Option A: Using Netlify CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select repository
5. Build command: `npm run build`
6. Publish directory: `build`
7. Click "Deploy site"

---

## ✨ Post-Deployment Verification (5 minutes)

### 1. Test Live Application
- [ ] Visit your deployed URL
- [ ] Test login/signup
- [ ] Navigate to Elderly Care
- [ ] Navigate to Kids Activity
- [ ] Verify manifest.json loads

### 2. Test PWA Installation
**On Desktop (Chrome):**
- Click install button in address bar
- App installs to system
- Verify offline functionality works

**On Mobile (iOS):**
- Open in Safari
- Tap Share → Add to Home Screen
- Launch app from home screen

**On Mobile (Android):**
- Open in Chrome
- Tap install prompt
- App installs like native app

### 3. Verify Service Worker
Open DevTools → Application → Service Workers
- Should show active service worker
- Cache storage should have entries

### 4. Test Offline Mode
1. Open DevTools → Application
2. Check "Offline" checkbox
3. Refresh page
4. App should still be usable with cached data

### 5. Check Performance
Using Lighthouse (DevTools → Lighthouse):
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90
- [ ] PWA > 90

---

## 🔐 Security Checklist

### Before Going Live
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] Environment variables not exposed
- [ ] .env file not in git
- [ ] Supabase RLS policies configured
- [ ] API endpoints authenticated
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info

### After Going Live
- [ ] Monitor error tracking
- [ ] Check for security warnings
- [ ] Review access logs
- [ ] Verify backup strategy
- [ ] Test disaster recovery

---

## 📱 Mobile Testing

### iOS Testing
```bash
# Serve locally on network
npm run dev -- --host

# On iOS device in same network:
# Open Safari → http://YOUR_IP:3000
# Tap Share → Add to Home Screen
```

### Android Testing
```bash
# Same as iOS
npm run dev -- --host

# On Android:
# Open Chrome → http://YOUR_IP:3000
# Tap 3-dots → Install app
```

### Testing Checklist
- [ ] App installs on iOS
- [ ] App installs on Android
- [ ] Works in standalone mode
- [ ] Splash screen shows
- [ ] Push notifications work
- [ ] Offline features work
- [ ] Navigation works in fullscreen

---

## 🐛 Troubleshooting

### Service Worker Not Registering
```bash
# Clear browser cache
# Open DevTools → Application → Clear storage
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### PWA Install Not Showing
- Check HTTPS is enabled
- Verify manifest.json is valid
- Check browser supports PWA (Chrome 67+, Edge 79+)
- Clear browser data and try again

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails on Vercel
1. Check build logs in Vercel dashboard
2. Verify Node.js version: `node --version`
3. Check environment variables are set
4. Try: `npm run build` locally first

---

## 📊 Monitoring & Analytics

### Setup Error Tracking
```javascript
// Already integrated: Sentry or LogRocket
// Check src/services/errorTracker.ts
```

### Monitor Performance
- Use Vercel/Netlify analytics dashboard
- Check Core Web Vitals in Google Search Console
- Review Lighthouse scores monthly

### Track User Analytics
- Google Analytics integration ready
- PostHog integration ready
- Custom event tracking available

---

## 🎯 Next Steps

### Immediately After Deployment
1. [ ] Send launch email to beta users
2. [ ] Post on social media
3. [ ] Update marketing website link
4. [ ] Monitor for errors (first 24 hours)
5. [ ] Engage with user feedback

### First Week
1. [ ] Monitor app performance
2. [ ] Fix any reported bugs
3. [ ] Optimize based on user feedback
4. [ ] Plan next feature release

### First Month
1. [ ] Analyze user engagement
2. [ ] Implement new features
3. [ ] Optimize performance
4. [ ] Plan marketing campaign

---

## 📚 Documentation

### For Developers
- [Development Guide](./DEVELOPER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./BACKEND_SETUP_GUIDE.md)

### For Deployment
- [Vercel Deployment](https://vercel.com/docs)
- [Netlify Deployment](https://docs.netlify.com)
- [PWA Deployment](https://web.dev/pwa-checklist/)

### For Users
- [User Guide](./USER_GUIDE.md)
- [FAQ](./FAQ.md)
- [Support](./SUPPORT.md)

---

## 💬 Getting Help

### Common Issues
1. **Build fails**: Check Node version matches requirements
2. **Service Worker not working**: Clear browser cache
3. **Offline not working**: Check IndexedDB quota
4. **Performance issues**: Run Lighthouse audit

### Support Resources
- GitHub Issues: [Report bugs](https://github.com/wasel/issues)
- Documentation: [Full docs](./README.md)
- Community: [Discord Server](https://discord.gg/wasel)
- Email: support@wasel.app

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] Application loads without errors
- [ ] All pages accessible
- [ ] PWA install works on mobile
- [ ] Service Worker active
- [ ] Offline mode functional
- [ ] No console errors
- [ ] Performance scores > 90
- [ ] Security audit passed
- [ ] Database backup configured
- [ ] Error tracking active

---

## 🎉 Congratulations!

Your Wasel application is now live and serving users!

**Status: PRODUCTION DEPLOYED ✅**

---

### Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview | `npm run preview` |
| Type check | `npm run lint` |
| Test | `npm test` |
| Deploy to Vercel | `vercel deploy --prod` |
| Deploy to Netlify | `netlify deploy --prod` |

---

Last Updated: January 18, 2026  
Next Review: February 18, 2026
