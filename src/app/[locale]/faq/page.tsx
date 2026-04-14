import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata, jsonLdFAQ } from '@/lib/metadata';
import type { Metadata } from 'next';
import ProductHero from '@/components/sections/ProductHero';
import FaqPageContent from './FaqPageContent';
import CtaSection from '@/components/sections/CtaSection';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'FaqPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/faq' });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'FaqPage' });

  const faqItems: { question: string; answer: string }[] = [];
  for (let i = 0; i < 8; i++) {
    try {
      faqItems.push({
        question: t(`items.${i}.question`),
        answer: t(`items.${i}.answer`),
      });
    } catch { break; }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ(faqItems)) }}
      />
      <ProductHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
      />
      <FaqPageContent />
      <CtaSection />
    </>
  );
}
