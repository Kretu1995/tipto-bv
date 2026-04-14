import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
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

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] mt-16 lg:mt-20">
      <SimulatorWrapper />
    </div>
  );
}
