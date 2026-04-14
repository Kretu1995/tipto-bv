import { createPostMaterial, type MaterialType } from './MaterialPresets';

type CableFillProps = {
  position: [number, number, number];
  width: number;
  height: number;
  material: MaterialType;
  color: string;
};

export default function CableFill({ position, width, height, material, color }: CableFillProps) {
  const matProps = createPostMaterial(material, color);
  const cableCount = 6;
  const fillHeight = height - 0.15;
  const spacing = fillHeight / (cableCount + 1);
  const startY = -fillHeight / 2 + spacing;

  return (
    <group position={position}>
      {Array.from({ length: cableCount }).map((_, i) => (
        <mesh key={i} position={[0, startY + i * spacing, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.003, 0.003, width - 0.06, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      ))}
    </group>
  );
}
