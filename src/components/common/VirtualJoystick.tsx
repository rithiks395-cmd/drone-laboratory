import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  label?: string;
  subLabel?: string;
  size?: number; // diameter in px
  springReturnY?: boolean; // false for throttle
  initialY?: number; // e.g. -1 for low throttle
  value?: { x: number; y: number }; // optional controlled value
  onChange: (pos: { x: number; y: number }) => void;
  className?: string;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  label = 'GIMBAL',
  subLabel = 'X / Y',
  size = 130,
  springReturnY = true,
  initialY = 0,
  value,
  onChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: initialY });
  const [isActive, setIsActive] = useState(false);
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 0, y: initialY });
  const touchIdRef = useRef<number | null>(null);

  // Sync external controlled value if provided
  useEffect(() => {
    if (value !== undefined && !isActive) {
      setKnobPos(value);
      currentPosRef.current = value;
    }
  }, [value, isActive]);

  const radius = size / 2;
  const maxTravel = radius * 0.68;

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, maxTravel);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.round(((clampedDistance * Math.cos(angle)) / maxTravel) * 100) / 100;
    const clampedY = Math.round((-(clampedDistance * Math.sin(angle)) / maxTravel) * 100) / 100; // Invert so Up is +1

    const newPos = { x: clampedX, y: clampedY };
    currentPosRef.current = newPos;
    setKnobPos(newPos);
    onChange(newPos);
  }, [maxTravel, onChange]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsActive(true);
    updatePosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updatePosition(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsActive(false);
        const resetY = springReturnY ? 0 : currentPosRef.current.y;
        const finalPos = { x: 0, y: resetY };
        currentPosRef.current = finalPos;
        setKnobPos(finalPos);
        onChange(finalPos);
        break;
      }
    }
  };

  // Mouse fallback handlers for PC testing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsActive(true);
    updatePosition(e.clientX, e.clientY);

    const onMouseMove = (moveEvent: MouseEvent) => {
      updatePosition(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      setIsActive(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      const resetY = springReturnY ? 0 : currentPosRef.current.y;
      const finalPos = { x: 0, y: resetY };
      currentPosRef.current = finalPos;
      setKnobPos(finalPos);
      onChange(finalPos);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Gimbal Label & Activity Indicator */}
      <div className="text-[10px] font-mono text-slate-300 mb-1 flex items-center gap-1.5 font-bold tracking-wider uppercase">
        <span className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-cyan-400 shadow-glow-cyan animate-ping' : 'bg-slate-600'}`}></span>
        <span>{label}</span>
      </div>

      {/* Outer Joystick Pad Ring */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{ width: size, height: size, touchAction: 'none' }}
        className={`relative rounded-full bg-slate-950/90 border-2 transition-all cursor-pointer flex items-center justify-center shadow-2xl ${
          isActive ? 'border-cyan-400 shadow-glow-cyan' : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        {/* Cardinal Crosshairs */}
        <div className="absolute w-full h-[1px] bg-slate-800/80 pointer-events-none"></div>
        <div className="absolute h-full w-[1px] bg-slate-800/80 pointer-events-none"></div>

        {/* Outer Guide Rings */}
        <div
          style={{ width: size * 0.7, height: size * 0.7 }}
          className="absolute rounded-full border border-dashed border-slate-700/50 pointer-events-none"
        ></div>
        <div
          style={{ width: size * 0.4, height: size * 0.4 }}
          className="absolute rounded-full border border-slate-800 pointer-events-none"
        ></div>

        {/* Central Thumbstick Knob */}
        <div
          style={{
            transform: `translate(${knobPos.x * maxTravel}px, ${-knobPos.y * maxTravel}px)`,
            width: size * 0.38,
            height: size * 0.38,
          }}
          className={`absolute rounded-full flex items-center justify-center pointer-events-none transition-shadow ${
            isActive
              ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-glow-cyan border-2 border-white'
              : 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600'
          }`}
        >
          {/* Inner Gripping Ridges */}
          <div className="w-3 h-3 rounded-full bg-slate-950/60 flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-cyan-400/80'}`}></div>
          </div>
        </div>
      </div>

      {/* Numerical Live Coordinate Readout */}
      <div className="text-[10px] font-mono text-cyan-400/90 mt-1 font-semibold tracking-tight">
        {springReturnY ? (
          <span>P:{Math.round(knobPos.y * 100)}% | R:{Math.round(knobPos.x * 100)}%</span>
        ) : (
          <span>THR:{Math.round(((knobPos.y + 1) / 2) * 100)}% | YAW:{Math.round(knobPos.x * 100)}%</span>
        )}
      </div>
    </div>
  );
};
