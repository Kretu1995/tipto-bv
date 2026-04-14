import { createPostMaterial, type MaterialType } from './MaterialPresets';

type HorizontalBarsProps = {
  position: [number, number, number];
  width: number;
  height: number;
  material: MaterialType;
  color: string;
};

export default function HorizontalBars({ position, width, height, material, color }: HorizontalBarsProps) {
  const matProps = createPostMaterial(material, color);
  const barCount = 5;
  const spacing = (height - 0.15) / (barCount + 1);
  const startY = -(height - 0.15) / 2 + spacing;

  return (
    <group position={position}>
      {Array.from({ length: barCount }).map((_, i) => (
        <mesh key={i} position={[0, startY + i * spacing, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, width - 0.06, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
}
