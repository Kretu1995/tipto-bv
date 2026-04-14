import * as THREE from 'three';

export type MaterialType = 'glass' | 'steel' | 'aluminum';

export type ColorOption = {
  key: string;
  hex: string;
};

export const materialColors: Record<MaterialType, ColorOption[]> = {
  glass: [
    { key: 'clear', hex: '#e8f4f8' },
    { key: 'greenTint', hex: '#c8e6c9' },
    { key: 'blueTint', hex: '#bbdefb' },
    { key: 'frosted', hex: '#f5f5f5' },
  ],
  steel: [
    { key: 'brushed', hex: '#c0c0c0' },
    { key: 'matteBlack', hex: '#2c2c2c' },
    { key: 'anthracite', hex: '#1a1a2e' },
    { key: 'bronze', hex: '#8b7355' },
  ],
  aluminum: [
    { key: 'natural', hex: '#d4d4d4' },
    { key: 'white', hex: '#f5f5f5' },
    { key: 'black', hex: '#2c2c2c' },
    { key: 'goldAnodized', hex: '#c9a84c' },
  ],
};

export function createPostMaterial(material: MaterialType, color: string): THREE.MeshStandardMaterialParameters {
  const base: THREE.MeshStandardMaterialParameters = { color };

  switch (material) {
    case 'glass':
      return { ...base, metalness: 0.1, roughness: 0.2 };
    case 'steel':
      return { ...base, metalness: 0.9, roughness: 0.2 };
    case 'aluminum':
      return { ...base, metalness: 0.7, roughness: 0.3 };
  }
}

export function createFillMaterial(material: MaterialType, color: string): THREE.MeshPhysicalMaterialParameters {
  switch (material) {
    case 'glass':
      return {
        color,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.1,
        side: THREE.DoubleSide,
      };
    case 'steel':
      return {
        color,
        metalness: 0.9,
        roughness: 0.2,
      };
    case 'aluminum':
      return {
        color,
        metalness: 0.7,
        roughness: 0.3,
      };
  }
}
