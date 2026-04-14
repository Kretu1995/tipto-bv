import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import ProductHero from '@/components/sections/ProductHero';
import SimulatorWrapper from '@/components/three/SimulatorWrapper';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SimulatorPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/3d-simulator' });
}

export default async function SimulatorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'SimulatorPage' });

  return (
    <>
      <ProductHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: '3D Simulator' },
        ]}
      />

      <section className="py-12 lg:py-16 bg-off-white">
        <Container>
          <SimulatorWrapper />
        </Container>
      </section>
    </>
  );
}
