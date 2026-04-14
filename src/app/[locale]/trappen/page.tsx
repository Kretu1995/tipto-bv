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
  const t = await getTranslations({ locale, namespace: 'TrappenPage.meta' });
  return generatePageMetadata({ title: t('title'), description: t('description'), locale, path: '/trappen' });
}

export default async function TrappenPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'TrappenPage' });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct(t('meta.title'), t('meta.description'), 'Stair Balustrades')) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb([{ name: 'Home', url: SITE_URL }, { name: 'Trapbalustrades', url: `${SITE_URL}/trappen` }])) }} />
      <ProductPageTemplate
        namespace="TrappenPage"
        materialKeys={['glass', 'steel', 'aluminum']}
        materialImages={[IMAGES.materials.trapGlas, IMAGES.materials.trapStaal, IMAGES.materials.trapHout]}
        featureKeys={['custom', 'design', 'safety', 'durable', 'lighting', 'combination']}
        breadcrumbLabel="Trapbalustrades"
      />
    </>
  );
}
