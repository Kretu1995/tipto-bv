'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { COMPANY } from '@/lib/constants';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  product: z.string().optional(),
  message: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function ContactContent() {
  const t = useTranslations('ContactPage');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus('success');
        reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const productOptions = ['balustrades', 'ramen', 'deuren', 'garagepoorten', 'trappen', 'balkons', 'other'] as const;

  return (
    <section className="py-20 lg:py-28 bg-off-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">
          {/* Form */}
          <ScrollReveal>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">{t('form.name')} *</label>
                  <input
                    {...register('name')}
                    placeholder={t('form.namePlaceholder')}
                    className={cn(
                      'w-full px-4 py-3 rounded-sm border bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors',
                      errors.name ? 'border-red-400' : 'border-gray-200'
                    )}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{t('form.required')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">{t('form.email')} *</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder={t('form.emailPlaceholder')}
                    className={cn(
                      'w-full px-4 py-3 rounded-sm border bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors',
                      errors.email ? 'border-red-400' : 'border-gray-200'
                    )}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{t('form.invalidEmail')}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">{t('form.phone')}</label>
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder={t('form.phonePlaceholder')}
                    className="w-full px-4 py-3 rounded-sm border border-gray-200 bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">{t('form.product')}</label>
                  <select
                    {...register('product')}
                    className="w-full px-4 py-3 rounded-sm border border-gray-200 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
                  >
                    <option value="">{t('form.productPlaceholder')}</option>
                    {productOptions.map((opt) => (
                      <option key={opt} value={opt}>{t(`form.productOptions.${opt}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">{t('form.message')} *</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder={t('form.messagePlaceholder')}
                  className={cn(
                    'w-full px-4 py-3 rounded-sm border bg-white text-charcoal placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors resize-none',
                    errors.message ? 'border-red-400' : 'border-gray-200'
                  )}
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{t('form.required')}</p>}
              </div>

              <Button type="submit" size="lg" disabled={status === 'sending'}>
                {status === 'sending' ? t('form.sending') : t('form.submit')}
              </Button>

              {status === 'success' && (
                <p className="text-green-600 font-medium text-sm">{t('form.success')}</p>
              )}
              {status === 'error' && (
                <p className="text-red-500 font-medium text-sm">{t('form.error')}</p>
              )}
            </form>
          </ScrollReveal>

          {/* Contact info sidebar */}
          <ScrollReveal delay={0.2}>
            <div className="bg-charcoal rounded-sm p-8 text-gray-300 h-fit lg:sticky lg:top-24">
              <h3 className="text-white font-bold font-[family-name:var(--font-playfair)] text-xl mb-6">
                {t('info.title')}
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{t('info.address')}</p>
                  <p className="text-white">{COMPANY.address.full}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{t('info.phone')}</p>
                  <a href={`tel:${COMPANY.phone}`} className="text-gold hover:text-gold-hover transition-colors">
                    {COMPANY.phoneDisplay}
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{t('info.email')}</p>
                  <a href={`mailto:${COMPANY.email}`} className="text-gold hover:text-gold-hover transition-colors">
                    {COMPANY.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{t('info.vat')}</p>
                  <p>{COMPANY.vat}</p>
                </div>
                <div className="pt-4 border-t border-charcoal-light">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{t('info.hours')}</p>
                  <p className="text-sm">{t('info.weekdays')}</p>
                  <p className="text-sm">{t('info.saturday')}</p>
                  <p className="text-sm">{t('info.sunday')}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
