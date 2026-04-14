import { createPostMaterial, type MaterialType } from './MaterialPresets';

type VerticalBarsProps = {
  position: [number, number, number];
  width: number;
  height: number;
  material: MaterialType;
  color: string;
};

export default function VerticalBars({ position, width, height, material, color }: VerticalBarsProps) {
  const matProps = createPostMaterial(material, color);
  const fillHeight = height - 0.15;
  const spacing = 0.08;
  const count = Math.floor((width - 0.06) / spacing);
  const startX = -(count * spacing) / 2;

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[startX + i * spacing + spacing / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, fillHeight, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
}
