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
  // Step-by-step puzzle progressive visibility flags:
  showFrame?: boolean;
  showArms?: boolean;
  showMotors?: boolean;
  showESCs?: boolean;
  showFC?: boolean;
  showBattery?: boolean;
  showProps?: boolean;
  showGhostBlueprint?: boolean;
  activePuzzleStep?: number;
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
  showFrame = true,
  showArms = true,
  showMotors = true,
  showESCs = true,
  showFC = true,
  showBattery = true,
  showProps = true,
  showGhostBlueprint = false,
  activePuzzleStep = 1,
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
      
      {/* =========================================================================
          HOLOGRAPHIC PUZZLE BLUEPRINT GHOST OUTLINES (Target placement guides)
          ========================================================================= */}
      {showGhostBlueprint && (
        <group>
          {/* Step 1 Blueprint Ghost: Frame Center Plate */}
          {!showFrame && (
            <group position={[0, 0.05, 0]}>
              <mesh>
                <cylinderGeometry args={[0.55, 0.55, 0.08, 8]} />
                <meshStandardMaterial
                  color={activePuzzleStep === 1 ? '#f59e0b' : '#00f0ff'}
                  wireframe
                  emissive={activePuzzleStep === 1 ? '#f59e0b' : '#00f0ff'}
                  emissiveIntensity={activePuzzleStep === 1 ? 0.8 : 0.2}
                />
              </mesh>
            </group>
          )}

          {/* Step 2 Blueprint Ghost: 4 Arm Struts */}
          {!showArms && (
            <group>
              {motors.map((m) => {
                const angle = Math.atan2(m.x, m.z);
                return (
                  <mesh
                    key={`ghost_arm_${m.id}`}
                    position={[m.x * 0.5, 0, m.z * 0.5]}
                    rotation={[0, angle, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.048, 0.048, armLength, 8]} />
                    <meshStandardMaterial
                      color={activePuzzleStep === 2 ? '#f59e0b' : '#00f0ff'}
                      wireframe
                      emissive={activePuzzleStep === 2 ? '#f59e0b' : '#00f0ff'}
                      emissiveIntensity={activePuzzleStep === 2 ? 0.8 : 0.15}
                    />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Step 3 Blueprint Ghost: 4 BLDC Motors */}
          {!showMotors && (
            <group>
              {motors.map((m) => (
                <mesh key={`ghost_mot_${m.id}`} position={[m.x, 0.1, m.z]}>
                  <cylinderGeometry args={[0.18, 0.18, 0.22, 12]} />
                  <meshStandardMaterial
                    color={activePuzzleStep === 3 ? '#f59e0b' : '#00f0ff'}
                    wireframe
                    emissive={activePuzzleStep === 3 ? '#f59e0b' : '#00f0ff'}
                    emissiveIntensity={activePuzzleStep === 3 ? 0.8 : 0.15}
                  />
                </mesh>
              ))}
            </group>
          )}

          {/* Step 4 Blueprint Ghost: 4 ESCs */}
          {!showESCs && (
            <group>
              {motors.map((m) => {
                const angle = Math.atan2(m.x, m.z);
                return (
                  <mesh
                    key={`ghost_esc_${m.id}`}
                    position={[m.x * 0.55, -0.08, m.z * 0.55]}
                    rotation={[0, angle, 0]}
                  >
                    <boxGeometry args={[0.35, 0.08, 0.18]} />
                    <meshStandardMaterial
                      color={activePuzzleStep === 4 ? '#f59e0b' : '#00f0ff'}
                      wireframe
                      emissive={activePuzzleStep === 4 ? '#f59e0b' : '#00f0ff'}
                      emissiveIntensity={activePuzzleStep === 4 ? 0.8 : 0.15}
                    />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Step 5 Blueprint Ghost: Flight Controller */}
          {!showFC && (
            <group position={[0, 0.18, 0]}>
              <mesh>
                <boxGeometry args={[0.55, 0.06, 0.55]} />
                <meshStandardMaterial
                  color={activePuzzleStep === 5 ? '#f59e0b' : '#00f0ff'}
                  wireframe
                  emissive={activePuzzleStep === 5 ? '#f59e0b' : '#00f0ff'}
                  emissiveIntensity={activePuzzleStep === 5 ? 0.8 : 0.15}
                />
              </mesh>
            </group>
          )}

          {/* Step 6 Blueprint Ghost: LiPo Battery */}
          {!showBattery && (
            <group position={[0, -0.22, 0]}>
              <mesh>
                <boxGeometry args={[0.9, 0.32, 0.45]} />
                <meshStandardMaterial
                  color={activePuzzleStep === 6 ? '#f59e0b' : '#00f0ff'}
                  wireframe
                  emissive={activePuzzleStep === 6 ? '#f59e0b' : '#00f0ff'}
                  emissiveIntensity={activePuzzleStep === 6 ? 0.8 : 0.15}
                />
              </mesh>
            </group>
          )}

          {/* Step 8 Blueprint Ghost: 4 Propellers */}
          {!showProps && (
            <group>
              {motors.map((m) => (
                <mesh key={`ghost_prop_${m.id}`} position={[m.x, 0.32, m.z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.4, 0.55, 24]} />
                  <meshStandardMaterial
                    color={activePuzzleStep === 8 ? '#f59e0b' : '#00f0ff'}
                    wireframe
                    emissive={activePuzzleStep === 8 ? '#f59e0b' : '#00f0ff'}
                    emissiveIntensity={activePuzzleStep === 8 ? 0.8 : 0.15}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      {/* =========================================================================
          SOLID 3D COMPONENTS (RENDERED ONLY WHEN INSTALLED BY THE USER)
          ========================================================================= */}

      {/* 1. CARBON FIBER TOP PLATE & STANDOFFS (Rendered when Frame is installed) */}
      {showFrame && (
        <>
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
            <mesh position={[0, 0.017, 0]}>
              <cylinderGeometry args={[0.52, 0.54, 0.005, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
            </mesh>
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

          {/* Standoff Columns */}
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

          {/* Power Distribution Board */}
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

          {/* Bottom Main Plate */}
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
        </>
      )}

      {/* 2. ARMS, MOTORS, ESCs, PROPELLERS */}
      {motors.map((m) => {
        const angle = Math.atan2(m.x, m.z);
        const armDispX = (m.x / armLength) * ef * 0.9;
        const armDispZ = (m.z / armLength) * ef * 0.9;

        return (
          <group key={m.id} position={[armDispX, 0, armDispZ]}>
            {/* PA66 Structural Arms (Rendered when Arms installed) */}
            {showArms && (
              <>
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
                    color={m.id <= 2 ? '#ef4444' : '#f8fafc'}
                    metalness={0.7}
                    roughness={0.3}
                  />
                </mesh>

                {/* Motor Mount Clamp */}
                <group position={[m.x, 0.01, m.z]}>
                  <mesh>
                    <cylinderGeometry args={[0.2, 0.2, 0.04, 24]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
                  </mesh>
                </group>
              </>
            )}

            {/* BLDC Motor (Rendered when Motors installed) */}
            {showMotors && (
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
            )}

            {/* Electronic Speed Controller (ESC) (Rendered when ESCs installed) */}
            {showESCs && (
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
            )}

            {/* Propellers (Rendered when Propellers installed) */}
            {showProps && (
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
            )}

            {/* Directional CW/CCW Marker */}
            {showMotorLabels && showMotors && (
              <mesh position={[m.x * 1.18, 0.28, m.z * 1.18]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshBasicMaterial color={m.cw ? '#ef4444' : '#10b981'} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 3. FLIGHT CONTROLLER (Rendered when FC installed) */}
      {showFC && (
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
      )}

      {/* 4. LiPo BATTERY (Rendered when Battery installed) */}
      {showBattery && (
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
        </group>
      )}
    </group>
  );
};
