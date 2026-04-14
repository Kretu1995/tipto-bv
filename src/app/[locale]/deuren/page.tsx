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
  const t = await getTranslations({ locale, namespace: 'DeurenPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/deuren' });
}

export default async function DeurenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'DeurenPage' });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct(t('meta.title'), t('meta.description'), 'Doors')) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb([{ name: 'Home', url: SITE_URL }, { name: 'Deuren', url: `${SITE_URL}/deuren` }])) }} />
      <ProductPageTemplate
        namespace="DeurenPage"
        materialKeys={['wood', 'aluminum', 'composite']}
        materialImages={[IMAGES.materials.deurenHout, IMAGES.materials.deurenAluminium, IMAGES.materials.deurenComposiet]}
        featureKeys={['security', 'insulation', 'design', 'durability', 'smart', 'custom']}
        breadcrumbLabel="Deuren"
      />
    </>
  );
}
