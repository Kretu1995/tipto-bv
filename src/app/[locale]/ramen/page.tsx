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
  const t = await getTranslations({ locale, namespace: 'RamenPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/ramen' });
}

export default async function RamenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'RamenPage' });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct(t('meta.title'), t('meta.description'), 'Windows')) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb([{ name: 'Home', url: SITE_URL }, { name: 'Ramen', url: `${SITE_URL}/ramen` }])) }} />
      <ProductPageTemplate
        namespace="RamenPage"
        materialKeys={['pvc', 'aluminum', 'wood']}
        materialImages={[IMAGES.materials.pvc, IMAGES.materials.aluminum, IMAGES.materials.wood]}
        featureKeys={['insulation', 'noise', 'security', 'energy', 'maintenance', 'custom']}
        breadcrumbLabel="Ramen"
      />
    </>
  );
}
