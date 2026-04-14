'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Link from 'next/link';

type ProductHeroProps = {
  badge: string;
  title: string;
  subtitle: string;
  breadcrumbs: { label: string; href?: string }[];
  ctaLabel?: string;
  ctaHref?: string;
};

export default function ProductHero({ badge, title, subtitle, breadcrumbs, ctaLabel, ctaHref }: ProductHeroProps) {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 bg-charcoal overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <Container className="relative z-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gold transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-gray-400">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-gold rounded-full" />
            {badge}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-playfair)] leading-tight mb-6">
            {title}
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-2xl">
            {subtitle}
          </p>

          {ctaLabel && ctaHref && (
            <Button href={ctaHref} size="lg">
              {ctaLabel}
            </Button>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
