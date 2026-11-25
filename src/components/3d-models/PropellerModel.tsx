import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getCarbonFiberTexture } from '../../utils/textureGenerator';

interface PropellerModelProps {
  diameterInches?: number;
  pitchInches?: number;
  blades?: 2 | 3;
  rpm?: number;
  spinning?: boolean;
  cw?: boolean;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  imbalanceOffset?: number;
  showBalanceClip?: boolean;
  onSelect?: () => void;
}

export const PropellerModel: React.FC<PropellerModelProps> = ({
  diameterInches = 10,
  pitchInches = 4.5,
  blades = 2,
  rpm = 0,
  spinning = false,
  cw = true,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  imbalanceOffset = 0,
  showBalanceClip = false,
  onSelect,
}) => {
  const propGroupRef = useRef<THREE.Group>(null);
  const carbonTex = getCarbonFiberTexture();

  // Three.js span length proportional to inches
  const span = (diameterInches / 10) * 1.15;

  useFrame((_, delta) => {
    if (propGroupRef.current && (spinning || rpm > 0)) {
      const speed = Math.max(rpm, 140) * (2 * Math.PI / 60) * delta;
      propGroupRef.current.rotation.y += cw ? -speed : speed;
    }
  });

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
      <group ref={propGroupRef}>
        {/* 1. CENTRAL CNC ALUMINUM HUB */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.1, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>

        {/* Precision Motor Shaft Bore (5mm/6mm with brass sleeve) */}
        <mesh position={[0, 0.051, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.01, 24]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* 2. AERODYNAMIC AIRFOIL BLADES WITH REALISTIC PITCH TWIST & TAPERING */}
        {Array.from({ length: blades }).map((_, i) => {
          const bladeAngle = (i * 2 * Math.PI) / blades;
          const twistDirection = cw ? 1 : -1;

          return (
            <group key={i} rotation={[0, bladeAngle, 0]}>
              {/* Inner Root Section (High Pitch Twist Angle ~24°) */}
              <group position={[span * 0.22, 0, 0]} rotation={[0.42 * twistDirection, 0, 0]}>
                <mesh position={[0, 0.01, 0]}>
                  <boxGeometry args={[span * 0.38, 0.024, 0.22]} />
                  <meshStandardMaterial
                    map={carbonTex}
                    color="#141923"
                    metalness={0.5}
                    roughness={0.35}
                  />
                </mesh>
                {/* Cambered Upper Surface Curve */}
                <mesh position={[0, 0.024, -0.03]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.08, 0.08, span * 0.38, 16, 1, false, 0, Math.PI]} />
                  <meshStandardMaterial map={carbonTex} color="#181d28" roughness={0.3} />
                </mesh>
              </group>

              {/* Mid-Span Section (Moderate Pitch ~16°) */}
              <group position={[span * 0.58, 0, 0]} rotation={[0.26 * twistDirection, 0, 0]}>
                <mesh position={[0, 0.008, 0]}>
                  <boxGeometry args={[span * 0.42, 0.018, 0.18]} />
                  <meshStandardMaterial
                    map={carbonTex}
                    color="#141923"
                    metalness={0.5}
                    roughness={0.35}
                  />
                </mesh>
              </group>

              {/* Outer Blade Tip Section (Low Pitch ~9°, Thinned Airfoil) */}
              <group position={[span * 0.88, 0, 0]} rotation={[0.14 * twistDirection, 0, 0]}>
                <mesh position={[0, 0.005, 0]}>
                  <boxGeometry args={[span * 0.25, 0.012, 0.13]} />
                  <meshStandardMaterial
                    map={carbonTex}
                    color="#141923"
                    metalness={0.5}
                    roughness={0.35}
                  />
                </mesh>
                {/* Elliptical Rounded Wingtip */}
                <mesh position={[span * 0.13, 0.004, 0]}>
                  <cylinderGeometry args={[0.065, 0.065, 0.01, 24]} />
                  <meshStandardMaterial map={carbonTex} color="#141923" roughness={0.35} />
                </mesh>
              </group>

              {/* Laser Engraved Size Specifications on Blade Face */}
              {i === 0 && (
                <mesh position={[span * 0.35, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <boxGeometry args={[0.18, 0.03, 0.002]} />
                  <meshBasicMaterial color="#94a3b8" />
                </mesh>
              )}

              {/* Experiment 7: Corrective Balance Tape */}
              {showBalanceClip && i === 1 && (
                <mesh position={[span * 0.75, 0.022, 0]}>
                  <boxGeometry args={[0.18, 0.008, 0.12]} />
                  <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Experiment 7: Imbalance Mass Slug */}
        {imbalanceOffset > 0 && (
          <mesh position={[span * 0.82, 0.022, 0]}>
            <sphereGeometry args={[0.038 * imbalanceOffset, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
          </mesh>
        )}

        {/* High-Speed Spin Motion Blur Disc when at Full Flight RPM */}
        {spinning && (
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[span * 1.02, span * 1.02, 0.01, 36]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.16}
              roughness={0.1}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};
