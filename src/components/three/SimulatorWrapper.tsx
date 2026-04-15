'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import '@/configurator/styles/main.css';
import '@/configurator/styles/design.css';

const ConfiguratorApp = dynamic(
  () => import('@/configurator/app/ConfiguratorApp'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[600px] bg-[#12121f] rounded-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">3D-preview wordt geladen...</p>
        </div>
      </div>
    ),
  }
);

function MobileBlocker() {
  const t = useTranslations('SimulatorMobile');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#12121f] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-playfair)] mb-3">
          {t('title')}
        </h1>

        <p className="text-gray-400 leading-relaxed mb-8">
          {t('message')}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#c9a84c] text-white rounded-sm font-medium hover:bg-[#b8943f] transition-colors"
          >
            {t('cta')}
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-gray-400 hover:text-white border border-gray-700 rounded-sm font-medium transition-colors"
          >
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SimulatorWrapper() {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 900);
      setChecked(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#12121f] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isMobile) {
    return <MobileBlocker />;
  }

  const config = require('@/configurator/config').default;

  return (
    <div className="tipto-configurator-embed">
      <ConfiguratorApp config={config} />
    </div>
  );
}
