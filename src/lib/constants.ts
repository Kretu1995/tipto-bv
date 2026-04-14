export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tiptobv.be';

export const COMPANY = {
  name: 'Tipto BV',
  legalName: 'Tipto BV',
  vat: 'BE0802227315',
  address: {
    street: 'Koekoekstraat 25',
    city: 'Aartselaar',
    postalCode: '2630',
    country: 'BE',
    full: 'Koekoekstraat 25, 2630 Aartselaar',
  },
  phone: '+32 466 49 18 51',
  phoneDisplay: '0466 49 18 51',
  email: 'info@tiptobv.be',
  yearsExperience: 17,
  foundedYear: 2008,
} as const;

export const PRODUCTS = [
  { key: 'balustrades', slug: 'balustrades', icon: 'shield' },
  { key: 'ramen', slug: 'ramen', icon: 'square' },
  { key: 'deuren', slug: 'deuren', icon: 'door-open' },
  { key: 'garagepoorten', slug: 'garagepoorten', icon: 'warehouse' },
  { key: 'trappen', slug: 'trappen', icon: 'stairs' },
  { key: 'balkons', slug: 'balkons', icon: 'building' },
] as const;

export const MATERIALS = {
  balustrades: ['inox', 'inox-poedercoating', 'aluminium', 'glas'],
  ramen: ['pvc', 'aluminium', 'hout'],
  deuren: ['hout', 'metaal', 'composiet'],
  garagepoorten: ['sectionaal', 'kantel', 'rol'],
  trappen: ['hout', 'staal', 'beton'],
  balkons: ['aluminium', 'staal', 'glas'],
} as const;

export const NAV_ITEMS = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/over-ons' },
  {
    key: 'products',
    href: '#',
    children: [
      { key: 'balustrades', href: '/balustrades' },
      { key: 'ramen', href: '/ramen' },
      { key: 'deuren', href: '/deuren' },
      { key: 'garagepoorten', href: '/garagepoorten' },
      { key: 'trappen', href: '/trappen' },
      { key: 'balkons', href: '/balkons' },
    ],
  },
  { key: 'simulator', href: '/3d-simulator' },
  { key: 'realisaties', href: '/realisaties' },
  { key: 'werkwijze', href: '/werkwijze' },
  { key: 'faq', href: '/faq' },
  { key: 'contact', href: '/contact' },
] as const;
