'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import LocaleSwitcher from './LocaleSwitcher';

const productLinks = [
  { key: 'balustrades', href: '/balustrades' },
  { key: 'ramen', href: '/ramen' },
  { key: 'deuren', href: '/deuren' },
  { key: 'garagepoorten', href: '/garagepoorten' },
  { key: 'trappen', href: '/trappen' },
  { key: 'balkons', href: '/balkons' },
];

export default function Header() {
  const t = useTranslations('Navigation');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-white/80 backdrop-blur-sm'
        )}
      >
        <Container>
          <nav className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gold rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold font-[family-name:var(--font-playfair)] text-charcoal group-hover:text-gold transition-colors">
                Tipto
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors">
                {t('home')}
              </Link>
              <Link href="/over-ons" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors">
                {t('about')}
              </Link>

              {/* Products dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors flex items-center gap-1 cursor-pointer">
                  {t('products')}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 5l3 3 3-3" />
                  </svg>
                </button>
                <AnimatePresence>
                  {productsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full pt-1"
                    >
                      <div className="bg-white border border-gray-200 rounded-sm shadow-xl min-w-[200px] overflow-hidden">
                        {productLinks.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            className="block px-4 py-3 text-sm text-gray-600 hover:bg-gold/5 hover:text-gold transition-colors border-b border-gray-50 last:border-0"
                          >
                            {t(item.key)}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/3d-simulator" className="px-3 py-2 text-sm font-medium text-gold hover:text-gold-hover transition-colors">
                {t('simulator')}
              </Link>
              <Link href="/realisaties" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors">
                {t('realisaties')}
              </Link>
              <Link href="/werkwijze" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors">
                {t('werkwijze')}
              </Link>
              <Link href="/contact" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-charcoal transition-colors">
                {t('contact')}
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <LocaleSwitcher />
              <Button href="/contact" size="sm" className="hidden lg:inline-flex">
                {t('requestQuote')}
              </Button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={cn('block h-0.5 bg-charcoal transition-all duration-300', mobileOpen && 'rotate-45 translate-y-[7px]')} />
                  <span className={cn('block h-0.5 bg-charcoal transition-all duration-300', mobileOpen && 'opacity-0')} />
                  <span className={cn('block h-0.5 bg-charcoal transition-all duration-300', mobileOpen && '-rotate-45 -translate-y-[7px]')} />
                </div>
              </button>
            </div>
          </nav>
        </Container>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white lg:hidden"
          >
            <div className="pt-20 pb-8 px-6 h-full overflow-y-auto">
              <nav className="flex flex-col gap-1">
                <MobileLink href="/" onClick={() => setMobileOpen(false)}>{t('home')}</MobileLink>
                <MobileLink href="/over-ons" onClick={() => setMobileOpen(false)}>{t('about')}</MobileLink>
                <div className="py-2">
                  <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 px-4">
                    {t('products')}
                  </span>
                  <div className="mt-2 ml-4 flex flex-col gap-1">
                    {productLinks.map((item) => (
                      <MobileLink key={item.key} href={item.href} onClick={() => setMobileOpen(false)}>
                        {t(item.key)}
                      </MobileLink>
                    ))}
                  </div>
                </div>
                <MobileLink href="/3d-simulator" onClick={() => setMobileOpen(false)} highlight>{t('simulator')}</MobileLink>
                <MobileLink href="/realisaties" onClick={() => setMobileOpen(false)}>{t('realisaties')}</MobileLink>
                <MobileLink href="/werkwijze" onClick={() => setMobileOpen(false)}>{t('werkwijze')}</MobileLink>
                <MobileLink href="/faq" onClick={() => setMobileOpen(false)}>{t('faq')}</MobileLink>
                <MobileLink href="/contact" onClick={() => setMobileOpen(false)}>{t('contact')}</MobileLink>
              </nav>
              <div className="mt-8">
                <Button href="/contact" className="w-full" onClick={() => setMobileOpen(false)}>
                  {t('requestQuote')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  highlight,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'block px-4 py-3 text-lg font-medium rounded-sm transition-colors',
        highlight ? 'text-gold' : 'text-charcoal hover:bg-gray-50'
      )}
    >
      {children}
    </Link>
  );
}
