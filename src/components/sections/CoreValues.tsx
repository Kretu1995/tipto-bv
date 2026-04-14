'use client';

import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import ScrollReveal from '@/components/ui/ScrollReveal';

const valueIcons = [
  <svg key="craft" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M11.42 15.17l-5.37-5.36a2 2 0 010-2.83l.17-.17a2 2 0 012.83 0l2.37 2.37 6.2-6.2a2 2 0 012.83 0l.17.17a2 2 0 010 2.83l-9.2 9.19z" /></svg>,
  <svg key="inno" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  <svg key="rely" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
];

export default function CoreValues() {
  const t = useTranslations('HomePage.values');
  const keys = ['craftsmanship', 'innovation', 'reliability'] as const;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <Container>
        <SectionHeader
          label={t('sectionLabel')}
          title={t('sectionTitle')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {keys.map((key, i) => (
            <ScrollReveal key={key} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-gold mb-6">
                  {valueIcons[i]}
                </div>
                <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-3">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
