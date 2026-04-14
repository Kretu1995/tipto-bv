'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
};

export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' } : undefined}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white rounded-sm overflow-hidden shadow-sm',
        'border border-gray-100',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
