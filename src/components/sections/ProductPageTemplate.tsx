'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import ProductHero from './ProductHero';
import MaterialShowcase from './MaterialShowcase';
import ProductFeatures from './ProductFeatures';
import FaqAccordion from './FaqAccordion';
import CtaSection from './CtaSection';

type MaterialKey = string;

type ProductPageTemplateProps = {
  namespace: string;
  materialKeys: MaterialKey[];
  featureKeys: string[];
  breadcrumbLabel: string;
  showSimulatorCta?: boolean;
};

export default function ProductPageTemplate({
  namespace,
  materialKeys,
  featureKeys,
  breadcrumbLabel,
  showSimulatorCta = false,
}: ProductPageTemplateProps) {
  const t = useTranslations(namespace);
  const common = useTranslations('Common');

  const materials = materialKeys.map((key) => ({
    title: t(`materials.${key}.title`),
    description: t(`materials.${key}.description`),
  }));

  const features = featureKeys.map((key) => ({
    label: t(`features.${key}`),
  }));

  const faqItems: { question: string; answer: string }[] = [];
  for (let i = 0; i < 10; i++) {
    if (!t.has(`faq.items.${i}.question`)) break;
    faqItems.push({
      question: t(`faq.items.${i}.question`),
      answer: t(`faq.items.${i}.answer`),
    });
  }

  return (
    <>
      <ProductHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: breadcrumbLabel },
        ]}
        ctaLabel={common('requestQuote')}
        ctaHref="/contact"
      />

      <MaterialShowcase
        sectionTitle={t('materials.title')}
        items={materials}
      />

      <ProductFeatures
        sectionTitle={t('features.title')}
        features={features}
      />

      {showSimulatorCta && <SimulatorCtaBlock />}

      {faqItems.length > 0 && (
        <FaqAccordion
          title={t('faq.title')}
          items={faqItems}
        />
      )}

      <CtaSection />
    </>
  );
}

function SimulatorCtaBlock() {
  const t = useTranslations('BalustradesPage.simulatorCta');
  return (
    <section className="py-16 lg:py-20 bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-playfair)] text-white mb-4">
          {t('title')}
        </h2>
        <p className="text-gray-400 mb-6">{t('subtitle')}</p>
        <Link
          href="/3d-simulator"
          className="inline-flex items-center px-6 py-3 bg-gold text-white rounded-sm font-medium hover:bg-gold-hover transition-colors"
        >
          {t('button')}
        </Link>
      </div>
    </section>
  );
}
