import type { Metadata } from 'next';
import { SITE_URL, COMPANY } from './constants';

type MetadataParams = {
  title: string;
  description: string;
  locale: string;
  path?: string;
  image?: string;
};

export function generatePageMetadata({
  title,
  description,
  locale,
  path = '',
  image = '/images/og-default.jpg',
}: MetadataParams): Metadata {
  const url = `${SITE_URL}${locale === 'nl' ? '' : `/${locale}`}${path}`;

  const alternates: Record<string, string> = {
    'nl': `${SITE_URL}${path}`,
    'en': `${SITE_URL}/en${path}`,
    'fr': `${SITE_URL}/fr${path}`,
    'pl': `${SITE_URL}/pl${path}`,
  };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: COMPANY.name,
      locale: locale === 'nl' ? 'nl_BE' : locale === 'fr' ? 'fr_BE' : locale === 'pl' ? 'pl_PL' : 'en',
      type: 'website',
      images: [
        {
          url: `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export function jsonLdOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY.name,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.svg`,
    description: 'Belgisch bedrijf gespecialiseerd in maatwerkoplossingen voor balustrades, ramen, deuren, garagepoorten, trappen en balkons.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY.phone,
      contactType: 'customer service',
      availableLanguage: ['Dutch', 'English', 'French', 'Polish'],
    },
  };
}

export function jsonLdLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    image: `${SITE_URL}/images/og-default.jpg`,
    url: SITE_URL,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    vatID: COMPANY.vat,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00',
      },
    ],
    priceRange: '$$',
    areaServed: {
      '@type': 'Country',
      name: 'Belgium',
    },
  };
}

export function jsonLdProduct(name: string, description: string, category: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    category,
    brand: {
      '@type': 'Brand',
      name: COMPANY.name,
    },
    manufacturer: {
      '@type': 'Organization',
      name: COMPANY.name,
    },
  };
}

export function jsonLdFAQ(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function jsonLdBreadcrumb(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
