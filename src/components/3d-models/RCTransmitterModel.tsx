import React from 'react';

interface RCTransmitterModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  leftStick?: { x: number; y: number }; // -1 to 1 (yaw, throttle)
  rightStick?: { x: number; y: number }; // -1 to 1 (roll, pitch)
  bound?: boolean;
}

export const RCTransmitterModel: React.FC<RCTransmitterModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  leftStick = { x: 0, y: 0 },
  rightStick = { x: 0, y: 0 },
  bound = true,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Ergonomic Transmitter Body */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.8, 0.4, 2.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* Side Hand Grips (Textured Rubber) */}
      {[-0.92, 0.92].map((x, i) => (
        <mesh key={i} position={[x, 0.18, 0]}>
          <boxGeometry args={[0.08, 0.35, 1.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
      ))}

      {/* 2.4GHz Antenna at Top */}
      <group position={[0, 0.4, -1.1]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.7, 16]} />
          <meshStandardMaterial color="#020617" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      </group>

      {/* Metal Top Carry Handle */}
      <mesh position={[0, 0.45, -0.9]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.3, 0.03, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Blue Graphic Dot-Matrix LCD Screen */}
      <mesh position={[0, 0.41, 0.45]}>
        <boxGeometry args={[0.9, 0.02, 0.6]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Left Gimbal Assembly (Throttle & Yaw) */}
      <group position={[-0.5, 0.41, -0.3]}>
        {/* Gimbal Bezel Ring */}
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Draggable/Movable Stick Gimbal */}
        <group
          position={[0, 0.02, 0]}
          rotation={[leftStick.y * 0.35, 0, -leftStick.x * 0.35]}
        >
          {/* Gimbal Ball Base */}
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#020617" metalness={0.5} />
          </mesh>
          {/* Knurled Aluminum Stick Post */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
            <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Spiked Stick Crown / Cap */}
          <mesh position={[0, 0.38, 0]}>
            <coneGeometry args={[0.045, 0.06, 12]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Right Gimbal Assembly (Pitch & Roll) */}
      <group position={[0.5, 0.41, -0.3]}>
        {/* Gimbal Bezel Ring */}
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.04, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        {/* Draggable/Movable Stick Gimbal */}
        <group
          position={[0, 0.02, 0]}
          rotation={[rightStick.y * 0.35, 0, -rightStick.x * 0.35]}
        >
          {/* Gimbal Ball Base */}
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#020617" metalness={0.5} />
          </mesh>
          {/* Knurled Aluminum Stick Post */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.3, 12]} />
            <meshStandardMaterial color="#00f0ff" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Spiked Stick Crown / Cap */}
          <mesh position={[0, 0.38, 0]}>
            <coneGeometry args={[0.045, 0.06, 12]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Digital 4-Way Trim Switches */}
      {/* Throttle Trim (Vertical left of left stick) */}
      <mesh position={[-0.15, 0.41, -0.3]}>
        <boxGeometry args={[0.04, 0.02, 0.16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      {/* Yaw Trim (Horizontal below left stick) */}
      <mesh position={[-0.5, 0.41, 0.08]}>
        <boxGeometry args={[0.16, 0.02, 0.04]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      {/* Pitch Trim (Vertical right of right stick) */}
      <mesh position={[0.15, 0.41, -0.3]}>
        <boxGeometry args={[0.04, 0.02, 0.16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      {/* Roll Trim (Horizontal below right stick) */}
      <mesh position={[0.5, 0.41, 0.08]}>
        <boxGeometry args={[0.16, 0.02, 0.04]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      {/* RF Binding / Power Indicator LED */}
      <mesh position={[0, 0.41, -0.6]}>
        <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
        <meshBasicMaterial color={bound ? '#10b981' : '#ef4444'} />
      </mesh>

      {/* Power Slide Switch */}
      <mesh position={[0, 0.42, 0.9]}>
        <boxGeometry args={[0.12, 0.03, 0.06]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};
