import React from 'react';

interface ServoMotorModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  angle?: number; // Horn deflection angle (radians)
  highlighted?: boolean;
  onSelect?: () => void;
}

export const ServoMotorModel: React.FC<ServoMotorModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  angle = 0,
  highlighted = false,
  onSelect,
}) => {
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
      {/* 1. MOLDED SERVO CASING (Translucent Deep Blue Polycarbonate) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.24, 0.46, 0.44]} />
        <meshStandardMaterial
          color={highlighted ? '#00f0ff' : '#0284c7'}
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.88}
          emissive={highlighted ? '#00f0ff' : '#000000'}
          emissiveIntensity={highlighted ? 0.35 : 0}
        />
      </mesh>

      {/* 2. MOUNTING FLANGES WITH EYELETS */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.64]} />
        <meshStandardMaterial color="#0369a1" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Eyelet screw holes */}
      {[-0.26, 0.26].map((z, i) => (
        <mesh key={i} position={[0, 0.08, z]}>
          <cylinderGeometry args={[0.025, 0.025, 0.05, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      ))}

      {/* 3. INTERNAL ALLOY GEAR TRAIN TOWER */}
      <mesh position={[0, 0.26, -0.09]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 20]} />
        <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 4. 25T PRECISION BRASS OUTPUT SPLINE SHAFT */}
      <mesh position={[0, 0.32, -0.09]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 24]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* 5. NYLON DUAL-ARM SERVO HORN WITH LINKAGE HOLES (Rotates with angle) */}
      <group position={[0, 0.34, -0.09]} rotation={[0, angle, 0]}>
        {/* Hub Disc */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.025, 20]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Arm Bar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.045, 0.025, 0.36]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Linkage Pin Holes */}
        {[-0.14, -0.08, 0.08, 0.14].map((pz, idx) => (
          <mesh key={idx} position={[0, 0.015, pz]}>
            <cylinderGeometry args={[0.01, 0.01, 0.03, 8]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
        ))}

        {/* Center M2 Steel Retaining Screw */}
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.01, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* Stainless Steel Linkage Pushrod Wire */}
        <mesh position={[0, 0.025, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.32, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* 6. 3-WIRE SILICONE HARNESS (Orange Signal, Red 5V, Brown GND) */}
      <group position={[0, -0.22, 0.14]}>
        {[-0.04, 0, 0.04].map((x, idx) => (
          <mesh key={idx} position={[x, -0.08, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
            <meshStandardMaterial
              color={idx === 0 ? '#f97316' : idx === 1 ? '#ef4444' : '#451a03'}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
