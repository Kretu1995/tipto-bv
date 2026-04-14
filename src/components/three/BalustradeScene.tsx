'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import BalustradeModel from './BalustradeModel';
import FloorPlane from './FloorPlane';
import type { MaterialType } from './MaterialPresets';

type BalustradeSceneProps = {
  material: MaterialType;
  color: string;
  railStyle: 'glass-panel' | 'horizontal-bars' | 'vertical-bars' | 'cable';
  postStyle: 'round' | 'square';
  height: number;
  panelCount: number;
};

export default function BalustradeScene(props: BalustradeSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}
      className="!h-full"
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#1a1a2e']} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />

      <Suspense fallback={null}>
        <Environment preset="apartment" />
        <BalustradeModel {...props} />
        <FloorPlane />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={6}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, props.height / 2, 0]}
      />
    </Canvas>
  );
}
