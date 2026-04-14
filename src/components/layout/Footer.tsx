import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import { COMPANY } from '@/lib/constants';

export default function Footer() {
  const t = useTranslations('Footer');
  const nav = useTranslations('Navigation');

  return (
    <footer className="bg-charcoal text-gray-300">
      <Container>
        <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo-light.svg"
                alt="Tipto BV"
                width={130}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              {t('description')}
            </p>
            <p className="text-xs text-gray-500">
              {t('vat')}: {COMPANY.vat}
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('products')}</h3>
            <ul className="space-y-2">
              <FooterLink href="/balustrades">{nav('balustrades')}</FooterLink>
              <FooterLink href="/ramen">{nav('ramen')}</FooterLink>
              <FooterLink href="/deuren">{nav('deuren')}</FooterLink>
              <FooterLink href="/garagepoorten">{nav('garagepoorten')}</FooterLink>
              <FooterLink href="/trappen">{nav('trappen')}</FooterLink>
              <FooterLink href="/balkons">{nav('balkons')}</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <FooterLink href="/over-ons">{nav('about')}</FooterLink>
              <FooterLink href="/realisaties">{nav('realisaties')}</FooterLink>
              <FooterLink href="/werkwijze">{nav('werkwijze')}</FooterLink>
              <FooterLink href="/3d-simulator">{nav('simulator')}</FooterLink>
              <FooterLink href="/faq">{nav('faq')}</FooterLink>
              <FooterLink href="/contact">{nav('contact')}</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{COMPANY.address.full}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${COMPANY.phone}`} className="hover:text-gold transition-colors">
                  {COMPANY.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-gold transition-colors">
                  {COMPANY.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-charcoal-light">
        <Container>
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} {t('copyright')}</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-gray-300 transition-colors">{t('privacy')}</Link>
                <Link href="/cookies" className="hover:text-gray-300 transition-colors">Cookies</Link>
                <Link href="/algemene-voorwaarden" className="hover:text-gray-300 transition-colors">{t('terms')}</Link>
              </div>
              <span className="text-gray-600">
                Website gemaakt door{' '}
                <a href="https://www.wdstudio.be" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-hover transition-colors">
                  WD Studio
                </a>
              </span>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-gray-400 hover:text-gold transition-colors">
        {children}
      </Link>
    </li>
  );
}
