import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import ProductHero from '@/components/sections/ProductHero';
import ContactContent from './ContactContent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ContactPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/contact' });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ContactPage' });

  return (
    <>
      <ProductHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: t('hero.badge') }]}
      />
      <ContactContent />
    </>
  );
}
