'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';

const stats = [
  { key: 'heatLoss', value: '35% → 10%', icon: '🔥' },
  { key: 'energySavings', value: '22-30%', icon: '⚡' },
  { key: 'epcImprovement', value: '20%', icon: '📊' },
  { key: 'noiseReduction', value: '40-50%', icon: '🔇' },
  { key: 'burglarResistance', value: '+60%', icon: '🔒' },
];

export default function EnergyEfficiency() {
  const t = useTranslations('HomePage.energy');

  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-white">
      <Container>
        <SectionHeader
          label={t('sectionLabel')}
          title={t('sectionTitle')}
          subtitle={t('sectionSubtitle')}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-center p-4 sm:p-6 rounded-sm bg-off-white border border-gray-100"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-xl sm:text-2xl font-bold text-gold font-[family-name:var(--font-playfair)] mb-2">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {t(stat.key as 'heatLoss' | 'energySavings' | 'epcImprovement' | 'noiseReduction' | 'burglarResistance')}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
