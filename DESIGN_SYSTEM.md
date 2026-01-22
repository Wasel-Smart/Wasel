# 🎨 Wasel Design System Documentation

## Overview

The Wasel Design System is a comprehensive set of design tokens, components, and guidelines that ensure visual consistency across the entire application. This system is built on three core brand colors following the **60-30-10 color rule**.

## Core Brand Colors

### Primary - Teal (60% usage)
- **Hex**: `#008080`
- **Usage**: Main CTAs, navigation, primary brand elements
- **Dark Mode**: `#00a6a6` (lighter variant)

### Secondary - Sage Green (30% usage)
- **Hex**: `#607D4B`
- **Usage**: Supporting buttons, section backgrounds, secondary UI
- **Dark Mode**: `#7a9b5e` (lighter variant)

### Accent - Maroon (10% usage)
- **Hex**: `#880044`
- **Usage**: Attention indicators, important badges, urgent notifications
- **Dark Mode**: `#a8005a` (lighter variant)

## Design Tokens

All design values are centralized in `src/theme/design-tokens.ts`. This file exports a comprehensive set of tokens:

```typescript
import { designTokens } from '@/theme/design-tokens';

// Access colors
const primaryColor = designTokens.colors.primary.DEFAULT;

// Access spacing
const largePadding = designTokens.spacing[6]; // 1.5rem

// Access typography
const headingSize = designTokens.typography.fontSize['2xl'];
```

## Usage Guidelines

### ✅ DO

```tsx
// Use design tokens via Tailwind classes
<button className="bg-primary text-primary-foreground">
  Book Ride
</button>

// Use semantic color names
<div className="bg-success text-success-foreground">
  Ride confirmed!
</div>

// Use spacing tokens
<div className="p-6 gap-4">
  <h1 className="text-2xl font-bold">Title</h1>
</div>
```

### ❌ DON'T

```tsx
// Don't use hardcoded hex colors
<button className="bg-[#008080]">Book Ride</button>

// Don't use inline styles for colors
<div style={{ backgroundColor: '#008080' }}>Content</div>

// Don't use random spacing values
<div className="p-[17px]">Content</div>
```

## Color Scale

Each color comes with a full scale (50-900):

```tsx
// Light backgrounds
<div className="bg-primary-50">...</div>

// Medium intensity
<div className="bg-primary-500">...</div>

// Dark backgrounds
<div className="bg-primary-900">...</div>
```

## Typography System

### Font Families
- **Sans**: `Inter, system-ui, sans-serif` (Default)
- **Arabic**: `Cairo, Tajawal, sans-serif`
- **Mono**: `ui-monospace, SFMono-Regular, Consolas`

### Font Sizes
```tsx
text-xs    // 12px - Labels, helper text
text-sm    // 14px - Small text
text-base  // 16px - Body text (default)
text-lg    // 18px - Emphasized body
text-xl    // 20px - Small headings
text-2xl   // 24px - Medium headings
text-3xl   // 30px - Large headings
text-4xl   // 36px - Page titles
text-5xl   // 48px - Hero text
```

### Font Weights
```tsx
font-normal    // 400 - Body text
font-medium    // 500 - Emphasized text
font-semibold  // 600 - Subheadings
font-bold      // 700 - Headings
```

## Spacing System

Based on 4px grid (0.25rem base unit):

```tsx
p-1   // 4px
p-2   // 8px
p-4   // 16px (base)
p-6   // 24px
p-8   // 32px
p-12  // 48px
p-16  // 64px
```

## Component Examples

### Buttons

```tsx
import { Button } from '@/components/ui/button';

// Primary button
<Button variant="default">Book Now</Button>

// Secondary button
<Button variant="secondary">Learn More</Button>

// Destructive button
<Button variant="destructive">Cancel Trip</Button>

// Ghost button
<Button variant="ghost">Skip</Button>
```

### Cards

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Upcoming Trip</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Dubai to Abu Dhabi</p>
  </CardContent>
</Card>
```

### Input Fields

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="pickup">Pickup Location</Label>
  <Input 
    id="pickup" 
    placeholder="Enter pickup location" 
  />
</div>
```

## Shadows

```tsx
// Subtle elevation
<div className="shadow-sm">Card</div>

// Medium elevation
<div className="shadow-md">Modal</div>

// High elevation
<div className="shadow-lg">Popover</div>

// Brand glow effect
<div className="shadow-primary-glow">Feature</div>
```

## Border Radius

```tsx
rounded-sm   // 4px - Small elements
rounded-md   // 8px - Input fields
rounded-lg   // 12px - Cards (default)
rounded-xl   // 16px - Large cards
rounded-2xl  // 24px - Hero sections
rounded-full // Fully rounded - Avatars, badges
```

## Animation

```tsx
// Duration
transition-fast    // 150ms
transition-normal  // 200ms
transition-slow    // 500ms

// Easing
ease-linear   // Linear
ease-in-out   // Smooth start and end
ease-out      // Smooth end
```

## Dark Mode

All components automatically support dark mode via the `.dark` class:

```tsx
// Light mode: white background
// Dark mode: dark blue background
<div className="bg-background text-foreground">
  Content adapts to theme
</div>
```

### Dark Mode Colors
- Primary: `#00a6a6` (lighter teal)
- Secondary: `#7a9b5e` (lighter sage)
- Accent: `#a8005a` (lighter maroon)
- Background: `#0f172a` (dark blue)
- Text: `#f8fafc` (almost white)

## Responsive Design

### Breakpoints
```tsx
sm:  // 640px  - Small tablets
md:  // 768px  - Tablets
lg:  // 1024px - Desktops
xl:  // 1280px - Large desktops
2xl: // 1536px - Extra large screens
```

### Usage
```tsx
<div className="
  p-4 
  md:p-6 
  lg:p-8 
  text-base 
  md:text-lg 
  lg:text-xl
">
  Responsive content
</div>
```

## Accessibility

### Color Contrast
All color combinations meet **WCAG AA** standards:
- Primary on white: 4.5:1 ratio ✅
- Secondary on white: 4.5:1 ratio ✅
- Accent on white: 8.7:1 ratio ✅

### Focus States
Always include visible focus states:
```tsx
<button className="
  focus:ring-2 
  focus:ring-primary 
  focus:ring-offset-2
">
  Accessible Button
</button>
```

## Best Practices

### 1. Always Use Design Tokens
```tsx
// ✅ Good
<div className="bg-primary text-primary-foreground">

// ❌ Bad
<div className="bg-[#008080] text-white">
```

### 2. Use Semantic Colors
```tsx
// ✅ Good
<Badge variant="success">Completed</Badge>
<Alert variant="error">Error occurred</Alert>

// ❌ Bad
<Badge className="bg-green-500">Completed</Badge>
<Alert className="bg-red-500">Error occurred</Alert>
```

### 3. Follow Spacing Consistency
```tsx
// ✅ Good
<div className="space-y-4">
  <div className="p-6">Card 1</div>
  <div className="p-6">Card 2</div>
</div>

// ❌ Bad
<div>
  <div className="p-[23px] mb-[17px]">Card 1</div>
  <div className="p-[25px]">Card 2</div>
</div>
```

### 4. Use Component Variants
```tsx
// ✅ Good
<Button variant="primary" size="lg">

// ❌ Bad
<button className="bg-primary text-white px-6 py-3 rounded-lg">
```

## Migration Guide

### Step 1: Replace Hardcoded Colors
```bash
# Find hardcoded colors
grep -r "#008080" src/

# Replace with tokens (use refactor script)
node scripts/refactor-design-system.js
```

### Step 2: Use Tailwind Classes
```tsx
// Before
style={{ backgroundColor: '#008080', padding: '16px' }}

// After
className="bg-primary p-4"
```

### Step 3: Update Component Props
```tsx
// Before
<CustomButton bgColor="#008080">Click</CustomButton>

// After
<Button variant="primary">Click</Button>
```

## Resources

- **Design Tokens**: `src/theme/design-tokens.ts`
- **Tailwind Config**: `tailwind.config.js`
- **CSS Variables**: `src/styles/globals.css`
- **UI Components**: `src/components/ui/`

## Support

For questions or issues:
1. Check this documentation
2. Review component examples in `/components/ui/`
3. Consult design tokens file
4. Ask the development team

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained by**: Wasel Engineering Team
