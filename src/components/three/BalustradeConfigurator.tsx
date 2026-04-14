'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import BalustradeScene from './BalustradeScene';
import ConfiguratorControls from './ConfiguratorControls';
import { materialColors, type MaterialType } from './MaterialPresets';
import Button from '@/components/ui/Button';

type RailStyle = 'glass-panel' | 'horizontal-bars' | 'vertical-bars' | 'cable';

export default function BalustradeConfigurator() {
  const t = useTranslations('SimulatorPage');

  const [material, setMaterial] = useState<MaterialType>('glass');
  const [color, setColor] = useState(materialColors.glass[0].hex);
  const [railStyle, setRailStyle] = useState<RailStyle>('glass-panel');
  const [postStyle, setPostStyle] = useState<'round' | 'square'>('square');
  const [height, setHeight] = useState(1.0);
  const [panelCount, setPanelCount] = useState(3);

  const configParams = new URLSearchParams({
    material,
    color,
    railStyle,
    postStyle,
    height: height.toString(),
    panels: panelCount.toString(),
  }).toString();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 bg-charcoal rounded-sm overflow-hidden border border-charcoal-light">
      {/* 3D Canvas */}
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px]">
        <BalustradeScene
          material={material}
          color={color}
          railStyle={railStyle}
          postStyle={postStyle}
          height={height}
          panelCount={panelCount}
        />

        {/* Instructions overlay */}
        <div className="absolute bottom-4 left-4 flex gap-3 text-xs text-gray-500">
          <span>{t('instructions.drag')}</span>
          <span>|</span>
          <span>{t('instructions.scroll')}</span>
        </div>
      </div>

      {/* Controls sidebar */}
      <div className="p-6 bg-charcoal-dark border-t lg:border-t-0 lg:border-l border-charcoal-light overflow-y-auto max-h-[600px] lg:max-h-none">
        <h3 className="text-white font-bold font-[family-name:var(--font-playfair)] text-lg mb-6">
          {t('quote.title')}
        </h3>

        <ConfiguratorControls
          material={material}
          color={color}
          railStyle={railStyle}
          postStyle={postStyle}
          height={height}
          panelCount={panelCount}
          onMaterialChange={setMaterial}
          onColorChange={setColor}
          onRailStyleChange={setRailStyle}
          onPostStyleChange={setPostStyle}
          onHeightChange={setHeight}
          onPanelCountChange={setPanelCount}
        />

        <div className="mt-6 pt-6 border-t border-charcoal-light">
          <p className="text-xs text-gray-500 mb-4">
            {t('quote.description')}
          </p>
          <Button href={`/contact?config=${encodeURIComponent(configParams)}`} className="w-full" size="md">
            {t('quote.cta')}
          </Button>
        </div>
      </div>
    </div>
  );
}
