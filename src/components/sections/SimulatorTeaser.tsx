'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { IMAGES } from '@/lib/images';

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
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden group">
              <Image
                src={IMAGES.simulator.preview}
                alt="3D Balustrade Simulator Preview"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Overlay with 3D icon */}
              <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center transition-colors group-hover:bg-charcoal/20">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
