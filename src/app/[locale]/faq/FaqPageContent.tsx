'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const categoryKeys = ['general', 'products', 'pricing', 'installation'] as const;

export default function FaqPageContent() {
  const t = useTranslations('FaqPage');
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const allItems: { category: string; question: string; answer: string }[] = [];
  for (let i = 0; i < 8; i++) {
    try {
      allItems.push({
        category: t(`items.${i}.category`),
        question: t(`items.${i}.question`),
        answer: t(`items.${i}.answer`),
      });
    } catch { break; }
  }

  const filteredItems = allItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-off-white">
      <Container>
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(0); }}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-sm border transition-all cursor-pointer',
                activeCategory === cat
                  ? 'bg-gold text-white border-gold'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gold/50'
              )}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* FAQ items */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredItems.map((item, i) => (
            <div key={`${activeCategory}-${i}`} className="bg-white border border-gray-100 rounded-sm overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
              >
                <span className="font-medium text-charcoal pr-4">{item.question}</span>
                <motion.svg
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 text-gold shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-gray-500 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
