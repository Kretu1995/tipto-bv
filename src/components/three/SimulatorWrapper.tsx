'use client';

import dynamic from 'next/dynamic';

const BalustradeConfigurator = dynamic(
  () => import('@/components/three/BalustradeConfigurator'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[4/3] lg:aspect-auto lg:min-h-[500px] bg-charcoal rounded-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading 3D Simulator...</p>
        </div>
      </div>
    ),
  }
);

export default function SimulatorWrapper() {
  return <BalustradeConfigurator />;
}
