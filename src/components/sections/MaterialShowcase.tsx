'use client';

import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';

type MaterialItem = {
  title: string;
  description: string;
};

type MaterialShowcaseProps = {
  sectionTitle: string;
  items: MaterialItem[];
};

const materialColors = [
  'from-gray-200 to-gray-300',
  'from-amber-100 to-amber-200',
  'from-blue-100 to-blue-200',
  'from-emerald-100 to-emerald-200',
];

export default function MaterialShowcase({ sectionTitle, items }: MaterialShowcaseProps) {
  return (
    <section className="py-20 lg:py-28 bg-off-white">
      <Container>
        <SectionHeader title={sectionTitle} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white rounded-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow"
            >
              {/* Material color swatch */}
              <div className={`h-32 bg-gradient-to-br ${materialColors[i % materialColors.length]} flex items-center justify-center`}>
                <div className="w-16 h-16 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072" />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
