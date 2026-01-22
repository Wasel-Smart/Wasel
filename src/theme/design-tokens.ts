/**
 * Wasel Design System - Official Design Tokens
 * 
 * Single source of truth for all design values in the application.
 * Based on the Wasel brand identity with Teal, Sage Green, and Maroon
 * following the 60-30-10 color rule.
 * 
 * @see src/styles/globals.css for CSS variable mappings
 * @see tailwind.config.js for Tailwind integration
 */

export const designTokens = {
  /**
   * Color Palette - 60-30-10 Rule
   * Primary (Teal) = 60% usage
   * Secondary (Sage Green) = 30% usage
   * Accent (Maroon) = 10% usage
   */
  colors: {
    primary: {
      DEFAULT: '#008080',  // Teal - Main brand color
      foreground: '#ffffff',
      light: '#00a6a6',    // Dark mode variant
      dark: '#006666',
      50: '#f0f9f9',
      100: '#d9f0f0',
      200: '#b3e0e0',
      300: '#80d0d0',
      400: '#4dc0c0',
      500: '#008080',      // Base
      600: '#006666',
      700: '#004d4d',
      800: '#003333',
      900: '#001a1a',
    },
    secondary: {
      DEFAULT: '#607D4B',  // Sage Green - Supporting color
      foreground: '#ffffff',
      light: '#7a9b5e',    // Dark mode variant
      dark: '#4a6038',
      50: '#f4f6f0',
      100: '#e8ede0',
      200: '#d1dbc2',
      300: '#b5c99f',
      400: '#8ba66d',
      500: '#607D4B',      // Base
      600: '#4a6038',
      700: '#3d4f2e',
      800: '#2f3d24',
      900: '#1f291a',
    },
    accent: {
      DEFAULT: '#880044',  // Maroon - Attention/CTA
      foreground: '#ffffff',
      light: '#a8005a',    // Dark mode variant
      dark: '#660033',
      50: '#fef2f7',
      100: '#fce7f1',
      200: '#f9cfe3',
      300: '#f5a8cc',
      400: '#ee6da8',
      500: '#880044',      // Base
      600: '#660033',
      700: '#550029',
      800: '#440020',
      900: '#330018',
    },
    success: {
      DEFAULT: '#10B981',
      foreground: '#ffffff',
      50: '#f0fdf4',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      DEFAULT: '#F59E0B',
      foreground: '#ffffff',
      50: '#fffbeb',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    error: {
      DEFAULT: '#EF4444',
      foreground: '#ffffff',
      50: '#fef2f2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Semantic Colors
    background: '#ffffff',
    foreground: '#171717',
    card: '#ffffff',
    'card-foreground': '#171717',
    muted: '#f5f5f5',
    'muted-foreground': '#737373',
    border: 'rgba(0, 0, 0, 0.1)',
    input: 'transparent',
    'input-background': '#f9fafb',
    ring: '#008080',
  },

  /**
   * Dark Mode Color Overrides
   */
  darkColors: {
    primary: {
      DEFAULT: '#00a6a6',  // Lighter teal for dark mode
      foreground: '#ffffff',
    },
    secondary: {
      DEFAULT: '#7a9b5e',  // Lighter sage for dark mode
      foreground: '#ffffff',
    },
    accent: {
      DEFAULT: '#a8005a',  // Lighter maroon for dark mode
      foreground: '#ffffff',
    },
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    'card-foreground': '#f8fafc',
    muted: '#334155',
    'muted-foreground': '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
    input: 'rgba(255, 255, 255, 0.05)',
  },

  /**
   * Spacing System
   * Based on 4px grid (0.25rem base unit)
   */
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px (base)
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  /**
   * Typography System
   * Font families, sizes, weights, and line heights
   */
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      arabic: 'Cairo, Tajawal, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],   // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],           // 48px
      '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],        // 60px
      '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],         // 72px
      '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],           // 96px
      '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.02em' }],           // 128px
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * Border Radius System
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px (Wasel default)
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',   // Fully rounded
  },

  /**
   * Shadow System
   * Elevation-based shadows with brand color variants
   */
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    // Brand-colored shadows
    'primary-glow': '0 0 20px rgba(0, 128, 128, 0.3)',
    'secondary-glow': '0 0 20px rgba(96, 125, 75, 0.3)',
    'accent-glow': '0 0 20px rgba(136, 0, 68, 0.3)',
  },

  /**
   * Animation System
   * Durations and easing functions
   */
  animation: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '200ms',
      moderate: '300ms',
      slow: '500ms',
      slower: '700ms',
      slowest: '1000ms',
    },
    easings: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Z-Index System
   * Layering and stacking context
   */
  zIndex: {
    hide: '-1',
    base: '0',
    raised: '10',
    dropdown: '1000',
    sticky: '1100',
    overlay: '1200',
    modal: '1300',
    popover: '1400',
    tooltip: '1500',
    toast: '1600',
    max: '9999',
  },

  /**
   * Breakpoints for Responsive Design
   */
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Container Max Widths
   */
  containers: {
    xs: '20rem',   // 320px
    sm: '24rem',   // 384px
    md: '28rem',   // 448px
    lg: '32rem',   // 512px
    xl: '36rem',   // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    '5xl': '64rem', // 1024px
    '6xl': '72rem', // 1152px
    '7xl': '80rem', // 1280px
    full: '100%',
  },

  /**
   * Opacity Scale
   */
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
} as const;

/**
 * Type-safe access to design tokens
 */
export type DesignTokens = typeof designTokens;

/**
 * Helper function to get a color with opacity
 * @example getColorWithOpacity('primary', 50) // Returns primary color at 50% opacity
 */
export function getColorWithOpacity(
  color: keyof typeof designTokens.colors,
  opacity: keyof typeof designTokens.opacity
): string {
  const colorValue = designTokens.colors[color];
  const opacityValue = designTokens.opacity[opacity];
  
  if (typeof colorValue === 'string') {
    // Simple color value
    return `color-mix(in oklab, ${colorValue} ${opacityValue}, transparent)`;
  }
  
  return colorValue.DEFAULT || '';
}

/**
 * Export default for convenience
 */
export default designTokens;
