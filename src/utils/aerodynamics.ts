/**
 * UAV Virtual Lab - Engineering Calculations & Aerodynamic Assumptions
 * All calculations use established aeronautical equations.
 * Note: Simulation approximations are for educational purposes.
 */

export const AIR_DENSITY_SEA_LEVEL = 1.225; // kg/m^3 at 15°C, 1013.25 hPa

/**
 * Motor & Propeller Thrust Estimation (Empirical Actuator Disk & Momentum Model)
 * @param kv Motor KV rating (RPM / Volt)
 * @param voltage Operating battery voltage (V)
 * @param diameterInches Propeller diameter in inches
 * @param pitchInches Propeller pitch in inches
 * @param throttlePct Throttle percentage (0 - 100)
 * @param blades Number of blades (default 2)
 */
export function calculatePropulsionMetrics(
  kv: number,
  voltage: number,
  diameterInches: number,
  pitchInches: number,
  throttlePct: number,
  blades: number = 2
) {
  const throttle = Math.max(0, Math.min(100, throttlePct)) / 100;
  
  // No-load RPM vs loaded RPM (load factor increases with diameter and pitch)
  const noLoadRpm = kv * voltage * throttle;
  const loadCoefficient = 1 + (diameterInches * 0.045) + (pitchInches * 0.035) + (blades === 3 ? 0.08 : 0);
  const loadedRpm = noLoadRpm / loadCoefficient;

  if (loadedRpm <= 100 || throttle === 0) {
    return {
      rpm: 0,
      thrustGrams: 0,
      thrustNewtons: 0,
      powerWatts: 0,
      currentAmps: 0,
      efficiencyGpW: 0,
      pitchSpeedKmh: 0,
    };
  }

  // Pitch speed in km/h: (RPM * pitch in inches * 60) / (12 * 5280) * 1.60934
  const pitchSpeedKmh = (loadedRpm * pitchInches * 0.0254 * 60) / 1000;

  // Empirical static thrust formula for UAV props (Grams)
  // Thrust proportional to (RPM)^2 * D^3.5 * sqrt(pitch)
  const bladeMultiplier = blades === 3 ? 1.22 : 1.0;
  const diameterMeters = diameterInches * 0.0254;
  const pitchMeters = pitchInches * 0.0254;
  const revPerSec = loadedRpm / 60;

  // Actuator disk approximation for thrust in Newtons
  const ct = 0.105 * (pitchInches / diameterInches) * bladeMultiplier;
  const thrustNewtons = ct * AIR_DENSITY_SEA_LEVEL * Math.pow(revPerSec, 2) * Math.pow(diameterMeters, 4);
  const thrustGrams = (thrustNewtons / 9.80665) * 1000;

  // Power coefficient Cp
  const cp = 0.052 * Math.pow(pitchInches / diameterInches, 1.2) * bladeMultiplier;
  const mechanicalPowerWatts = cp * AIR_DENSITY_SEA_LEVEL * Math.pow(revPerSec, 3) * Math.pow(diameterMeters, 5);
  
  // Electrical efficiency of BLDC + ESC ~ 82%
  const electricalPowerWatts = mechanicalPowerWatts / 0.82;
  const currentAmps = voltage > 0 ? electricalPowerWatts / voltage : 0;
  const efficiencyGpW = electricalPowerWatts > 0 ? thrustGrams / electricalPowerWatts : 0;

  return {
    rpm: Math.round(loadedRpm),
    thrustGrams: Math.round(thrustGrams * 10) / 10,
    thrustNewtons: Math.round(thrustNewtons * 100) / 100,
    powerWatts: Math.round(electricalPowerWatts * 10) / 10,
    currentAmps: Math.round(currentAmps * 100) / 100,
    efficiencyGpW: Math.round(efficiencyGpW * 100) / 100,
    pitchSpeedKmh: Math.round(pitchSpeedKmh * 10) / 10,
  };
}

/**
 * Centre of Gravity (CG) Calculation
 * CG = Sum(Weight_i * Arm_i) / Sum(Weight_i)
 */
export function calculateCenterOfGravity(
  items: Array<{ name: string; weightGrams: number; armMm: number }>
) {
  let totalWeight = 0;
  let totalMoment = 0;

  items.forEach(item => {
    totalWeight += item.weightGrams;
    totalMoment += item.weightGrams * item.armMm;
  });

  const cgMm = totalWeight > 0 ? totalMoment / totalWeight : 0;

  return {
    totalWeightGrams: Math.round(totalWeight),
    totalMoment: Math.round(totalMoment),
    cgMm: Math.round(cgMm * 10) / 10,
  };
}

/**
 * Mean Aerodynamic Chord (MAC) calculation for tapered wings
 */
export function calculateMAC(
  rootChordMm: number,
  tipChordMm: number,
  wingspanMm: number,
  leadingEdgeSweepMm: number
) {
  const lambda = tipChordMm / (rootChordMm || 1); // Taper ratio
  const macMm = (2 / 3) * rootChordMm * ((1 + lambda + lambda * lambda) / (1 + lambda));
  // Y position of MAC along half-span
  const yMacMm = (wingspanMm / 6) * ((1 + 2 * lambda) / (1 + lambda));
  // X position of MAC leading edge relative to wing root leading edge
  const xMacLeadingEdgeMm = leadingEdgeSweepMm * ((1 + 2 * lambda) / (3 * (1 + lambda)));

  return {
    macMm: Math.round(macMm * 10) / 10,
    yMacMm: Math.round(yMacMm * 10) / 10,
    xMacLeadingEdgeMm: Math.round(xMacLeadingEdgeMm * 10) / 10,
  };
}

/**
 * LiPo State of Charge (SoC) from Resting Voltage per cell
 */
export function getLipoCellSoC(voltage: number): number {
  if (voltage >= 4.20) return 100;
  if (voltage <= 3.20) return 0;
  
  // Non-linear discharge curve table for LiCoO2 / Li-Polymer
  const curve = [
    { v: 4.20, soc: 100 },
    { v: 4.15, soc: 95 },
    { v: 4.10, soc: 90 },
    { v: 4.00, soc: 80 },
    { v: 3.90, soc: 70 },
    { v: 3.84, soc: 60 },
    { v: 3.80, soc: 50 },
    { v: 3.76, soc: 40 },
    { v: 3.73, soc: 30 },
    { v: 3.70, soc: 20 },
    { v: 3.65, soc: 10 },
    { v: 3.50, soc: 5 },
    { v: 3.20, soc: 0 }
  ];

  for (let i = 0; i < curve.length - 1; i++) {
    const higher = curve[i];
    const lower = curve[i + 1];
    if (voltage <= higher.v && voltage >= lower.v) {
      const ratio = (voltage - lower.v) / (higher.v - lower.v);
      return Math.round(lower.soc + ratio * (higher.soc - lower.soc));
    }
  }
  return 0;
}
