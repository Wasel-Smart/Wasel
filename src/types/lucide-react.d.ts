declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
  }
  
  export type LucideIcon = ComponentType<LucideProps>;
  
  export const AlertTriangle: LucideIcon;
  export const Shield: LucideIcon;
  export const Eye: LucideIcon;
  export const Ban: LucideIcon;
  
  // Export all other icons as LucideIcon type
  const lucideReact: {
    [key: string]: LucideIcon;
  };
  export = lucideReact;
}