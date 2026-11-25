import React, { ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Stars, Sky } from '@react-three/drei';
import { useLab } from '../../context/LabContext';

interface Scene3DProps {
  children: ReactNode;
  cameraPosition?: [number, number, number];
  controls?: boolean;
  grid?: boolean;
  stars?: boolean;
  className?: string;
  fov?: number;
  minDistance?: number;
  maxDistance?: number;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  children,
  cameraPosition = [3, 2.5, 3],
  controls = true,
  grid = true,
  stars = true,
  className = 'w-full h-full min-h-[350px]',
  fov = 45,
  minDistance = 0.5,
  maxDistance = 30,
}) => {
  const { atmosphereTheme, graphicsQuality } = useLab();
  const isDay = atmosphereTheme === 'day';

  return (
    <div
      style={{ touchAction: 'none' }}
      className={`relative ${className} overflow-hidden rounded-xl border transition-colors duration-500 ${
        isDay
          ? 'border-sky-300/40 bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#e0f2fe] shadow-lg'
          : 'border-cyan-500/20 bg-gradient-to-b from-[#080d1a] to-[#04060c]'
      }`}
    >
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: graphicsQuality === 'high' }}
        dpr={graphicsQuality === 'high' ? [1, 2] : [1, 1]}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={cameraPosition} fov={fov} />

        {isDay ? (
          <>
            {/* DAYTIME ATMOSPHERE & LIGHTING */}
            <Sky
              distance={450000}
              sunPosition={[100, 45, 100]}
              inclination={0.49}
              azimuth={0.25}
              turbidity={6}
              rayleigh={1.2}
              mieCoefficient={0.005}
              mieDirectionalG={0.8}
            />
            {/* Natural Sunlight & Ambient */}
            <ambientLight intensity={0.85} color="#ffffff" />
            <directionalLight
              position={[20, 40, 20]}
              intensity={1.6}
              color="#fffbeb"
              castShadow
            />
            <directionalLight
              position={[-20, 20, -10]}
              intensity={0.5}
              color="#bae6fd"
            />
            <hemisphereLight
              args={['#bae6fd', '#365314', 0.6]} // Sky blue to Grass ground reflectance
            />

            {/* Daytime Runway & Airfield Ground Turf */}
            <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[120, 120]} />
              <meshStandardMaterial color="#2d4a1d" roughness={0.9} metalness={0.05} />
            </mesh>

            {/* Asphalt Airfield Runway Strip */}
            <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[14, 100]} />
              <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.1} />
            </mesh>
            {/* White Runway Centerline Dashes */}
            {[-30, -20, -10, 0, 10, 20, 30].map((z, i) => (
              <mesh key={i} position={[0, -0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.6, 5]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}

            {grid && (
              <Grid
                position={[0, -0.005, 0]}
                args={[30, 30]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#cbd5e1"
                sectionSize={5}
                sectionThickness={1.0}
                sectionColor="#38bdf8"
                fadeDistance={25}
                fadeStrength={1.5}
              />
            )}
          </>
        ) : (
          <>
            {/* NIGHT / AEROSPACE HUD DARK ATMOSPHERE */}
            <ambientLight intensity={0.65} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} />
            <directionalLight position={[-10, 10, -5]} intensity={0.5} color="#38bdf8" />
            <pointLight position={[0, -2, 0]} intensity={0.4} color="#00f0ff" />

            {stars && <Stars radius={50} depth={30} count={1200} factor={3} saturation={0.5} fade speed={1} />}

            {grid && (
              <Grid
                position={[0, -0.01, 0]}
                args={[20, 20]}
                cellSize={0.5}
                cellThickness={0.7}
                cellColor="#1e3a5f"
                sectionSize={2}
                sectionThickness={1.2}
                sectionColor="#00f0ff"
                fadeDistance={20}
                fadeStrength={1.5}
              />
            )}
          </>
        )}

        <Suspense fallback={null}>
          {children}
        </Suspense>

        {controls && (
          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            minDistance={minDistance}
            maxDistance={maxDistance}
            rotateSpeed={0.8}
            zoomSpeed={1.0}
            panSpeed={0.8}
          />
        )}
      </Canvas>

      {/* Touch & Gesture Navigation Watermark */}
      <div
        className={`absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono flex items-center gap-2 ${
          isDay ? 'text-slate-700 bg-white/70 px-2 py-0.5 rounded shadow' : 'text-cyan-400/70'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isDay ? 'bg-amber-500' : 'bg-cyan-400 animate-pulse'}`}></span>
        <span className="hidden sm:inline">1-FINGER: ROTATE | 2-FINGER PINCH: ZOOM | 2-FINGER DRAG: PAN</span>
        <span className="sm:hidden">TOUCH: ROTATE / PINCH-ZOOM</span>
      </div>
    </div>
  );
};
