'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const t = useTranslations('CookieConsent');

  useEffect(() => {
    const consent = localStorage.getItem('tipto-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('tipto-cookie-consent', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('tipto-cookie-consent', 'declined');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-6"
        >
          <div className="mx-auto max-w-4xl bg-charcoal border border-charcoal-light rounded-sm shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-300 leading-relaxed">
                {t('message')}{' '}
                <Link href="/cookies" className="text-gold hover:text-gold-hover underline underline-offset-2 transition-colors">
                  {t('learnMore')}
                </Link>
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-600 rounded-sm transition-colors cursor-pointer"
              >
                {t('decline')}
              </button>
              <button
                onClick={accept}
                className="px-5 py-2 text-sm font-medium bg-gold text-white rounded-sm hover:bg-gold-hover transition-colors cursor-pointer"
              >
                {t('accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
