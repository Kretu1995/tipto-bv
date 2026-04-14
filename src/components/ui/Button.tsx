'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
};

const variants = {
  primary: 'bg-gold text-white hover:bg-gold-hover shadow-lg shadow-gold/20 hover:shadow-gold/30',
  secondary: 'bg-charcoal text-white hover:bg-charcoal-light',
  ghost: 'bg-transparent text-charcoal hover:bg-gray-100',
  outline: 'bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium rounded-sm transition-all duration-300 cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
