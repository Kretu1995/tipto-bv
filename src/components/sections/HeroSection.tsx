'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { IMAGES } from '@/lib/images';

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
      {/* Background photo */}
      <motion.div style={{ y: gridY }} className="absolute inset-0">
        <Image
          src={IMAGES.hero}
          alt={IMAGES.heroAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/95 via-charcoal-dark/85 to-charcoal-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/80 via-transparent to-charcoal-dark/40" />
      </motion.div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Vertical gold line left accent */}
      <div className="hidden lg:block absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      {/* Bottom gold gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <Container className="relative z-10">
        <motion.div style={{ y: textY, opacity }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-0 lg:pb-0">
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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-7xl font-bold text-white font-[family-name:var(--font-playfair)] leading-[1.1] tracking-tight mb-6"
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
              className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed max-w-xl mb-8"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Button href="/contact" size="md" className="sm:!px-7 sm:!py-3.5 sm:!text-base">
                {t('ctaPrimary')}
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Button href="/balustrades" variant="outline" size="md" className="sm:!px-7 sm:!py-3.5 sm:!text-base">
                {t('ctaSecondary')}
              </Button>
            </motion.div>
          </div>

          {/* Right side — project photo mosaic */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 hidden lg:block"
          >
            <div className="relative">
              {/* Photo grid — asymmetric mosaic */}
              <div className="grid grid-cols-2 gap-3">
                {/* Top left — tall */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="relative row-span-2 rounded-sm overflow-hidden aspect-[3/4]"
                >
                  <Image src="/images/1b.jpg" alt="Frameless glazen balustrade" fill className="object-cover" sizes="25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                </motion.div>
                {/* Top right — square */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="relative rounded-sm overflow-hidden aspect-square"
                >
                  <Image src="/images/11b.jpg" alt="Glazen trapbalustrade" fill className="object-cover" sizes="25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
                </motion.div>
                {/* Bottom right — landscape */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="relative rounded-sm overflow-hidden aspect-[4/3]"
                >
                  <Image src="/images/3.jpg" alt="Glazen balustrade dakterras" fill className="object-cover" sizes="25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
                </motion.div>
              </div>

              {/* Floating stat badge — top right */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-3 -right-3 px-4 py-2.5 bg-charcoal/90 border border-gold/20 rounded-lg backdrop-blur-md shadow-xl z-10"
              >
                <span className="text-gold font-bold text-lg">17+</span>
                <span className="text-gray-400 text-xs ml-1.5 block leading-none mt-0.5">jaar ervaring</span>
              </motion.div>

              {/* Floating stat badge — bottom left */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="absolute -bottom-3 -left-3 px-4 py-2.5 bg-charcoal/90 border border-gold/20 rounded-lg backdrop-blur-md shadow-xl z-10"
              >
                <span className="text-gold font-bold text-lg">1000+</span>
                <span className="text-gray-400 text-xs ml-1.5 block leading-none mt-0.5">projecten</span>
              </motion.div>

              {/* Gold accent border */}
              <div className="absolute -inset-2 border border-gold/10 rounded-sm pointer-events-none" />
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
