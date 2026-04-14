'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';

export default function ProcessTimeline() {
  const t = useTranslations('WerkwijzePage');
  const steps = [0, 1, 2, 3, 4, 5];

  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-off-white">
      <Container>
        <div className="max-w-3xl mx-auto">
          {steps.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative flex gap-6 pb-12 last:pb-0"
            >
              {/* Timeline line */}
              {i < steps.length - 1 && (
                <div className="absolute left-5 top-12 w-px h-[calc(100%-3rem)] bg-gray-200" />
              )}

              {/* Step number */}
              <div className="w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center shrink-0 font-bold text-sm z-10">
                {i + 1}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1.5">
                <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-2">
                  {t(`steps.${i}.title`)}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {t(`steps.${i}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
