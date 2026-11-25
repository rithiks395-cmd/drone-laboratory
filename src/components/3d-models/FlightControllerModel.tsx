import React from 'react';
import { getPCBTexture } from '../../utils/textureGenerator';

interface FlightControllerModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  highlighted?: boolean;
  onSelect?: () => void;
}

export const FlightControllerModel: React.FC<FlightControllerModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  highlighted = false,
  onSelect,
}) => {
  const pcbTex = getPCBTexture('fc');

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
      {/* 1. 36x36mm MATTE BLACK FR4 PCB WITH ENIG GOLD TRACES */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.72, 0.035, 0.72]} />
        <meshStandardMaterial
          map={pcbTex}
          color={highlighted ? '#00f0ff' : '#0a0d14'}
          metalness={0.4}
          roughness={0.4}
          emissive={highlighted ? '#00f0ff' : '#000000'}
          emissiveIntensity={highlighted ? 0.35 : 0}
        />
      </mesh>

      {/* 2. 4x SILICONE VIBRATION DAMPING BOBBINS / GROMMETS */}
      {[
        [-0.26, -0.26],
        [0.26, -0.26],
        [-0.26, 0.26],
        [0.26, 0.26],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.02, z]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.06, 16]} />
            <meshStandardMaterial color="#f97316" roughness={0.8} />
          </mesh>
          {/* Brass Through-Eyelet */}
          <mesh>
            <cylinderGeometry args={[0.028, 0.028, 0.07, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 3. STM32F405 32-BIT ARM CORTEX-M4 MCU (LQFP-64) */}
      <group position={[0, 0.045, 0.02]}>
        <mesh>
          <boxGeometry args={[0.22, 0.025, 0.22]} />
          <meshStandardMaterial color="#020617" roughness={0.5} />
        </mesh>
        {/* Metallic Lead Pins around periphery */}
        <mesh position={[0, -0.005, 0]}>
          <boxGeometry args={[0.25, 0.012, 0.25]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      </group>

      {/* 4. INVENSENSE MPU6000 6-AXIS IMU GYRO / ACCELEROMETER */}
      <mesh position={[0.16, 0.045, -0.1]}>
        <boxGeometry args={[0.09, 0.02, 0.09]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* 5. USB TYPE-C SOCKET CONNECTOR (Stainless Steel Shell) */}
      <group position={[0, 0.045, -0.36]}>
        <mesh>
          <boxGeometry args={[0.16, 0.05, 0.12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Reversible Plug Mouth */}
        <mesh position={[0, 0, -0.061]}>
          <boxGeometry args={[0.13, 0.03, 0.005]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>

      {/* 6. STATUS INDICATOR LEDs */}
      {/* Power 3.3V Green LED */}
      <mesh position={[-0.2, 0.045, 0.12]}>
        <boxGeometry args={[0.025, 0.015, 0.035]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      {/* Activity Blue LED (Blinking) */}
      <mesh position={[-0.14, 0.045, 0.12]}>
        <boxGeometry args={[0.025, 0.015, 0.035]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* 7. RECESSED BOOT SWITCH PUSHBUTTON */}
      <mesh position={[0.2, 0.045, 0.14]}>
        <boxGeometry args={[0.04, 0.02, 0.04]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
    </group>
  );
};
