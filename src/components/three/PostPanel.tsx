import { createPostMaterial, type MaterialType } from './MaterialPresets';

type PostPanelProps = {
  position: [number, number, number];
  height: number;
  style: 'round' | 'square';
  material: MaterialType;
  color: string;
};

export default function PostPanel({ position, height, style, material, color }: PostPanelProps) {
  const matProps = createPostMaterial(material, color);

  return (
    <mesh position={[position[0], height / 2, position[2]]} castShadow>
      {style === 'round' ? (
        <cylinderGeometry args={[0.025, 0.025, height, 16]} />
      ) : (
        <boxGeometry args={[0.04, height, 0.04]} />
      )}
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}
