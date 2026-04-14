'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { PRODUCTS } from '@/lib/constants';
import { IMAGES } from '@/lib/images';

export default function ProductGrid() {
  const t = useTranslations('HomePage.products');

  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-off-white">
      <Container>
        <SectionHeader
          label={t('sectionLabel')}
          title={t('sectionTitle')}
          subtitle={t('sectionSubtitle')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.map((product, i) => {
            const img = IMAGES.products[product.key as keyof typeof IMAGES.products];
            return (
              <motion.div
                key={product.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link
                  href={`/${product.slug}`}
                  className="group block bg-white rounded-sm border border-gray-100 overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gold/20"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-2">
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
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
