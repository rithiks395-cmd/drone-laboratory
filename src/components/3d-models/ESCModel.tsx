import React from 'react';
import { getPCBTexture } from '../../utils/textureGenerator';

interface ESCModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  ampRating?: number;
  highlighted?: boolean;
  onSelect?: () => void;
}

export const ESCModel: React.FC<ESCModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ampRating = 30,
  highlighted = false,
  onSelect,
}) => {
  const pcbTex = getPCBTexture('esc');

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
      {/* 1. 4-LAYER 2oz COPPER FR4 PCB */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.95]} />
        <meshStandardMaterial
          map={pcbTex}
          color={highlighted ? '#00f0ff' : '#0b1118'}
          metalness={0.4}
          roughness={0.4}
          emissive={highlighted ? '#00f0ff' : '#000000'}
          emissiveIntensity={highlighted ? 0.35 : 0}
        />
      </mesh>

      {/* 2. 6x HIGH-CURRENT POWER MOSFETs (QFN-8 5x6mm) */}
      {[-0.14, 0.14].map((x, row) => (
        <group key={row}>
          {[-0.2, 0, 0.2].map((z, col) => (
            <group key={col} position={[x, 0.07, z]}>
              {/* Epoxy Molded IC Package */}
              <mesh>
                <boxGeometry args={[0.12, 0.025, 0.14]} />
                <meshStandardMaterial color="#020617" roughness={0.7} />
              </mesh>
              {/* Solder Fillet Lead Pins */}
              <mesh position={[0, -0.01, 0]}>
                <boxGeometry args={[0.13, 0.015, 0.15]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 3. ALUMINUM EXTRUDED HEATSINK WITH COOLING FINS */}
      <group position={[0, 0.1, 0]}>
        {/* Base Heat Spreader */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.46, 0.025, 0.72]} />
          <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* 6x Vertical Extruded Cooling Fins */}
        {[-0.18, -0.1, -0.03, 0.03, 0.1, 0.18].map((fx, i) => (
          <mesh key={i} position={[fx, 0.03, 0]}>
            <boxGeometry args={[0.018, 0.045, 0.7]} />
            <meshStandardMaterial color="#0369a1" metalness={0.88} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 4. LOW-ESR HIGH-FREQUENCY ELECTROLYTIC FILTER CAPACITOR */}
      <group position={[0, 0.09, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Black Sleeve Cylinder */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.24, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Aluminum Top with Stamped K-Vent Safety Score */}
        <mesh position={[0, 0.121, 0]}>
          <cylinderGeometry args={[0.076, 0.076, 0.005, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Negative Polarity Stripe */}
        <mesh position={[0.065, 0, 0]}>
          <boxGeometry args={[0.01, 0.22, 0.04]} />
          <meshBasicMaterial color="#e2e8f0" />
        </mesh>
      </group>

      {/* 5. HEAVY DC POWER LEADS (14AWG Silicone, Red/Black) */}
      <mesh position={[-0.14, 0.04, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.38, 16]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>
      <mesh position={[0.14, 0.04, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.38, 16]} />
        <meshStandardMaterial color="#020617" roughness={0.6} />
      </mesh>

      {/* 6. 3x MOTOR PHASE OUTPUT WIRES (Phase A, B, C) */}
      {[-0.16, 0, 0.16].map((x, idx) => (
        <group key={idx} position={[x, 0.04, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.028, 0.028, 0.36, 16]} />
            <meshStandardMaterial color="#0284c7" roughness={0.6} />
          </mesh>
          {/* Gold Female 3.5mm Bullet Socket Terminal */}
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.034, 0.034, 0.09, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* 7. PWM/DSHOT SIGNAL TWISTED SERVO CABLE (White/Black) */}
      <group position={[0, 0.05, 0.66]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.42, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Black 3-Pin DuPont Connector Shell */}
        <mesh position={[0, 0, 0.22]}>
          <boxGeometry args={[0.08, 0.04, 0.14]} />
          <meshStandardMaterial color="#020617" roughness={0.6} />
        </mesh>
      </group>

      {/* Transparent Protective Shrinkwrap Sheen */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.58, 0.16, 0.98]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
};
