import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BLDCMotorModelProps {
  rpm?: number;
  spinning?: boolean;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  cw?: boolean;
  highlighted?: boolean;
  exploded?: boolean;
  onSelect?: () => void;
}

export const BLDCMotorModel: React.FC<BLDCMotorModelProps> = ({
  rpm = 0,
  spinning = false,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  cw = true,
  highlighted = false,
  exploded = false,
  onSelect,
}) => {
  const rotorRef = useRef<THREE.Group>(null);
  const exp = exploded ? 0.8 : 0; // Separation distance when sub-exploded

  useFrame((_, delta) => {
    if (rotorRef.current && (spinning || rpm > 0)) {
      const speed = Math.max(rpm, 140) * (2 * Math.PI / 60) * delta;
      rotorRef.current.rotation.y += cw ? -speed : speed;
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
      {/* 1. CNC ALUMINUM STATOR BASE (Stationary) */}
      <group position={[0, -exp * 0.4, 0]}>
        {/* Base Mount Plate */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.34, 0.38, 0.08, 32]} />
          <meshStandardMaterial
            color={highlighted ? '#00f0ff' : '#0f172a'}
            metalness={0.9}
            roughness={0.25}
            emissive={highlighted ? '#00f0ff' : '#000000'}
            emissiveIntensity={highlighted ? 0.35 : 0}
          />
        </mesh>

        {/* 4x M3 Socket Head Mounting Screws (19x16mm pattern) */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2 + Math.PI / 4;
          return (
            <group key={i} position={[Math.cos(angle) * 0.25, 0.05, Math.sin(angle) * 0.25]}>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
              </mesh>
              {/* Hex Socket */}
              <mesh position={[0, 0.041, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.005, 6]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            </group>
          );
        })}

        {/* Lower Steel Ball Bearing */}
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.05} />
        </mesh>

        {/* 3x Silicone High-Temp Flexible Phase Leads */}
        {[-0.08, 0, 0.08].map((dx, idx) => {
          const wireColor = idx === 0 ? '#ef4444' : idx === 1 ? '#0284c7' : '#0f172a';
          return (
            <group key={idx} position={[dx, 0.02, 0.35]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.022, 0.25, 12]} />
                <meshStandardMaterial color={wireColor} roughness={0.6} />
              </mesh>
              {/* Gold 3.5mm Bullet Male Terminal */}
              <mesh position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.028, 0.028, 0.08, 16]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 2. 12-SLOT STATOR CORE WITH ENAMELED COPPER WINDINGS */}
      <group position={[0, 0.22, 0]}>
        {/* Laminated Silicon Steel Stator Core */}
        <mesh>
          <cylinderGeometry args={[0.26, 0.26, 0.24, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* 12 Individual Copper Windings (Individually Modeled Coils) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / 12;
          return (
            <group key={i} position={[Math.cos(angle) * 0.22, 0, Math.sin(angle) * 0.22]} rotation={[0, -angle, 0]}>
              <mesh>
                <boxGeometry args={[0.07, 0.21, 0.08]} />
                <meshStandardMaterial
                  color="#b45309"
                  metalness={0.65}
                  roughness={0.3}
                />
              </mesh>
              {/* Copper Wire Sheen Stripe */}
              <mesh position={[0.038, 0, 0]}>
                <boxGeometry args={[0.005, 0.2, 0.075]} />
                <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 3. 14-POLE ROTATING BELL & SHAFT (Rotor) */}
      <group ref={rotorRef} position={[0, 0.28 + exp, 0]}>
        {/* Upper Precision Ball Bearing */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 24]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.05} />
        </mesh>

        {/* Rotor Bell Outer Aluminum Wall with Anodized Bevel */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.37, 0.37, 0.32, 36, 1, true]} />
          <meshStandardMaterial
            color={highlighted ? '#38bdf8' : '#090d16'}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* 14 N52 NdFeB Arc Magnets (Lining inside of bell) */}
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / 14;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.355, 0.08, Math.sin(angle) * 0.355]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.015, 0.28, 0.06]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
            </mesh>
          );
        })}

        {/* CNC Machined Rotor Top Cap with Aerodynamic Spoke Vents */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.37, 0.37, 0.05, 36]} />
          <meshStandardMaterial color={cw ? '#0284c7' : '#0f172a'} metalness={0.88} roughness={0.22} />
        </mesh>

        {/* 6x CNC Cooling Cutout Vents */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / 6;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.22, 0.25, Math.sin(angle) * 0.22]}>
              <cylinderGeometry args={[0.045, 0.045, 0.06, 16]} />
              <meshStandardMaterial color="#020617" />
            </mesh>
          );
        })}

        {/* Dynamic Rotor Balancing Blue Putty Dab (True Manufacturing Detail) */}
        <mesh position={[0.26, 0.18, 0.18]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#2563eb" roughness={0.8} />
        </mesh>

        {/* Hardened SUS420 Stainless Steel Motor Shaft (3.17mm / 4mm) */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.44, 24]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.04} />
        </mesh>

        {/* Propeller Mount Knurled Flange */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Anodized Aluminum Self-Locking Prop Nut (Black for CW, Silver for CCW) */}
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.09, 0.18, 24]} />
          <meshStandardMaterial
            color={cw ? '#090d16' : '#cbd5e1'}
            metalness={0.92}
            roughness={0.15}
          />
        </mesh>

        {/* Laser Etched Motor Model Specs (2212 920KV) */}
        <mesh position={[0, 0.12, 0.372]}>
          <boxGeometry args={[0.22, 0.04, 0.002]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};
