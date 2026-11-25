import React from 'react';
import { getLiPoLabelTexture } from '../../utils/textureGenerator';

interface LiPoBatteryModelProps {
  cells?: 2 | 3 | 4 | 6;
  capacityMah?: number;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  highlighted?: boolean;
  onSelect?: () => void;
}

export const LiPoBatteryModel: React.FC<LiPoBatteryModelProps> = ({
  cells = 4,
  capacityMah = 3300,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  highlighted = false,
  onSelect,
}) => {
  const labelTex = getLiPoLabelTexture(cells, capacityMah);

  const cellThickness = 0.09;
  const packHeight = cells * cellThickness;
  const packWidth = 0.58;
  const packLength = 1.15;

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
      {/* 1. INTERNAL STACKED PRISMATIC ALUMINUM POUCH CELLS */}
      {Array.from({ length: cells }).map((_, i) => {
        const yPos = -packHeight / 2 + cellThickness / 2 + i * cellThickness;
        return (
          <group key={i} position={[0, yPos, 0]}>
            {/* Pouch Cell Body */}
            <mesh>
              <boxGeometry args={[packWidth - 0.03, cellThickness - 0.008, packLength - 0.04]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Ultrasonic Heat-Sealed Edge Flanges */}
            <mesh position={[packWidth / 2 - 0.015, 0, 0]}>
              <boxGeometry args={[0.015, 0.006, packLength - 0.06]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
            <mesh position={[-packWidth / 2 + 0.015, 0, 0]}>
              <boxGeometry args={[0.015, 0.006, packLength - 0.06]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* 2. PROTECTIVE PVC SHRINK TUBE (Matte Dark Blue / Slate) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[packWidth, packHeight + 0.006, packLength]} />
        <meshStandardMaterial
          color={highlighted ? '#00f0ff' : '#0a101d'}
          metalness={0.2}
          roughness={0.4}
          emissive={highlighted ? '#00f0ff' : '#000000'}
          emissiveIntensity={highlighted ? 0.35 : 0}
        />
      </mesh>

      {/* 3. DETAILED MANUFACTURER SPECS GRAPHIC LABEL */}
      <mesh position={[0, packHeight / 2 + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[packWidth - 0.06, packLength - 0.12]} />
        <meshStandardMaterial map={labelTex} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 4. MAIN HIGH-DISCHARGE SILICONE LEADS WITH AMASS XT60 CONNECTOR */}
      <group position={[0, 0, packLength / 2]}>
        {/* Positive 12AWG Red Lead */}
        <mesh position={[-0.11, 0.03, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.28, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.6} />
        </mesh>
        {/* Negative 12AWG Black Lead */}
        <mesh position={[0.11, 0.03, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.28, 16]} />
          <meshStandardMaterial color="#020617" roughness={0.6} />
        </mesh>

        {/* AMASS Yellow Nylon XT60 Male Body (Keyed Chamfered Hex) */}
        <group position={[0, 0.03, 0.28]}>
          <mesh>
            <boxGeometry args={[0.28, 0.13, 0.18]} />
            <meshStandardMaterial color="#eab308" roughness={0.35} metalness={0.1} />
          </mesh>
          {/* Recessed Gold-Plated 3.5mm Bullet Contact Pins */}
          <mesh position={[-0.07, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.06, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0.07, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.026, 0.026, 0.06, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Molded '+' and '-' Polarity Indicators */}
          <mesh position={[-0.07, 0.07, 0]}>
            <boxGeometry args={[0.03, 0.005, 0.03]} />
            <meshBasicMaterial color="#ca8a04" />
          </mesh>
        </group>
      </group>

      {/* 5. JST-XH MULTI-PIN BALANCE HARNESS */}
      <group position={[-0.16, -0.02, packLength / 2]}>
        {/* Individual Ribbon Wires for each cell */}
        {Array.from({ length: cells + 1 }).map((_, w) => (
          <mesh
            key={w}
            position={[-0.06 + w * 0.025, 0, 0.12]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.01, 0.01, 0.24, 8]} />
            <meshStandardMaterial
              color={w === 0 ? '#020617' : w === cells ? '#ef4444' : '#38bdf8'}
            />
          </mesh>
        ))}
        {/* Molded White Nylon JST-XH Balance Connector Shell */}
        <mesh position={[0, 0, 0.25]}>
          <boxGeometry args={[0.18, 0.08, 0.12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};
