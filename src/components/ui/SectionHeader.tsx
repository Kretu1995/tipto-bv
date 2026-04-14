'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type SectionHeaderProps = {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
};

export default function SectionHeader({
  label,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={cn(
        'mb-8 sm:mb-12 lg:mb-16',
        align === 'center' && 'text-center mx-auto max-w-3xl',
        className
      )}
    >
      {label && (
        <span className={cn(
          'inline-block text-sm font-semibold tracking-widest uppercase mb-4',
          light ? 'text-gold-muted' : 'text-gold'
        )}>
          {label}
        </span>
      )}
      <h2 className={cn(
        'text-2xl sm:text-3xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] leading-tight',
        light ? 'text-white' : 'text-charcoal'
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl leading-relaxed',
          light ? 'text-gray-300' : 'text-gray-500'
        )}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
