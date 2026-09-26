import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'botanical';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] cursor-pointer';

    const variants: Record<string, string> = {
      default:
        'bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/95',
      destructive:
        'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline:
        'border border-input bg-background shadow-sm hover:bg-muted hover:text-foreground',
      secondary:
        'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90',
      ghost:
        'hover:bg-muted/80 hover:text-foreground',
      link:
        'text-primary underline-offset-4 hover:underline min-h-0 p-0',
      botanical:
        'bg-[#0F766E] text-white shadow-md hover:bg-[#115E59] active:bg-[#0D5F56]',
    };

    const sizes: Record<string, string> = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3.5 text-xs min-h-[36px]',
      lg: 'h-12 rounded-2xl px-8 text-base min-h-[48px]',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
