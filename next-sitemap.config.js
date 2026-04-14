/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://tiptobv.be',
  generateRobotsTxt: true,
  exclude: ['/api/*'],
  alternateRefs: [
    { href: 'https://tiptobv.be', hreflang: 'nl' },
    { href: 'https://tiptobv.be/en', hreflang: 'en' },
    { href: 'https://tiptobv.be/fr', hreflang: 'fr' },
    { href: 'https://tiptobv.be/pl', hreflang: 'pl' },
  ],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [],
  },
};
