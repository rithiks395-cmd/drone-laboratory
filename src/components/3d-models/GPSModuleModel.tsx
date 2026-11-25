import React from 'react';
import { getCarbonFiberTexture, getGPSPatchTexture } from '../../utils/textureGenerator';

interface GPSModuleModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  highlighted?: boolean;
  onSelect?: () => void;
}

export const GPSModuleModel: React.FC<GPSModuleModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  highlighted = false,
  onSelect,
}) => {
  const carbonTex = getCarbonFiberTexture();
  const patchTex = getGPSPatchTexture();

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* 1. CNC LOWER MAST CLAMP BASE (Mounted to Upper Drone Plate) */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.08, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Thumb Screw Hinge */}
      <mesh position={[0.09, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
      </mesh>

      {/* 2. ELEVATED CARBON FIBER MAST TUBE (12cm) */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.74, 16]} />
        <meshStandardMaterial
          map={carbonTex}
          color="#141923"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* 3. UPPER MOUNTING CRADLE */}
      <mesh position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.1, 0.04, 0.05, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 4. GPS / COMPASS DOME PUCK (UBLOX M8N) */}
      <group position={[0, 0.88, 0]}>
        {/* Aerodynamic Circular Shell */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 36]} />
          <meshStandardMaterial
            color={highlighted ? '#00f0ff' : '#0b111a'}
            metalness={0.5}
            roughness={0.4}
            emissive={highlighted ? '#00f0ff' : '#000000'}
            emissiveIntensity={highlighted ? 0.35 : 0}
          />
        </mesh>
        {/* Upper Convex Bezel */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.26, 0.3, 0.02, 36]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* 25x25mm Dielectric Ceramic Patch Antenna Face */}
        <mesh position={[0, 0.072, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.26, 0.26]} />
          <meshStandardMaterial map={patchTex} roughness={0.4} />
        </mesh>

        {/* 3D Directional Arrow for Magnetometer Alignment */}
        <mesh position={[0, 0.075, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.025, 0.05, 3]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* 3D GPS 3D-Fix Blue Indicator LED (Blinking) */}
        <mesh position={[0.1, 0.075, 0.1]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      </group>
    </group>
  );
};
