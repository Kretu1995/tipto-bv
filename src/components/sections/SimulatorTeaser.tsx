'use client';

import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function SimulatorTeaser() {
  const t = useTranslations('HomePage.simulator');

  return (
    <section className="py-20 lg:py-28 bg-off-white overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-gold mb-4">
              {t('sectionLabel')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-playfair)] text-charcoal leading-tight mb-6">
              {t('sectionTitle')}
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              {t('sectionSubtitle')}
            </p>
            <Button href="/3d-simulator" size="lg">
              {t('cta')}
            </Button>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="relative aspect-[4/3] bg-charcoal rounded-sm overflow-hidden">
              {/* 3D Preview placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">3D Simulator Preview</p>
                </div>
              </div>
              {/* Decorative lines */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <line x1="50" y1="250" x2="50" y2="100" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="150" y1="250" x2="150" y2="100" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="250" y1="250" x2="250" y2="100" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="350" y1="250" x2="350" y2="100" stroke="#c9a84c" strokeWidth="2" />
                  <line x1="50" y1="100" x2="350" y2="100" stroke="#c9a84c" strokeWidth="2" />
                  <rect x="55" y="110" width="90" height="135" fill="#c9a84c" opacity="0.15" rx="1" />
                  <rect x="155" y="110" width="90" height="135" fill="#c9a84c" opacity="0.15" rx="1" />
                  <rect x="255" y="110" width="90" height="135" fill="#c9a84c" opacity="0.15" rx="1" />
                </svg>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
