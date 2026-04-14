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
            <div className="relative rounded-sm overflow-hidden shadow-2xl shadow-charcoal/10 border border-gray-200">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              >
                <source src="/images/configurator-demo.webm" type="video/webm" />
              </video>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
