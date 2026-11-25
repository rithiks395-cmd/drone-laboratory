import React from 'react';

interface BalanceStandModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const BalanceStandModel: React.FC<BalanceStandModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Heavy Base Plate with Leveling Screws */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.4, 0.1, 1.0]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Spirit Bubble Level Vial on Base */}
      <mesh position={[0, 0.11, 0.35]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={0.4} />
      </mesh>

      {/* Left Upright Aluminum Stanchion */}
      <group position={[-0.45, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 1.2, 0.14]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Neodymium Magnet Cup on Left Pillar */}
        <mesh position={[0.05, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Right Upright Aluminum Stanchion */}
      <group position={[0.45, 0.7, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 1.2, 0.14]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Neodymium Magnet Cup on Right Pillar */}
        <mesh position={[-0.05, 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Ground Steel Arbor / Spindle (Suspended magnetically between pillars) */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.96, 16]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.05} />
      </mesh>

      {/* Tapered Centering Cones on the shaft */}
      <mesh position={[-0.1, 1.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.12, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} />
      </mesh>
      <mesh position={[0.1, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.12, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} />
      </mesh>
    </group>
  );
};
