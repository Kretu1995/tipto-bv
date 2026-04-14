'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { materialColors, type MaterialType, type ColorOption } from './MaterialPresets';

type RailStyle = 'glass-panel' | 'horizontal-bars' | 'vertical-bars' | 'cable';

type ConfiguratorControlsProps = {
  material: MaterialType;
  color: string;
  railStyle: RailStyle;
  postStyle: 'round' | 'square';
  height: number;
  panelCount: number;
  onMaterialChange: (m: MaterialType) => void;
  onColorChange: (c: string) => void;
  onRailStyleChange: (s: RailStyle) => void;
  onPostStyleChange: (s: 'round' | 'square') => void;
  onHeightChange: (h: number) => void;
  onPanelCountChange: (n: number) => void;
};

export default function ConfiguratorControls({
  material,
  color,
  railStyle,
  postStyle,
  height,
  panelCount,
  onMaterialChange,
  onColorChange,
  onRailStyleChange,
  onPostStyleChange,
  onHeightChange,
  onPanelCountChange,
}: ConfiguratorControlsProps) {
  const t = useTranslations('SimulatorPage.controls');

  const materials: { key: MaterialType; label: string }[] = [
    { key: 'glass', label: t('glass') },
    { key: 'steel', label: t('steel') },
    { key: 'aluminum', label: t('aluminum') },
  ];

  const railStyles: { key: RailStyle; label: string }[] = [
    { key: 'glass-panel', label: t('glassPanel') },
    { key: 'horizontal-bars', label: t('horizontalBars') },
    { key: 'vertical-bars', label: t('verticalBars') },
    { key: 'cable', label: t('cable') },
  ];

  const colors: ColorOption[] = materialColors[material];

  return (
    <div className="space-y-6">
      {/* Material */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {t('material')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {materials.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                onMaterialChange(m.key);
                onColorChange(materialColors[m.key][0].hex);
              }}
              className={cn(
                'px-3 py-2.5 text-xs font-medium rounded-sm border transition-all cursor-pointer',
                material === m.key
                  ? 'bg-gold text-white border-gold'
                  : 'bg-charcoal-light text-gray-300 border-charcoal-light hover:border-gray-500'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {t('color')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {colors.map((c) => (
            <button
              key={c.key}
              onClick={() => onColorChange(c.hex)}
              className={cn(
                'w-10 h-10 rounded-full border-2 transition-all cursor-pointer',
                color === c.hex ? 'border-gold scale-110 ring-2 ring-gold/30' : 'border-gray-600 hover:border-gray-400'
              )}
              style={{ backgroundColor: c.hex }}
              title={t(c.key as 'clear')}
            />
          ))}
        </div>
      </div>

      {/* Rail Style */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {t('style')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {railStyles.map((s) => (
            <button
              key={s.key}
              onClick={() => onRailStyleChange(s.key)}
              className={cn(
                'px-3 py-2.5 text-xs font-medium rounded-sm border transition-all cursor-pointer',
                railStyle === s.key
                  ? 'bg-gold text-white border-gold'
                  : 'bg-charcoal-light text-gray-300 border-charcoal-light hover:border-gray-500'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post Style */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {t('postStyle')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['round', 'square'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onPostStyleChange(s)}
              className={cn(
                'px-3 py-2.5 text-xs font-medium rounded-sm border transition-all cursor-pointer',
                postStyle === s
                  ? 'bg-gold text-white border-gold'
                  : 'bg-charcoal-light text-gray-300 border-charcoal-light hover:border-gray-500'
              )}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {t('height')}: {height.toFixed(1)}m
        </label>
        <input
          type="range"
          min={0.9}
          max={1.2}
          step={0.1}
          value={height}
          onChange={(e) => onHeightChange(parseFloat(e.target.value))}
          className="w-full accent-gold"
        />
      </div>

      {/* Panels */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          {t('panels')}: {panelCount}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={panelCount}
          onChange={(e) => onPanelCountChange(parseInt(e.target.value))}
          className="w-full accent-gold"
        />
      </div>
    </div>
  );
}
