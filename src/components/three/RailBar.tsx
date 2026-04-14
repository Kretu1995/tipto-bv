import { createPostMaterial, type MaterialType } from './MaterialPresets';

type RailBarProps = {
  position: [number, number, number];
  width: number;
  material: MaterialType;
  color: string;
};

export default function RailBar({ position, width, material, color }: RailBarProps) {
  const matProps = createPostMaterial(material, color);

  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[width, 0.04, 0.05]} />
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}
