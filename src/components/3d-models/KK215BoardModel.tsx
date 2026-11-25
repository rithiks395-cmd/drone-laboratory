import React from 'react';

interface KK215BoardModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  highlighted?: boolean;
  activeButtonIndex?: number; // 0: BACK, 1: DOWN, 2: UP, 3: ENTER
  onButtonClick?: (index: number) => void;
}

export const KK215BoardModel: React.FC<KK215BoardModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  highlighted = false,
  activeButtonIndex = -1,
  onButtonClick,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 50x50mm Main Black FR4 PCB */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.5, 0.04, 1.5]} />
        <meshStandardMaterial
          color={highlighted ? '#00f0ff' : '#090d16'}
          roughness={0.4}
          metalness={0.2}
          emissive={highlighted ? '#00f0ff' : '#000000'}
          emissiveIntensity={highlighted ? 0.25 : 0}
        />
      </mesh>

      {/* 4 Corner Mounting Holes (3mm) */}
      {[
        [-0.65, -0.65],
        [0.65, -0.65],
        [-0.65, 0.65],
        [0.65, 0.65],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.045, z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      ))}

      {/* LCD Metal Bezel Frame */}
      <mesh position={[0, 0.06, -0.15]}>
        <boxGeometry args={[1.1, 0.03, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 128x64 Graphic LCD Glass (Blue-Cyan Backlit) */}
      <mesh position={[0, 0.08, -0.15]}>
        <boxGeometry args={[0.96, 0.02, 0.68]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.1}
          metalness={0.1}
          emissive="#00f0ff"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* 4 Tactile Microswitch Buttons below LCD (BACK, DOWN, UP, ENTER) */}
      {[-0.45, -0.15, 0.15, 0.45].map((x, i) => {
        const isPressed = activeButtonIndex === i;
        return (
          <group
            key={i}
            position={[x, 0.05, 0.42]}
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick?.(i);
            }}
          >
            {/* Metal tactile switch body */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.04, 0.18]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            {/* Red / Orange tactile actuator button */}
            <mesh position={[0, isPressed ? 0.02 : 0.04, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
              <meshStandardMaterial
                color={isPressed ? '#ef4444' : '#f97316'}
                roughness={0.3}
                emissive={isPressed ? '#ef4444' : '#000000'}
                emissiveIntensity={isPressed ? 0.5 : 0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Piezo Buzzer (Cylindrical black casing with sound hole) */}
      <group position={[0.5, 0.1, 0.15]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.12, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 12]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>

      {/* InvenSense MPU6050 Gyro/Accel IC chip */}
      <mesh position={[-0.5, 0.05, 0.15]}>
        <boxGeometry args={[0.16, 0.02, 0.16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Atmega644PA Main MCU QFP package */}
      <mesh position={[0, 0.045, 0.15]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.24, 0.02, 0.24]} />
        <meshStandardMaterial color="#020617" roughness={0.4} />
      </mesh>

      {/* Forward Orientation White Arrow */}
      <mesh position={[0, 0.045, -0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.16, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Servo Pin Headers (M1-M8 Motor outputs on Right side) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={`m-${i}`} position={[0.68, 0.07, -0.55 + i * 0.14]}>
          {[-0.03, 0, 0.03].map((dx, p) => (
            <mesh key={p} position={[dx, 0.04, 0]}>
              <boxGeometry args={[0.015, 0.1, 0.015]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Receiver Input Header Pins (Left side) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <group key={`rx-${i}`} position={[-0.68, 0.07, -0.35 + i * 0.14]}>
          {[-0.03, 0, 0.03].map((dx, p) => (
            <mesh key={p} position={[dx, 0.04, 0]}>
              <boxGeometry args={[0.015, 0.1, 0.015]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
