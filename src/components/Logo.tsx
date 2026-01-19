import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// BlaBlaCar-inspired sizing: optimized for navigation and headers
const sizeMap = {
  xs: 'h-7',   // 28px - Compact mobile headers
  sm: 'h-8',   // 32px - Standard mobile/desktop navigation (BlaBlaCar standard)
  md: 'h-10',  // 40px - Sidebar and prominent headers
  lg: 'h-12',  // 48px - Featured sections
  xl: 'h-16'   // 64px - Auth pages and hero sections
};

export function Logo({ size = 'sm', showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${sizeMap[size]} aspect-square bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-lg">W</span>
      </div>
      {showText && (
        <div className="flex flex-col justify-center">
          <h3 className="text-primary font-bold leading-none tracking-tight">Wassel</h3>
          <p className="text-[0.65em] text-muted-foreground font-medium leading-none tracking-widest mt-0.5">واصل</p>
        </div>
      )}
    </div>
  );
}
