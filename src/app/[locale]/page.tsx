import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import TrustBar from '@/components/sections/TrustBar';
import ProductGrid from '@/components/sections/ProductGrid';
import CoreValues from '@/components/sections/CoreValues';
import StatsSection from '@/components/sections/StatsSection';
import SimulatorTeaser from '@/components/sections/SimulatorTeaser';
import EnergyEfficiency from '@/components/sections/EnergyEfficiency';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CtaSection from '@/components/sections/CtaSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage.hero' });
  return generatePageMetadata({
    title: `Tipto BV — ${t('title')}`,
    description: t('subtitle'),
    locale,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <TrustBar />
      <ProductGrid />
      <CoreValues />
      <StatsSection />
      <SimulatorTeaser />
      <EnergyEfficiency />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
