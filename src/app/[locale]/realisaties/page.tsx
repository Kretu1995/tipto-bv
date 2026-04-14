import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import ProductHero from '@/components/sections/ProductHero';
import RealisatiesContent from './RealisatiesContent';
import CtaSection from '@/components/sections/CtaSection';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'RealisatiesPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/realisaties' });
}

export default async function RealisatiesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'RealisatiesPage' });

  return (
    <>
      <ProductHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: t('hero.badge') }]}
      />
      <RealisatiesContent />
      <CtaSection />
    </>
  );
}
