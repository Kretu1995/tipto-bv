import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { generatePageMetadata, jsonLdProduct, jsonLdBreadcrumb } from '@/lib/metadata';
import { SITE_URL } from '@/lib/constants';
import type { Metadata } from 'next';
import ProductPageTemplate from '@/components/sections/ProductPageTemplate';
import { IMAGES } from '@/lib/images';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'BalustradesPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/balustrades' });
}

export default async function BalustradesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'BalustradesPage' });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdProduct(t('meta.title'), t('meta.description'), 'Balustrades')),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumb([
            { name: 'Home', url: SITE_URL },
            { name: 'Balustrades', url: `${SITE_URL}/balustrades` },
          ])),
        }}
      />
      <ProductPageTemplate
        namespace="BalustradesPage"
        materialKeys={['inox', 'powderCoated', 'aluminum', 'glass']}
        materialImages={[IMAGES.materials.inox, IMAGES.materials.aluminum, IMAGES.materials.aluminum, IMAGES.materials.glass]}
        featureKeys={['safety', 'custom', 'durable', 'design', 'install', 'warranty']}
        breadcrumbLabel="Balustrades"
        showSimulatorCta
      />
    </>
  );
}
