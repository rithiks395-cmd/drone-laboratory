import * as THREE from 'three';

// Cache generated textures to avoid regenerating on re-renders
const textureCache: Record<string, THREE.CanvasTexture> = {};

/**
 * Procedural Carbon Fiber 2x2 Twill Weave Texture
 * Produces authentic specular sheen and anisotropic weave patterns
 */
export function getCarbonFiberTexture(): THREE.CanvasTexture {
  if (textureCache['carbon_fiber']) return textureCache['carbon_fiber'];

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Base graphite-black tone
  ctx.fillStyle = '#111317';
  ctx.fillRect(0, 0, size, size);

  const tileSize = 32;
  for (let y = 0; y < size; y += tileSize) {
    for (let x = 0; x < size; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;

      // Draw carbon bundle fibers
      const grad = ctx.createLinearGradient(x, y, x + tileSize, y + tileSize);
      if (isAlt) {
        grad.addColorStop(0, '#1c1f26');
        grad.addColorStop(0.3, '#353a47');
        grad.addColorStop(0.5, '#4a5163');
        grad.addColorStop(0.7, '#252933');
        grad.addColorStop(1, '#0e1014');
      } else {
        grad.addColorStop(0, '#0e1014');
        grad.addColorStop(0.3, '#222630');
        grad.addColorStop(0.5, '#424857');
        grad.addColorStop(0.7, '#2a2f3b');
        grad.addColorStop(1, '#1a1d24');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, tileSize, tileSize);

      // Add fine parallel filament lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < tileSize; i += 4) {
        ctx.beginPath();
        if (isAlt) {
          ctx.moveTo(x + i, y);
          ctx.lineTo(x, y + i);
        } else {
          ctx.moveTo(x + i, y + tileSize);
          ctx.lineTo(x + tileSize, y + i);
        }
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.anisotropy = 8;
  textureCache['carbon_fiber'] = texture;
  return texture;
}

/**
 * Procedural PCB Circuit Board Texture (Gold ENIG + Solder Mask + Silk Traces)
 */
export function getPCBTexture(type: 'fc' | 'esc' | 'pdb' = 'fc'): THREE.CanvasTexture {
  const key = `pcb_${type}`;
  if (textureCache[key]) return textureCache[key];

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Matte Black / Dark Green FR4 Soldermask
  ctx.fillStyle = type === 'esc' ? '#0b1118' : '#0a0d14';
  ctx.fillRect(0, 0, size, size);

  // Subsurface Copper Ground Planes
  ctx.strokeStyle = '#1a2433';
  ctx.lineWidth = 6;
  for (let i = 40; i < size; i += 80) {
    ctx.beginPath();
    ctx.moveTo(i, 20);
    ctx.lineTo(i, size - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, i);
    ctx.lineTo(size - 20, i);
    ctx.stroke();
  }

  // Gold ENIG Solder Pads (Edge headers)
  ctx.fillStyle = '#f59e0b';
  const padWidth = 24;
  const padHeight = 36;

  // Header pins on edges
  for (let i = 80; i < size - 80; i += 48) {
    // Top & Bottom pads
    ctx.fillRect(i, 20, padWidth, padHeight);
    ctx.fillRect(i, size - 56, padWidth, padHeight);

    // Left & Right pads
    ctx.fillRect(20, i, padHeight, padWidth);
    ctx.fillRect(size - 56, i, padHeight, padWidth);

    // Through-hole vias inside pads
    ctx.fillStyle = '#060911';
    ctx.beginPath();
    ctx.arc(i + padWidth / 2, 38, 5, 0, Math.PI * 2);
    ctx.arc(i + padWidth / 2, size - 38, 5, 0, Math.PI * 2);
    ctx.arc(38, i + padWidth / 2, 5, 0, Math.PI * 2);
    ctx.arc(size - 38, i + padWidth / 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
  }

  // Silkscreen component lines & markings (White print)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#ffffff';

  if (type === 'fc') {
    // STM32 MCU Footprint Square with Pin Matrix
    ctx.strokeRect(362, 362, 300, 300);
    ctx.strokeRect(412, 412, 200, 200);
    ctx.fillText('STM32F405', 440, 520);
    ctx.fillText('168MHz ARM', 435, 550);

    // Pin 1 dot
    ctx.beginPath();
    ctx.arc(385, 385, 8, 0, Math.PI * 2);
    ctx.fill();

    // IMU MPU6050 footprint
    ctx.strokeRect(700, 420, 100, 100);
    ctx.fillText('MPU6000', 705, 480);

    // Orientation Arrow
    ctx.beginPath();
    ctx.moveTo(512, 220);
    ctx.lineTo(480, 280);
    ctx.lineTo(504, 280);
    ctx.lineTo(504, 340);
    ctx.lineTo(520, 340);
    ctx.lineTo(520, 280);
    ctx.lineTo(544, 280);
    ctx.closePath();
    ctx.fill();
    ctx.fillText('FRONT', 485, 200);

    // Corner M3 mounting holes
    [100, size - 100].forEach((cx) => {
      [100, size - 100].forEach((cy) => {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#060911';
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  } else if (type === 'esc') {
    // MOSFET arrays (6x high current FETs)
    ctx.fillText('BLHELI_32', 430, 280);
    ctx.fillText('35A DSHOT1200', 410, 320);

    for (let f = 0; f < 3; f++) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(250 + f * 180, 400, 120, 180);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(250 + f * 180, 400, 120, 180);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('FET', 290 + f * 180, 500);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  textureCache[key] = texture;
  return texture;
}

/**
 * Procedural Realistic LiPo Battery Label Texture
 */
export function getLiPoLabelTexture(cells = 4, mah = 3300): THREE.CanvasTexture {
  const key = `lipo_${cells}s_${mah}`;
  if (textureCache[key]) return textureCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dynamic Black & Gold Aerospace Brushed Graphic
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 512);
  bgGrad.addColorStop(0, '#0a0d14');
  bgGrad.addColorStop(0.5, '#141e30');
  bgGrad.addColorStop(1, '#05070a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Electric Gold Racing Accent Stripe
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.moveTo(0, 80);
  ctx.lineTo(1024, 20);
  ctx.lineTo(1024, 70);
  ctx.lineTo(0, 130);
  ctx.fill();

  // Cyan Highlights
  ctx.fillStyle = '#00f0ff';
  ctx.fillRect(40, 180, 12, 260);

  // Battery Branding & Capacity
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px system-ui, sans-serif';
  ctx.fillText(`${mah} mAh`, 80, 270);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 44px monospace';
  const voltage = (cells * 3.7).toFixed(1);
  ctx.fillText(`${cells}S1P ${voltage}V  •  75C-150C BURST`, 80, 340);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px monospace';
  ctx.fillText(`LITHIUM POLYMER HIGH DISCHARGE PACK • ${cells * 4.2}V MAX`, 80, 390);

  // Safety Warning Block
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(680, 180, 300, 240);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('⚠ SAFETY WARNING', 710, 220);
  ctx.font = '16px sans-serif';
  ctx.fillText('• Never charge unattended', 710, 260);
  ctx.fillText('• Charge only in LiPo bag', 710, 290);
  ctx.fillText('• Never discharge below 3.0V', 710, 320);
  ctx.fillText('• CE / RoHS / UN38.3 Certified', 710, 360);

  const texture = new THREE.CanvasTexture(canvas);
  textureCache[key] = texture;
  return texture;
}

/**
 * Ceramic Microwave Patch Antenna Texture (GPS Puck)
 */
export function getGPSPatchTexture(): THREE.CanvasTexture {
  if (textureCache['gps_patch']) return textureCache['gps_patch'];

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-dielectric ceramic white/grey base
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 512, 512);

  // Screen-printed silver electrode patch
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(40, 40, 432, 432);

  // Offset coaxial feed pin solder dot (standard GPS ceramic antenna design)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(320, 210, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(320, 210, 8, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache['gps_patch'] = texture;
  return texture;
}
