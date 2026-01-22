import React from 'react';
import { Car, MapPin, Clock, Star, Shield, MessageCircle, CreditCard, Users } from 'lucide-react';

/**
 * Figma Design System for Wasel
 * 
 * This component library implements the Wasel brand design system
 * with Figma-quality components and design tokens.
 */

// Design Tokens (Figma Variables)
export const designTokens = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      700: '#b91c1c',
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
  },
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  borderRadius: {
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      arabic: 'Cairo, Tajawal, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

// Figma-Style Card Component
export const FigmaCard: React.FC<{
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'ghost' | 'glass';
  padding?: keyof typeof designTokens.spacing;
  className?: string;
}> = ({ children, variant = 'elevated', padding = 'lg', className = '' }) => {
  const variants = {
    elevated: 'bg-white dark:bg-neutral-800 shadow-lg',
    outlined: 'bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700',
    ghost: 'bg-neutral-50 dark:bg-neutral-800/50',
    glass: 'bg-white/70 dark:bg-neutral-800/70 backdrop-blur-lg border border-white/20',
  };

  return (
    <div
      className={`rounded-xl ${variants[variant]} ${className}`}
      style={{ padding: designTokens.spacing[padding] }}
    >
      {children}
    </div>
  );
};

// Figma-Style Button Component
export const FigmaButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  disabled = false,
  className = '',
}) => {
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    danger: 'bg-error-500 hover:bg-error-600 text-white shadow-md hover:shadow-lg',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
};

// Figma-Style Icon Badge
export const FigmaIconBadge: React.FC<{
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ icon, color = 'primary', size = 'md', className = '' }) => {
  const colors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    error: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`rounded-xl flex items-center justify-center ${colors[color]} ${sizes[size]} ${className}`}>
      {icon}
    </div>
  );
};

// Figma-Style Stat Card
export const FigmaStatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'error';
}> = ({ label, value, icon, trend, color = 'primary' }) => {
  return (
    <FigmaCard variant="glass" padding="lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            {value}
          </p>
          {trend && (
            <p className={`text-sm font-medium ${trend.isPositive ? 'text-success-600' : 'text-error-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <FigmaIconBadge icon={icon} color={color} size="md" />
      </div>
    </FigmaCard>
  );
};

// Figma-Style Feature Card
export const FigmaFeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}> = ({ title, description, icon, onClick }) => {
  return (
    <FigmaCard
      variant="elevated"
      padding="lg"
      className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      <FigmaIconBadge icon={icon} color="primary" size="lg" className="mb-4" />
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
    </FigmaCard>
  );
};

// Figma-Style Input Field
export const FigmaInput: React.FC<{
  label?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  icon,
  error,
  fullWidth = false,
  className = '',
}) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-lg
            ${icon ? 'pl-10' : ''}
            bg-white dark:bg-neutral-800
            border-2 ${error ? 'border-error-500' : 'border-neutral-200 dark:border-neutral-700'}
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            text-neutral-900 dark:text-white
            placeholder:text-neutral-400
            transition-all duration-200
            outline-none
          `}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
};

// Figma-Style Badge
export const FigmaBadge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
    error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300',
    neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// Figma-Style Avatar
export const FigmaAvatar: React.FC<{
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  className?: string;
}> = ({ src, alt, fallback, size = 'md', status, className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-neutral-400',
    away: 'bg-warning-500',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-semibold`}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span className="text-neutral-600 dark:text-neutral-300">
            {fallback || alt?.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      {status && (
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-900 ${statusColors[status]}`} />
      )}
    </div>
  );
};

// Figma-Style Progress Bar
export const FigmaProgress: React.FC<{
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}> = ({ value, max = 100, color = 'primary', size = 'md', showLabel = false, className = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Progress
          </span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Figma-Style Skeleton Loader
export const FigmaSkeleton: React.FC<{
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
  className?: string;
}> = ({ variant = 'text', width = '100%', height, className = '' }) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const defaultHeight = {
    text: '1rem',
    circular: '2.5rem',
    rectangular: '8rem',
  };

  return (
    <div
      className={`animate-pulse bg-neutral-200 dark:bg-neutral-700 ${variants[variant]} ${className}`}
      style={{ width, height: height || defaultHeight[variant] }}
    />
  );
};

// Export all components
export default {
  Card: FigmaCard,
  Button: FigmaButton,
  IconBadge: FigmaIconBadge,
  StatCard: FigmaStatCard,
  FeatureCard: FigmaFeatureCard,
  Input: FigmaInput,
  Badge: FigmaBadge,
  Avatar: FigmaAvatar,
  Progress: FigmaProgress,
  Skeleton: FigmaSkeleton,
  designTokens,
};
