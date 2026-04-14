'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';

export default function CtaSection() {
  const t = useTranslations('HomePage.cta');

  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-off-white relative overflow-hidden">
      {/* Decorative gold accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-3 sm:mb-4">
            {t('title')}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8">
            {t('subtitle')}
          </p>
          <Button href="/contact" size="lg">
            {t('button')}
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
