# ⚠️ DEPRECATED: FigmaDesignSystem.tsx

**Status:** This file is **DEPRECATED** and should not be used.

## Why Deprecated?

This file contained duplicate design tokens that conflicted with the official Wasel design system defined in:
- `src/theme/design-tokens.ts` (Single source of truth)
- `tailwind.config.js` (Tailwind integration)
- `src/styles/globals.css` (CSS variables)

## Migration Guide

### ❌ Don't Use:
```typescript
import { FigmaButton, designTokens } from './figma/FigmaDesignSystem';
```

### ✅ Use Instead:
```typescript
// Official UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Official design tokens
import { designTokens } from '@/theme/design-tokens';
```

## Official Wasel Brand Colors

- **Primary (Teal):** `#008080` - Use `bg-primary` in Tailwind
- **Secondary (Sage Green):** `#607D4B` - Use `bg-secondary`
- **Accent (Maroon):** `#880044` - Use `bg-accent`

## Component Mapping

| Old (FigmaDesignSystem) | New (Official UI) |
|------------------------|-------------------|
| `<FigmaButton>` | `<Button>` from `@/components/ui/button` |
| `<FigmaCard>` | `<Card>` from `@/components/ui/card` |
| `<FigmaInput>` | `<Input>` from `@/components/ui/input` |
| `<FigmaBadge>` | `<Badge>` from `@/components/ui/badge` |
| `<FigmaAvatar>` | `<Avatar>` from `@/components/ui/avatar` |
| `<FigmaProgress>` | `<Progress>` from `@/components/ui/progress` |

## What Happened?

This file was created during initial Figma design exploration but became outdated when the official Wasel design system was established with the 60-30-10 color rule (Teal, Sage Green, Maroon).

## For More Information

See the official design system documentation:
- [DESIGN_SYSTEM.md](../../../DESIGN_SYSTEM.md)
- [Design Tokens](../../theme/design-tokens.ts)
- [UI Components](../ui/)

---

**Last Updated:** January 2026  
**Migration Completed:** January 2026
