# 🎨 Wasel Design System - Quick Reference Card

**Print this and keep it on your desk!** 📌

---

## 🎯 THE GOLDEN RULES

### ❌ NEVER DO:
```tsx
// ❌ Hardcoded hex colors
<div className="bg-[#008080]">

// ❌ Inline styles
<div style={{ backgroundColor: '#008080' }}>

// ❌ Random spacing
<div className="p-[17px]">

// ❌ Magic numbers
<div style={{ marginTop: 23 }}>
```

### ✅ ALWAYS DO:
```tsx
// ✅ Use design tokens
<div className="bg-primary">

// ✅ Use Tailwind classes
<div className="p-6 space-y-4">

// ✅ Use component variants
<Button variant="primary" size="lg">
```

---

## 🎨 BRAND COLORS (60-30-10 Rule)

```tsx
// PRIMARY (TEAL) - 60% usage
bg-primary          // #008080 - Main brand color
text-primary-foreground  // White text on primary
hover:bg-primary/90 // Hover state

// SECONDARY (SAGE GREEN) - 30% usage
bg-secondary        // #607D4B - Supporting color
text-secondary-foreground
hover:bg-secondary/80

// ACCENT (MAROON) - 10% usage
bg-accent           // #880044 - Attention grabber
text-accent-foreground
hover:bg-accent/90
```

**Use Cases:**
- **Primary:** CTAs, navigation, links
- **Secondary:** Section backgrounds, supporting buttons
- **Accent:** Urgent indicators, badges, important alerts

---

## 📐 SPACING SYSTEM (4px Grid)

```tsx
p-1   // 4px
p-2   // 8px
p-4   // 16px  ← BASE UNIT
p-6   // 24px
p-8   // 32px
p-12  // 48px
p-16  // 64px

// Use consistent gaps
space-y-4  // Vertical spacing
gap-6      // Grid/flex gap
```

**Pro Tip:** Stick to 4, 6, 8, 12, 16 for most layouts.

---

## ✍️ TYPOGRAPHY

```tsx
// SIZES
text-xs    // 12px - Labels
text-sm    // 14px - Small text
text-base  // 16px - Body (default)
text-lg    // 18px - Emphasized
text-xl    // 20px - Small headings
text-2xl   // 24px - Medium headings
text-3xl   // 30px - Large headings
text-4xl   // 36px - Page titles

// WEIGHTS
font-normal    // 400 - Body
font-medium    // 500 - Emphasized
font-semibold  // 600 - Subheadings
font-bold      // 700 - Headings
```

---

## 🔘 BORDER RADIUS

```tsx
rounded-sm   // 4px  - Small elements
rounded-md   // 8px  - Input fields
rounded-lg   // 12px - Cards (Wasel default)
rounded-xl   // 16px - Large cards
rounded-2xl  // 24px - Hero sections
rounded-full // Fully rounded - Avatars
```

---

## 💫 SHADOWS

```tsx
shadow-sm  // Subtle
shadow-md  // Medium (default)
shadow-lg  // High elevation
shadow-xl  // Very high

// Brand glows (special effects)
shadow-primary-glow
shadow-secondary-glow
shadow-accent-glow
```

---

## 🎭 COMPONENT VARIANTS

### Button
```tsx
<Button variant="default">    // Primary action
<Button variant="secondary">  // Supporting action
<Button variant="accent">     // Urgent action
<Button variant="outline">    // Low emphasis
<Button variant="ghost">      // Minimal
<Button variant="destructive">// Dangerous action
<Button variant="link">       // Text link style
```

### Badge
```tsx
<Badge variant="default">     // Primary
<Badge variant="secondary">   // Supporting
<Badge variant="destructive"> // Error/warning
<Badge variant="outline">     // Low emphasis
```

### Card
```tsx
<Card>                       // Default elevated
<Card className="border">    // Outlined
<Card className="glass">     // Glass morphism
```

---

## 🌙 DARK MODE

```tsx
// Automatic with theme classes
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"
className="border-gray-200 dark:border-gray-800"
```

**Dark Mode Colors:**
- Primary: `#00a6a6` (lighter teal)
- Secondary: `#7a9b5e` (lighter sage)
- Accent: `#a8005a` (lighter maroon)

---

## 📱 RESPONSIVE DESIGN

```tsx
// Mobile first approach
className="p-4 md:p-6 lg:p-8"
className="text-base md:text-lg lg:text-xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Breakpoints
sm:  640px   // Small tablets
md:  768px   // Tablets
lg:  1024px  // Desktops
xl:  1280px  // Large desktops
2xl: 1536px  // Extra large
```

---

## 🚫 COMMON MISTAKES

### Mistake 1: Using Arbitrary Values
```tsx
// ❌ BAD
<div className="p-[23px] bg-[#008080]">

// ✅ GOOD
<div className="p-6 bg-primary">
```

### Mistake 2: Inline Styles
```tsx
// ❌ BAD
<div style={{ padding: '16px', backgroundColor: '#008080' }}>

// ✅ GOOD
<div className="p-4 bg-primary">
```

### Mistake 3: Random Colors
```tsx
// ❌ BAD
<div className="bg-blue-500">  // Not in brand palette

// ✅ GOOD
<div className="bg-primary">   // Brand color
```

---

## ⚡ QUICK TIPS

1. **Use Components First**
   - Check `src/components/ui/` before creating custom
   - Prefer `<Button>` over styled `<button>`

2. **Leverage Variants**
   - Don't build from scratch, use existing variants
   - Example: `<Button variant="secondary" size="lg">`

3. **Semantic Color Names**
   - Use `bg-success` not `bg-green-500`
   - Use `bg-error` not `bg-red-500`

4. **Consistent Spacing**
   - Stick to the 4px grid (4, 8, 12, 16, 24, 32)
   - Use `space-y-*` for vertical stacks

5. **Dark Mode by Default**
   - Always add dark: variants
   - Test in both modes

---

## 📚 RESOURCES

- **Tokens:** `src/theme/design-tokens.ts`
- **Config:** `tailwind.config.js`
- **Components:** `src/components/ui/`
- **Docs:** `DESIGN_SYSTEM.md`
- **Full Report:** `DESIGN_SYSTEM_ENFORCEMENT_REPORT.md`

---

## 🆘 WHEN IN DOUBT

1. Check `design-tokens.ts` first
2. Look at similar components in `src/components/ui/`
3. Review `DESIGN_SYSTEM.md`
4. Ask yourself: "Is this in the design system?"

**Golden Rule:** If it's not in the design system, don't use it!

---

**Last Updated:** January 2026  
**Version:** 1.0.0  

🎨 **Design System = Your Superpower**  
Use it. Love it. Scale it. 🚀
