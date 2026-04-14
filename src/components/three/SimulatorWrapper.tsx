'use client';

import dynamic from 'next/dynamic';
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

export default function SimulatorWrapper() {
  // Static config (replaces WordPress PHP config)
  const config = require('@/configurator/config').default;

  return (
    <div className="tipto-configurator-embed">
      <ConfiguratorApp config={config} />
    </div>
  );
}
