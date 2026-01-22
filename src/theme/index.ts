/**
 * Wasel Design System
 * 
 * Centralized export for all design system utilities and tokens.
 * Import this file to access the complete design system.
 * 
 * @example
 * ```tsx
 * import { designTokens, cn, getColorWithOpacity } from '@/theme';
 * 
 * const MyComponent = () => (
 *   <div className={cn('p-4', 'bg-primary')}>
 *     <h1 style={{ color: designTokens.colors.primary.DEFAULT }}>
 *       Hello World
 *     </h1>
 *   </div>
 * );
 * ```
 */

export { 
  designTokens, 
  getColorWithOpacity,
  type DesignTokens 
} from './design-tokens';

// Re-export commonly used utilities
export { cn } from '@/lib/utils';

/**
 * Theme utilities and helpers
 */

/**
 * Get a responsive spacing value
 * @example getSpacing('md') // Returns '1rem'
 */
export function getSpacing(size: keyof typeof designTokens.spacing): string {
  return designTokens.spacing[size];
}

/**
 * Get a font size configuration
 * @example getFontSize('2xl') // Returns ['1.5rem', { lineHeight: '2rem' }]
 */
export function getFontSize(size: keyof typeof designTokens.typography.fontSize) {
  return designTokens.typography.fontSize[size];
}

/**
 * Get a shadow value
 * @example getShadow('lg') // Returns shadow string
 */
export function getShadow(size: keyof typeof designTokens.shadows): string {
  return designTokens.shadows[size];
}

/**
 * Get a border radius value
 * @example getBorderRadius('lg') // Returns '0.75rem'
 */
export function getBorderRadius(size: keyof typeof designTokens.borderRadius): string {
  return designTokens.borderRadius[size];
}

/**
 * Check if current theme is dark mode
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

/**
 * Get color based on current theme
 * @example getThemeColor('primary') // Returns correct color for current theme
 */
export function getThemeColor(
  color: keyof typeof designTokens.colors
): string {
  const dark = isDarkMode();
  
  if (dark && designTokens.darkColors[color]) {
    return designTokens.darkColors[color].DEFAULT || '';
  }
  
  const colorValue = designTokens.colors[color];
  if (typeof colorValue === 'string') {
    return colorValue;
  }
  
  return colorValue.DEFAULT || '';
}

/**
 * Design system metadata
 */
export const designSystemInfo = {
  version: '1.0.0',
  name: 'Wasel Design System',
  description: 'Official design system for Wasel ride-sharing platform',
  colors: {
    primary: {
      name: 'Teal',
      usage: '60% - Main brand color for CTAs and primary actions',
      hex: designTokens.colors.primary.DEFAULT,
    },
    secondary: {
      name: 'Sage Green',
      usage: '30% - Supporting color for backgrounds and secondary elements',
      hex: designTokens.colors.secondary.DEFAULT,
    },
    accent: {
      name: 'Maroon',
      usage: '10% - Attention color for highlights and important indicators',
      hex: designTokens.colors.accent.DEFAULT,
    },
  },
  principles: [
    '60-30-10 color rule for visual hierarchy',
    'Accessibility-first with WCAG AA compliance',
    'Mobile-first responsive design',
    'Dark mode support by default',
    'Performance-optimized with design tokens',
  ],
} as const;

// Import design tokens for utilities
import { designTokens } from './design-tokens';
