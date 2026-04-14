'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';

export default function TestimonialsSection() {
  const t = useTranslations('HomePage.testimonials');

  const items: { name: string; role: string; content: string }[] = [];
  for (let i = 0; i < 20; i++) {
    try {
      if (!t.has(`items.${i}.name`)) break;
      items.push({
        name: t(`items.${i}.name`),
        role: t(`items.${i}.role`),
        content: t(`items.${i}.content`),
      });
    } catch { break; }
  }

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  // Cards visible per breakpoint
  const perPage = { mobile: 1, desktop: 3 };
  const maxIndex = Math.max(0, items.length - perPage.desktop);

  const next = useCallback(() => {
    setDir(1);
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setDir(-1);
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const visibleDesktop = items.slice(index, index + perPage.desktop);
  // Pad if we're near the end
  if (visibleDesktop.length < perPage.desktop) {
    visibleDesktop.push(...items.slice(0, perPage.desktop - visibleDesktop.length));
  }

  const mobileIndex = index % items.length;

  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-charcoal overflow-hidden">
      <Container>
        <SectionHeader
          label={t('sectionLabel')}
          title={t('sectionTitle')}
          light
        />

        {/* Slider controls */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gray-600 hover:border-gold flex items-center justify-center text-gray-400 hover:text-gold transition-colors cursor-pointer"
            aria-label="Vorige"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 3l-5 5 5 5" /></svg>
          </button>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gray-600 hover:border-gold flex items-center justify-center text-gray-400 hover:text-gold transition-colors cursor-pointer"
            aria-label="Volgende"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3l5 5-5 5" /></svg>
          </button>
        </div>

        {/* Desktop slider: 3 cards */}
        <div className="hidden md:block">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="grid md:grid-cols-3 gap-6 lg:gap-8"
            >
              {visibleDesktop.map((item, i) => (
                <ReviewCard key={`${index}-${i}`} item={item} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile slider: 1 card */}
        <div className="md:hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileIndex}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ReviewCard item={items[mobileIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === index % items.length ? 'bg-gold w-6' : 'bg-gray-600 w-1.5 hover:bg-gray-500'
              }`}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ReviewCard({ item }: { item: { name: string; role: string; content: string } }) {
  return (
    <div className="bg-charcoal-light/50 border border-charcoal-light rounded-sm p-5 sm:p-6 lg:p-8 flex flex-col h-full">
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, j) => (
          <svg key={j} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-sm lg:text-base text-gray-300 leading-relaxed flex-1 mb-6">
        &ldquo;{item.content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-5 border-t border-charcoal-light">
        <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
          <span className="text-gold font-bold text-xs">{item.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div>
          <p className="text-white font-medium text-sm">{item.name}</p>
          <p className="text-gray-500 text-xs">{item.role}</p>
        </div>
      </div>
    </div>
  );
}
