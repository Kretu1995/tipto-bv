import PostPanel from './PostPanel';
import RailBar from './RailBar';
import GlassPanel from './GlassPanel';
import HorizontalBars from './HorizontalBars';
import VerticalBars from './VerticalBars';
import CableFill from './CableFill';
import type { MaterialType } from './MaterialPresets';

type RailStyle = 'glass-panel' | 'horizontal-bars' | 'vertical-bars' | 'cable';

type BalustradeModelProps = {
  material: MaterialType;
  color: string;
  railStyle: RailStyle;
  postStyle: 'round' | 'square';
  height: number;
  panelCount: number;
};

export default function BalustradeModel({
  material,
  color,
  railStyle,
  postStyle,
  height,
  panelCount,
}: BalustradeModelProps) {
  const panelWidth = 1.0;
  const totalWidth = panelCount * panelWidth;
  const startX = -totalWidth / 2;

  // Post color — for glass balustrades, posts are always steel-colored
  const postColor = material === 'glass' ? '#c0c0c0' : color;
  const postMaterial = material === 'glass' ? 'steel' as MaterialType : material;

  const FillComponent = {
    'glass-panel': GlassPanel,
    'horizontal-bars': HorizontalBars,
    'vertical-bars': VerticalBars,
    'cable': CableFill,
  }[railStyle];

  return (
    <group>
      {/* Posts */}
      {Array.from({ length: panelCount + 1 }).map((_, i) => (
        <PostPanel
          key={`post-${i}`}
          position={[startX + i * panelWidth, 0, 0]}
          height={height}
          style={postStyle}
          material={postMaterial}
          color={postColor}
        />
      ))}

      {/* Top rail */}
      <RailBar
        position={[0, height, 0]}
        width={totalWidth}
        material={postMaterial}
        color={postColor}
      />

      {/* Fill panels */}
      {Array.from({ length: panelCount }).map((_, i) => {
        const panelCenterX = startX + i * panelWidth + panelWidth / 2;
        const fillCenterY = height / 2 + 0.02;

        return (
          <FillComponent
            key={`fill-${i}`}
            position={[panelCenterX, fillCenterY, 0]}
            width={panelWidth}
            height={height}
            material={material}
            color={color}
          />
        );
      })}
    </group>
  );
}
