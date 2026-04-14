'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';

type ProductFeaturesProps = {
  sectionTitle: string;
  features: { label: string }[];
};

export default function ProductFeatures({ sectionTitle, features }: ProductFeaturesProps) {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <Container>
        <SectionHeader title={sectionTitle} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex items-center gap-3 p-4 rounded-sm bg-off-white border border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-charcoal">{feature.label}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
