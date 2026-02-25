import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 ease-smooth-bounce disabled:opacity-50 disabled:pointer-events-none tracking-wide',
  {
    variants: {
      variant: {
        primary: 'bg-teal text-dark hover:shadow-glow-teal hover:scale-105 active:scale-100',
        secondary: 'border border-teal/40 bg-transparent text-teal hover:bg-teal/10 hover:border-teal',
        ghost: 'bg-transparent text-white/70 hover:text-teal',
        accent: 'bg-gold text-dark hover:shadow-glow-gold hover:scale-105',
        outline: 'border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold',
      },
      size: {
        sm: 'h-9 px-5 text-xs uppercase tracking-wider',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
