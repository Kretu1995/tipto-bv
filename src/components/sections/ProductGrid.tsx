'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { PRODUCTS } from '@/lib/constants';

const productIcons: Record<string, React.ReactNode> = {
  balustrades: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" /></svg>,
  ramen: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="1" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="3" y1="12" x2="21" y2="12" /></svg>,
  deuren: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16M3 21h18M9 21v-4M15 12h.01" /></svg>,
  garagepoorten: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3 21V8l9-5 9 5v13M3 21h18M3 10h18M3 14h18M3 18h18" /></svg>,
  trappen: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M4 20h4v-4h4v-4h4V8h4V4" /></svg>,
  balkons: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M3 13h18v2H3zM5 13V8a7 7 0 0114 0v5M5 15v6M19 15v6M9 15v6M15 15v6" /></svg>,
};

export default function ProductGrid() {
  const t = useTranslations('HomePage.products');

  return (
    <section className="py-20 lg:py-28 bg-off-white">
      <Container>
        <SectionHeader
          label={t('sectionLabel')}
          title={t('sectionTitle')}
          subtitle={t('sectionSubtitle')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, i) => (
            <motion.div
              key={product.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={`/${product.slug}`}
                className="group block bg-white rounded-sm border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gold/20"
              >
                <div className="w-14 h-14 rounded-sm bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-white transition-all duration-300">
                  {productIcons[product.key]}
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-3">
                  {t(`${product.key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {t(`${product.key}.description`)}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-gold group-hover:gap-2 transition-all">
                  Meer info
                  <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
