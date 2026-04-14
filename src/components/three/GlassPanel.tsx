import { createFillMaterial, type MaterialType } from './MaterialPresets';

type GlassPanelProps = {
  position: [number, number, number];
  width: number;
  height: number;
  material: MaterialType;
  color: string;
};

export default function GlassPanel({ position, width, height, material, color }: GlassPanelProps) {
  const matProps = createFillMaterial(material, color);

  return (
    <mesh position={position}>
      <planeGeometry args={[width - 0.06, height - 0.15]} />
      <meshPhysicalMaterial {...matProps} />
    </mesh>
  );
}
