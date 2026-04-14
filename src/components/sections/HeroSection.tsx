'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function HeroSection() {
  const t = useTranslations('HomePage.hero');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Split title to highlight material words in gold
  const titleWords = t('title').split(' ');
  const goldWords = ['Aluminium,', 'Aluminium', 'Glas', 'Glass', 'Verre', 'Szkle', 'Staal', 'Steel', 'Acier', 'Stali', '&'];

  return (
    <section ref={ref} className="relative min-h-[100svh] flex items-center overflow-hidden bg-charcoal-dark">
      {/* Animated grid background */}
      <motion.div
        style={{ y: gridY }}
        className="absolute inset-0 opacity-[0.04]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,.3) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </motion.div>

      {/* Floating accent shapes */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full bg-gold/[0.03] blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -1, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-gold/[0.02] blur-3xl"
      />

      {/* Vertical gold line left accent */}
      <div className="hidden lg:block absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      {/* Bottom gold gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <Container className="relative z-10">
        <motion.div style={{ y: textY, opacity }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center pt-24 pb-20 lg:pt-0 lg:pb-0">
          {/* Text block */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-gold/20 bg-gold/[0.06] text-gold text-xs font-semibold tracking-wider uppercase mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
                </span>
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-7xl font-bold text-white font-[family-name:var(--font-playfair)] leading-[1.05] tracking-tight mb-7"
            >
              {titleWords.map((word, i) => (
                <span key={i}>
                  {goldWords.some(gw => word.includes(gw)) ? (
                    <span className="bg-gradient-to-r from-gold via-gold-muted to-gold bg-clip-text text-transparent">{word}</span>
                  ) : (
                    word
                  )}
                  {' '}
                </span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mb-10"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button href="/contact" size="lg">
                {t('ctaPrimary')}
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Button href="/balustrades" variant="outline" size="lg">
                {t('ctaSecondary')}
              </Button>
            </motion.div>
          </div>

          {/* Right side — abstract 3D-ish visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Rotating outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-gold/10"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-6 rounded-full border border-dashed border-gold/[0.07]"
              />

              {/* Center glass-like element */}
              <div className="absolute inset-12 rounded-2xl bg-gradient-to-br from-gold/[0.08] to-transparent border border-gold/10 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gold/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                  </div>
                  <p className="text-gold/60 text-xs font-medium tracking-wider uppercase">3D Simulator</p>
                </div>
              </div>

              {/* Floating stat pills */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 right-4 px-4 py-2 bg-charcoal-light/80 border border-gold/10 rounded-lg backdrop-blur-sm"
              >
                <span className="text-gold font-bold text-sm">17+</span>
                <span className="text-gray-500 text-xs ml-1">jaar</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-4 -left-4 px-4 py-2 bg-charcoal-light/80 border border-gold/10 rounded-lg backdrop-blur-sm"
              >
                <span className="text-gold font-bold text-sm">1000+</span>
                <span className="text-gray-500 text-xs ml-1">projecten</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-1/2 -right-6 px-4 py-2 bg-charcoal-light/80 border border-gold/10 rounded-lg backdrop-blur-sm"
              >
                <span className="text-gold font-bold text-sm">98%</span>
                <span className="text-gray-500 text-xs ml-1">tevreden</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 border border-gray-600 rounded-full flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 bg-gold rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
