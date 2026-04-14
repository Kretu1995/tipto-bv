'use client';

import { useTranslations } from 'next-intl';
import ProductHero from '@/components/sections/ProductHero';
import Container from '@/components/ui/Container';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CtaSection from '@/components/sections/CtaSection';

export default function AboutContent() {
  const t = useTranslations('AboutPage');
  const common = useTranslations('Common');

  const serviceKeys = ['installation', 'maintenance', 'emergency', 'commercial', 'smart', 'custom'] as const;
  const reasonKeys = ['experience', 'available', 'specialists', 'solutions', 'pricing', 'emergency'] as const;

  return (
    <>
      <ProductHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: t('hero.badge') }]}
        ctaLabel={common('requestQuote')}
        ctaHref="/contact"
      />

      {/* Story */}
      <section className="py-20 lg:py-28 bg-off-white">
        <Container>
          <div className="max-w-3xl mx-auto">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-6">
                {t('story.title')}
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                {t('story.content')}
              </p>
            </ScrollReveal>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-12 text-center">
              {t('services.title')}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {serviceKeys.map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.08}>
                <div className="flex items-start gap-3 p-4 rounded-sm bg-off-white border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-charcoal">{t(`services.${key}`)}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Reasons */}
      <section className="py-20 lg:py-28 bg-charcoal">
        <Container>
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-playfair)] text-white mb-12 text-center">
              {t('reasons.title')}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {reasonKeys.map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.08}>
                <div className="text-center p-6 rounded-sm bg-charcoal-light border border-charcoal-light">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gold/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">{t(`reasons.${key}`)}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaSection />
    </>
  );
}
