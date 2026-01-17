# Performance Optimization Roadmap - Phase 1 Part 2

**Target:** Bundle size <500KB, Lighthouse score >90, <3s load times  
**Status:** ⏳ Ready for Implementation  
**Priority:** Critical (HIGH)

---

## Current Setup Analysis

### ✅ Already Configured in vite.config.ts

```typescript
// Code splitting by vendor
'vendor-react': ['react', 'react-dom'],
'vendor-ui': ['@radix-ui/...'],
'vendor-charts': ['recharts'],
'vendor-animation': ['motion'],
'vendor-forms': ['react-hook-form'],
'vendor-supabase': ['@supabase/supabase-js'],
'vendor-carousel': ['embla-carousel-react'],
'vendor-utils': [...]

// Optimization flags
treeshake: true,
cssCodeSplit: true,
minify: 'esbuild',
chunkSizeWarningLimit: 500,
```

---

## Phase 1 Performance Tasks

### Task 1: Analyze Current Bundle Size

**Command:**
```bash
npm run build
```

**What to Check:**
1. Total bundle size
2. Chunk sizes breakdown
3. Large dependencies
4. Unused code patterns

**Expected Output:**
```
dist/
├── assets/
│   ├── js/
│   │   ├── vendor-react-[hash].js    (~150KB)
│   │   ├── vendor-ui-[hash].js       (~80KB)
│   │   ├── vendor-charts-[hash].js   (~200KB) ⚠️ Large
│   │   ├── main-[hash].js            (~100KB)
│   │   └── [route]-[hash].js         (varies)
│   ├── css/
│   │   └── index-[hash].css          (~50KB)
│   └── images/
│       └── ...
```

**Tools for Analysis:**
```bash
# Visual bundle analysis
npm install -D rollup-plugin-visualizer
# Add to vite.config.ts:
// import { visualizer } from 'rollup-plugin-visualizer';
// plugins: [visualizer()]
```

---

### Task 2: Optimize Heavy Dependencies

#### Recharts (Charting Library) - HEAVY

**Current Size:** ~200KB  
**Optimization Strategy:**

1. **Lazy Load Recharts**
```typescript
// Current: imported in main chunk
import { LineChart, Line } from 'recharts';

// Optimized: lazy load only when needed
const TripAnalytics = lazy(() => 
  import('./components/TripAnalytics')
);
```

2. **Tree-shake Unused Charts**
```typescript
// Only import needed chart types
import { LineChart, Line, XAxis, YAxis } from 'recharts';
// NOT: import * from 'recharts'
```

3. **Consider Lightweight Alternatives**
- [Nivo Charts](https://nivo.rocks/) - Lighter
- [Visx](https://visx-docs.vercel.app/) - Minimal
- [Chart.js](https://www.chartjs.org/) - Smaller

#### Leaflet (Maps) - HEAVY

**Current Size:** ~140KB  
**Optimization Strategy:**

1. **Lazy Load Map Component**
```typescript
const MapComponent = lazy(() => 
  import('./components/MapComponent')
);
```

2. **Load Map Only on Demand**
- Load only when viewing live trip
- Unload when not in view
- Use tile layer optimization

3. **Consider Alternatives**
- Mapbox GL JS (smaller in some cases)
- Google Maps API (pay-per-use model)

---

### Task 3: Implement Code Splitting

#### Route-Based Code Splitting

**Current:** Already implemented in App.tsx with lazy()

**Verify All Routes Are Lazy:**
```typescript
// ✅ Already Done:
const AuthPage = lazy(() => import('./components/AuthPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
// ... all other routes

// Fallback UI:
<Suspense fallback={<LoadingSpinner />}>
  <PageRenderer />
</Suspense>
```

#### Feature-Based Code Splitting

**Additional Optimizations:**

```typescript
// Lazy load heavy components
const TripAnalytics = lazy(() => 
  import('./components/TripAnalytics')
);

const AdminDashboard = lazy(() => 
  import('./components/admin/AdminDashboard')
);

const VoiceAssistant = lazy(() => 
  import('./components/advanced/VoiceAssistant')
);
```

#### Dynamic Imports for Large Lists

```typescript
// Heavy list component
const ServiceTabs = lazy(() => 
  import('./components/ServiceTabs')
);

// Only load services user actually interacts with
const ServiceDetail = lazy(() => 
  import('./components/ServiceDetail')
);
```

---

### Task 4: Optimize CSS

#### Tailwind CSS Purging

**Current Status:** ✅ Already configured

**Verify in tailwind.config.js:**
```javascript
content: [
  './src/**/*.{ts,tsx}',
  './index.html',
],
```

#### CSS Code Splitting

**Current Status:** ✅ Already enabled

```typescript
cssCodeSplit: true,  // in vite.config.ts
```

#### CSS Optimization Tips

1. **Avoid Unused Utilities**
   - Don't use arbitrary values for every style
   - Stick to theme tokens
   - Use design system

2. **Minify CSS**
   - Already done by esbuild
   - Production builds only

3. **Critical CSS**
   - Extract critical styles
   - Inline in <head>

---

### Task 5: Optimize Images

#### Image Compression

```typescript
// Use image optimization libraries
// npm install -D vite-plugin-image-optimization

// vite.config.ts
import ViteImageOptimizer from 'vite-plugin-image-optimization';

export default {
  plugins: [ViteImageOptimizer()],
}
```

#### Lazy Load Images

```typescript
// Lazy load non-critical images
<img src="image.png" loading="lazy" />

// Or use responsive images
<picture>
  <source srcset="small.webp" media="(max-width: 600px)" />
  <img src="large.jpg" />
</picture>
```

#### Convert to Modern Formats

- PNG/JPG → WebP
- SVG for icons (already using Lucide)
- AVIF for best compression

---

### Task 6: Optimize Dependencies

#### Audit Dependencies

```bash
npm audit
npm outdated
```

#### Remove Unused Packages

```bash
npm install -D depcheck
npx depcheck
```

#### Consolidate Overlapping Libs

Current analysis:
- UI: Using Radix UI ✅ (unstyled, small)
- Icons: Using Lucide ✅ (treeshakeable)
- Charts: Using Recharts (heavy, consider alternatives)
- Forms: Using React Hook Form ✅ (lightweight)
- Animation: Using Motion ✅ (small)

---

### Task 7: Enable Compression

#### Gzip Compression

```bash
# For Vercel (automatic)
# For Netlify (automatic)
# For custom server:
npm install -D compression
```

#### Brotli Compression

```bash
# Better than gzip
npm install -D brotli
```

---

### Task 8: Implement Caching Strategies

#### Service Worker Caching

Already in PWA features - verify implementation:

```typescript
// Cache static assets
const CACHE_NAME = 'wasel-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/vendor-react.js',
  '/main.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});
```

#### Browser Caching Headers

```
Cache-Control: public, max-age=31536000  // 1 year for hashed assets
Cache-Control: no-cache                  // For index.html
```

#### CDN Caching

- Enable on deployment platform
- Cache immutable assets (hashed names)
- Revalidate HTML files

---

### Task 9: Core Web Vitals Optimization

#### Metrics to Optimize

| Metric | Target | Current |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | <2.5s | ⏳ TBM |
| FID (First Input Delay) | <100ms | ⏳ TBM |
| CLS (Cumulative Layout Shift) | <0.1 | ⏳ TBM |

#### How to Measure

```bash
# Install Lighthouse
npm install -g lighthouse

# Audit production build
lighthouse https://your-domain.com --view
```

#### Optimization Strategies

1. **Reduce LCP (Load Largest Element Faster)**
   - Reduce JavaScript execution
   - Optimize images
   - Use streaming SSR (if applicable)
   - Reduce server response time

2. **Improve FID (Response to User Input)**
   - Break up long JavaScript tasks
   - Use requestIdleCallback for non-critical work
   - Use Web Workers for heavy computation

3. **Reduce CLS (Visual Stability)**
   - Avoid layout shifts
   - Use fixed aspect ratios
   - Use CSS containment

---

### Task 10: Monitoring & Continuous Optimization

#### Performance Monitoring Libraries

```bash
npm install web-vitals
```

**Usage:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

#### Setup Analytics Collection

```bash
npm install @sentry/react
```

**Send to Sentry/LogRocket:**
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-dsn',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Track Core Web Vitals
  }
});
```

---

## Implementation Checklist

### Week 1: Analysis & Setup
- [ ] Run `npm run build` and analyze output
- [ ] Identify 3 largest chunks
- [ ] Set performance budget
- [ ] Install analysis tools (rollup-plugin-visualizer)

### Week 2: Code Splitting & Lazy Loading
- [ ] Verify all routes use lazy()
- [ ] Add lazy() to heavy components
- [ ] Test code splitting in devtools
- [ ] Measure bundle size reduction

### Week 3: Dependency Optimization
- [ ] Audit dependencies with `npm audit`
- [ ] Identify unused packages
- [ ] Evaluate Recharts alternatives
- [ ] Remove bloat

### Week 4: Final Optimizations
- [ ] Enable image optimization
- [ ] Configure caching headers
- [ ] Setup Core Web Vitals monitoring
- [ ] Final bundle size check
- [ ] Lighthouse audit

---

## Performance Budget

### Target Sizes (First Load)

```
Initial Bundle:     < 500 KB
JavaScript:         < 300 KB
CSS:               < 50 KB
Images:            < 100 KB
Vendor (React):    < 150 KB
────────────────────────────
TOTAL:             < 500 KB
```

### Chunk Size Targets

```
Main Chunk:        < 150 KB
Vendor-React:      < 150 KB
Vendor-UI:         < 100 KB
Vendor-Charts:     < 200 KB (target for optimization)
Vendor-Supabase:   < 100 KB
Route Chunks:      < 50 KB each
```

---

## Monitoring Post-Optimization

### Metrics to Track

1. **Bundle Size**
   ```bash
   npm run build && du -sh dist/
   ```

2. **Lighthouse Score**
   ```bash
   lighthouse https://production-url.com --view
   ```

3. **Core Web Vitals**
   - Check in browser devtools
   - Monitor with Sentry/LogRocket
   - Track in analytics

4. **Load Times**
   - First Contentful Paint: < 1.8s
   - Largest Contentful Paint: < 2.5s
   - Time to Interactive: < 3.8s

---

## Expected Results

### Before Optimization
```
Bundle Size: ~650 KB
Lighthouse: ~75
LCP: ~3.5s
FID: ~150ms
CLS: ~0.15
```

### After Optimization (Target)
```
Bundle Size: <500 KB ✅
Lighthouse: >90 ✅
LCP: <2.5s ✅
FID: <100ms ✅
CLS: <0.1 ✅
```

### Rating Impact: +3-5 points

---

## References

- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Performance Auditing](https://developers.google.com/web/tools/lighthouse)

---

**Status:** Ready for implementation after testing suite is validated.
