import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLDCMotorModel } from './BLDCMotorModel';
import { PropellerModel } from './PropellerModel';
import { ServoMotorModel } from './ServoMotorModel';
import { getCarbonFiberTexture } from '../../utils/textureGenerator';

interface FixedWingModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  spinning?: boolean;
  throttle?: number;
  aileronAngle?: number; // radians (-0.4 to 0.4)
  elevatorAngle?: number; // radians (-0.4 to 0.4)
  rudderAngle?: number; // radians (-0.4 to 0.4)
  explodedFactor?: number; // 0 to 1
  batteryOffsetZ?: number; // longitudinal position of battery (m) for Exp 8
  showCGMarker?: boolean;
  cgPositionZ?: number; // in local coordinate Z
  highlightedComponent?: string | null;
  onSelectComponent?: (name: string) => void;
}

export const FixedWingModel: React.FC<FixedWingModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  spinning = false,
  throttle = 0,
  aileronAngle = 0,
  elevatorAngle = 0,
  rudderAngle = 0,
  explodedFactor = 0,
  batteryOffsetZ = 0,
  showCGMarker = false,
  cgPositionZ = -0.1,
  highlightedComponent = null,
  onSelectComponent,
}) => {
  const carbonTex = getCarbonFiberTexture();
  const ef = explodedFactor;
  const isHl = (name: string) => highlightedComponent === name;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. AERODYNAMIC FUSELAGE POD (Carbon Fiber & Kevlar Composite) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Fuselage');
        }}
      >
        {/* Main Fuselage Body Shell */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.16, 2.9, 28]} />
          <meshStandardMaterial
            map={carbonTex}
            color={isHl('Fuselage') ? '#00f0ff' : '#141822'}
            metalness={0.7}
            roughness={0.3}
            emissive={isHl('Fuselage') ? '#00f0ff' : '#000000'}
            emissiveIntensity={isHl('Fuselage') ? 0.35 : 0}
          />
        </mesh>

        {/* CNC Firewall Nose Motor Mount with NACA Cooling Inlets */}
        <mesh position={[0, 0, -1.48]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.17, 0.32, 28]} />
          <meshStandardMaterial color="#0284c7" metalness={0.88} roughness={0.2} />
        </mesh>

        {/* NACA Cooling Air Scoops */}
        {[-0.14, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 0.08, -1.1]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.04, 0.03, 0.18]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        ))}

        {/* Cockpit / FPV Avionics Canopy (Smoked Polycarbonate with Carbon Latches) */}
        <mesh position={[0, 0.17, -0.6]}>
          <boxGeometry args={[0.24, 0.14, 0.72]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.95}
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>

      {/* 2. BRUSHLESS MOTOR & FOLDING PROPELLER ON NOSE FIREWALL */}
      <group
        position={[0, 0, -1.62 - ef * 0.55]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Brushless DC Motor');
        }}
      >
        <BLDCMotorModel
          scale={0.52}
          spinning={spinning}
          rpm={throttle * 80}
          highlighted={isHl('Motor') || isHl('Brushless DC Motor')}
          onSelect={() => onSelectComponent?.('Brushless DC Motor')}
        />
      </group>

      <group
        position={[0, 0, -1.86 - ef * 0.95]}
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Carbon-Fibre Propeller');
        }}
      >
        <PropellerModel
          scale={0.68}
          spinning={spinning}
          rpm={throttle * 80}
          color="#00f0ff"
          onSelect={() => onSelectComponent?.('Carbon-Fibre Propeller')}
        />
      </group>

      {/* 3. LEFT MAIN WING WITH AIRFOIL CAMBER, WINGLET & OPERABLE AILERON */}
      <group
        position={[-1.45 - ef * 0.95, 0.06 + ef * 0.35, -0.22]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Left Wing');
        }}
      >
        {/* Main Tapered Wing Semi-Span */}
        <mesh position={[0.55, 0, 0]} rotation={[0, -0.06, 0]}>
          <boxGeometry args={[1.85, 0.045, 0.62]} />
          <meshStandardMaterial
            map={carbonTex}
            color={isHl('Left Wing') ? '#00f0ff' : '#141822'}
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
        {/* Cambered Upper Surface Airfoil Curve */}
        <mesh position={[0.55, 0.024, -0.08]} rotation={[0, -0.06, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 1.85, 20, 1, false, 0, Math.PI]} />
          <meshStandardMaterial map={carbonTex} color="#181d28" roughness={0.3} />
        </mesh>
        {/* Aerodynamic Blended Winglet */}
        <mesh position={[-0.4, 0.12, 0]}>
          <boxGeometry args={[0.035, 0.24, 0.58]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} />
        </mesh>

        {/* Molded Servo Pocket & 9g Servo */}
        <group position={[0.3, -0.015, 0.15]}>
          <ServoMotorModel scale={0.4} angle={aileronAngle} />
        </group>

        {/* Operable Carbon Aileron Control Surface */}
        <group position={[0.55, 0, 0.31]} rotation={[aileronAngle, 0, 0]}>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[1.25, 0.026, 0.17]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Nylon Control Horn & Pushrod Clewis */}
          <mesh position={[-0.25, 0.03, 0.04]}>
            <boxGeometry args={[0.02, 0.06, 0.03]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      </group>

      {/* 4. RIGHT MAIN WING WITH AIRFOIL CAMBER, WINGLET & OPERABLE AILERON */}
      <group
        position={[1.45 + ef * 0.95, 0.06 + ef * 0.35, -0.22]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Right Wing');
        }}
      >
        <mesh position={[-0.55, 0, 0]} rotation={[0, 0.06, 0]}>
          <boxGeometry args={[1.85, 0.045, 0.62]} />
          <meshStandardMaterial
            map={carbonTex}
            color={isHl('Right Wing') ? '#00f0ff' : '#141822'}
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.55, 0.024, -0.08]} rotation={[0, 0.06, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 1.85, 20, 1, false, 0, Math.PI]} />
          <meshStandardMaterial map={carbonTex} color="#181d28" roughness={0.3} />
        </mesh>
        <mesh position={[0.4, 0.12, 0]}>
          <boxGeometry args={[0.035, 0.24, 0.58]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} />
        </mesh>

        <group position={[-0.3, -0.015, 0.15]}>
          <ServoMotorModel scale={0.4} angle={-aileronAngle} />
        </group>

        {/* Operable Right Aileron (Opposite roll deflection) */}
        <group position={[-0.55, 0, 0.31]} rotation={[-aileronAngle, 0, 0]}>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[1.25, 0.026, 0.17]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.5} />
          </mesh>
          <mesh position={[0.25, 0.03, 0.04]}>
            <boxGeometry args={[0.02, 0.06, 0.03]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      </group>

      {/* 5. HORIZONTAL STABILIZER AND ELEVATOR (Empennage) */}
      <group
        position={[0, 0.08 + ef * 0.45, 1.32 + ef * 0.85]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Horizontal Stabilizer');
        }}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.15, 0.028, 0.34]} />
          <meshStandardMaterial
            map={carbonTex}
            color={isHl('Horizontal Stabilizer') ? '#00f0ff' : '#141822'}
          />
        </mesh>
        {/* Operable Elevator Control Surface */}
        <group position={[0, 0, 0.17]} rotation={[elevatorAngle, 0, 0]}>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[1.1, 0.022, 0.18]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* 6. VERTICAL STABILIZER AND RUDDER */}
      <group
        position={[0, 0.38 + ef * 0.65, 1.32 + ef * 0.85]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Vertical Stabilizer');
        }}
      >
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.028, 0.58, 0.38]} />
          <meshStandardMaterial
            map={carbonTex}
            color={isHl('Vertical Stabilizer') ? '#00f0ff' : '#141822'}
          />
        </mesh>
        {/* Operable Rudder Control Surface */}
        <group position={[0, 0, 0.19]} rotation={[0, -rudderAngle, 0]}>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.024, 0.55, 0.16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.6} />
          </mesh>
        </group>
      </group>

      {/* 7. MOVABLE LiPo BATTERY (Experiment 8 Center of Gravity) */}
      <group
        position={[0, -0.02, -0.4 + batteryOffsetZ]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('LiPo Battery');
        }}
      >
        <mesh>
          <boxGeometry args={[0.2, 0.13, 0.48]} />
          <meshStandardMaterial
            color={isHl('LiPo Battery') ? '#00f0ff' : '#eab308'}
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>
      </group>

      {/* 8. CENTER OF GRAVITY (CG) 3D MARKER INDICATOR */}
      {showCGMarker && (
        <group position={[0, -0.02, cgPositionZ]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.016, 12, 32]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.085, 16, 16]} />
            <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.65} />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.64, 8]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </group>
      )}
    </group>
  );
};
