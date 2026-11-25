import React from 'react';
import { BLDCMotorModel } from './BLDCMotorModel';
import { ESCModel } from './ESCModel';
import { PropellerModel } from './PropellerModel';
import { LiPoBatteryModel } from './LiPoBatteryModel';
import { FlightControllerModel } from './FlightControllerModel';
import { GPSModuleModel } from './GPSModuleModel';
import { getCarbonFiberTexture } from '../../utils/textureGenerator';

interface QuadcopterModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  spinning?: boolean;
  throttle?: number;
  explodedFactor?: number; // 0 (assembled) to 1 (fully exploded)
  highlightedComponent?: string | null;
  onSelectComponent?: (name: string) => void;
  showWiring?: boolean;
  showMotorLabels?: boolean;
}

export const QuadcopterModel: React.FC<QuadcopterModelProps> = ({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  spinning = false,
  throttle = 0,
  explodedFactor = 0,
  highlightedComponent = null,
  onSelectComponent,
  showWiring = true,
  showMotorLabels = true,
}) => {
  const carbonTex = getCarbonFiberTexture();
  const armLength = 1.35;
  const ef = explodedFactor; // 0 to 1

  // Quad-X Motor layout:
  // M1: Rear Right (CCW)
  // M2: Front Right (CW)
  // M3: Rear Left (CW)
  // M4: Front Left (CCW)
  const motors = [
    { id: 1, name: 'Motor 1 (Rear Right)', x: armLength * 0.707, z: armLength * 0.707, cw: false, label: 'M1 (CCW)' },
    { id: 2, name: 'Motor 2 (Front Right)', x: armLength * 0.707, z: -armLength * 0.707, cw: true, label: 'M2 (CW)' },
    { id: 3, name: 'Motor 3 (Rear Left)', x: -armLength * 0.707, z: armLength * 0.707, cw: true, label: 'M3 (CW)' },
    { id: 4, name: 'Motor 4 (Front Left)', x: -armLength * 0.707, z: -armLength * 0.707, cw: false, label: 'M4 (CCW)' },
  ];

  const isHl = (name: string) => highlightedComponent === name;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. CARBON FIBER TOP PLATE (3K Matte Twill Weave with CNC Lightening Cutouts) */}
      <group
        position={[0, 0.12 + ef * 0.7, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Carbon-Fibre Drone Frame');
        }}
      >
        <mesh>
          <cylinderGeometry args={[0.54, 0.54, 0.032, 8]} />
          <meshStandardMaterial
            map={carbonTex}
            color={isHl('Carbon-Fibre Drone Frame') ? '#00f0ff' : '#141822'}
            metalness={0.65}
            roughness={0.3}
            emissive={isHl('Carbon-Fibre Drone Frame') ? '#00f0ff' : '#000000'}
            emissiveIntensity={isHl('Carbon-Fibre Drone Frame') ? 0.35 : 0}
          />
        </mesh>
        {/* CNC Beveled Chamfer Edge Ring */}
        <mesh position={[0, 0.017, 0]}>
          <cylinderGeometry args={[0.52, 0.54, 0.005, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* M3 Black Hex Socket Assembly Screws */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const angle = (i * Math.PI) / 4;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.44, 0.02, Math.sin(angle) * 0.44]}>
              <cylinderGeometry args={[0.028, 0.028, 0.02, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          );
        })}
      </group>

      {/* 2. BRASS / ALUMINUM CNC STANDOFF COLUMNS (Connecting Upper & Lower Plates) */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        return (
          <group key={i} position={[Math.cos(angle) * 0.38, 0.04, Math.sin(angle) * 0.38]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.035, 0.16 + ef * 0.5, 6]} />
              <meshStandardMaterial color="#0284c7" metalness={0.88} roughness={0.25} />
            </mesh>
          </group>
        );
      })}

      {/* 3. FLIGHT CONTROLLER (Mounted with Vibration Damping Bobbins) */}
      <group
        position={[0, 0.18 + ef * 1.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Flight Controller');
        }}
      >
        <FlightControllerModel
          scale={0.55}
          highlighted={isHl('Flight Controller')}
          onSelect={() => onSelectComponent?.('Flight Controller')}
        />
      </group>

      {/* 4. GPS MODULE & CARBON MAST */}
      <group
        position={[0, 0.14 + ef * 1.8, 0.28]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('GPS Module');
        }}
      >
        <GPSModuleModel
          scale={0.55}
          highlighted={isHl('GPS Module')}
          onSelect={() => onSelectComponent?.('GPS Module')}
        />
      </group>

      {/* 5. POWER DISTRIBUTION BOARD (PDB) & ESC POWER BUS */}
      <mesh
        position={[0, 0.02, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Power Distribution Board');
        }}
      >
        <cylinderGeometry args={[0.48, 0.48, 0.025, 8]} />
        <meshStandardMaterial
          color={isHl('Power Distribution Board') ? '#00f0ff' : '#08101a'}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* 6. CARBON FIBER BOTTOM MAIN PLATE */}
      <mesh
        position={[0, -0.06 - ef * 0.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('Carbon-Fibre Drone Frame');
        }}
      >
        <cylinderGeometry args={[0.56, 0.56, 0.035, 8]} />
        <meshStandardMaterial
          map={carbonTex}
          color={isHl('Carbon-Fibre Drone Frame') ? '#00f0ff' : '#141822'}
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>

      {/* 7. 4x 3K CARBON FIBER ARMS WITH MOTORS, ESCs, PROPELLERS */}
      {motors.map((m) => {
        const angle = Math.atan2(m.x, m.z);
        const armDispX = (m.x / armLength) * ef * 0.9;
        const armDispZ = (m.z / armLength) * ef * 0.9;

        return (
          <group key={m.id} position={[armDispX, 0, armDispZ]}>
            {/* Precision 3K Matte Carbon Fiber Structural Arm */}
            <mesh
              position={[m.x * 0.5, 0, m.z * 0.5]}
              rotation={[0, angle, Math.PI / 2]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent?.('Carbon-Fibre Drone Frame');
              }}
            >
              <cylinderGeometry args={[0.048, 0.048, armLength, 20]} />
              <meshStandardMaterial
                map={carbonTex}
                color={isHl('Carbon-Fibre Drone Frame') ? '#00f0ff' : '#141822'}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>

            {/* Aluminum Motor Mount End Clamp with Chamfered Holes */}
            <group position={[m.x, 0.01, m.z]}>
              <mesh>
                <cylinderGeometry args={[0.2, 0.2, 0.04, 24]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>

            {/* High-Detail Brushless DC Motor */}
            <group
              position={[m.x, 0.05 + ef * 0.45, m.z]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent?.('Brushless DC Motor');
              }}
            >
              <BLDCMotorModel
                scale={0.52}
                cw={m.cw}
                spinning={spinning}
                rpm={throttle * 80}
                highlighted={isHl('Brushless DC Motor') || isHl(m.name)}
                onSelect={() => onSelectComponent?.('Brushless DC Motor')}
              />
            </group>

            {/* High-Detail Carbon Fiber Airfoil Propeller */}
            <group position={[m.x, 0.3 + ef * 0.95, m.z]}>
              <PropellerModel
                scale={0.56}
                cw={m.cw}
                spinning={spinning}
                rpm={throttle * 80}
                color="#00f0ff"
                onSelect={() => onSelectComponent?.('Carbon-Fibre Propeller')}
              />
            </group>

            {/* Electronic Speed Controller (ESC) Mounted Under Arm */}
            <group
              position={[m.x * 0.55, -0.08 - ef * 0.35, m.z * 0.55]}
              rotation={[0, angle, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent?.('Electronic Speed Controller (ESC)');
              }}
            >
              <ESCModel
                scale={0.38}
                highlighted={isHl('Electronic Speed Controller (ESC)')}
                onSelect={() => onSelectComponent?.('Electronic Speed Controller (ESC)')}
              />
            </group>

            {/* Exploded View Guide Projection Lines */}
            {ef > 0.1 && (
              <mesh position={[m.x, 0.15, m.z]}>
                <cylinderGeometry args={[0.003, 0.003, ef * 1.2, 8]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
              </mesh>
            )}

            {/* CW/CCW Directional Inspection Pill */}
            {showMotorLabels && (
              <mesh position={[m.x * 1.18, 0.28, m.z * 1.18]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshBasicMaterial color={m.cw ? '#ef4444' : '#10b981'} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 8. LiPo BATTERY SLUNG UNDER FRAME WITH AMASS XT60 CONNECTOR */}
      <group
        position={[0, -0.24 - ef * 0.9, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('LiPo Battery');
        }}
      >
        <LiPoBatteryModel
          scale={0.7}
          cells={4}
          capacityMah={3300}
          highlighted={isHl('LiPo Battery')}
          onSelect={() => onSelectComponent?.('LiPo Battery')}
        />
        {/* Non-Slip Rubberized Battery Mounting Strap with Aluminum Buckle */}
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.44, 0.08, 0.14]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
        <mesh position={[0.23, 0.035, 0]}>
          <boxGeometry args={[0.02, 0.09, 0.16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>
      </group>

      {/* 9. HIGH-CLEARANCE CURVED LANDING SKIDS (Alloy & Carbon) */}
      {[-0.38, 0.38].map((x, i) => (
        <group
          key={i}
          position={[x, -0.26 - ef * 0.7, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.('Landing Gear');
          }}
        >
          {/* Carbon Leg Struts */}
          <mesh position={[0, 0.1, -0.32]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 16]} />
            <meshStandardMaterial map={carbonTex} color="#141822" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.32]}>
            <cylinderGeometry args={[0.025, 0.025, 0.24, 16]} />
            <meshStandardMaterial map={carbonTex} color="#141822" metalness={0.7} />
          </mesh>
          {/* Horizontal Carbon Skid Tube */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.98, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Rubberized End Caps */}
          <mesh position={[0, 0, -0.49]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.49]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* 10. FPV MICRO CAMERA WITH CNC BRACKET ON NOSE */}
      <group
        position={[0, 0.02 + ef * 0.5, -0.48 - ef * 0.6]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent?.('FPV Camera System');
        }}
      >
        <mesh>
          <boxGeometry args={[0.18, 0.18, 0.16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Optical Glass Lens Barrel with Blue Anti-Reflective Coating */}
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.06, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* 11. SILICONE WIRING VISUALIZER (Signal & High-Current Traces) */}
      {showWiring && (
        <group>
          {motors.map((m) => (
            <mesh key={`lead-${m.id}`} position={[m.x * 0.32, 0.015, m.z * 0.32]}>
              <boxGeometry args={[0.018, 0.018, armLength * 0.64]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
