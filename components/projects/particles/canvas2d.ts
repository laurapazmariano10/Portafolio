import type { ParticlesEngine, ParticlesEngineOptions } from './types';
import { computeParticleCount, MAX_PARTICLES, PARTICLE_F32_STRIDE, seedParticles } from './types';

export function createCanvas2DEngine(opts: ParticlesEngineOptions): ParticlesEngine {
  const { canvas, symbols, paletteHex, pastelCount } = opts;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('No 2d context');

  const data = new ArrayBuffer(MAX_PARTICLES * PARTICLE_F32_STRIDE * 4);
  const f32 = new Float32Array(data);
  const u32 = new Uint32Array(data);

  let count = 0;
  let cssWidth = 0;
  let cssHeight = 0;
  let dpr = 1;
  let pointerX = -9999;
  let pointerY = -9999;
  let prevX = -9999;
  let prevY = -9999;
  let pointerSpeed = 0;
  let pointerActive = false;
  let visible = true;
  let awake = true;
  let rafId: number | null = null;

  const resize = (width: number, height: number, devicePixelRatio: number) => {
    cssWidth = width;
    cssHeight = height;
    dpr = devicePixelRatio;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    count = computeParticleCount(width, height, dpr);
    seedParticles(f32, u32, {
      width,
      height,
      count,
      symbolCount: symbols.length,
      paletteCount: paletteHex.length,
      pastelCount,
    });
  };

  const setPointer = (x: number, y: number, active: boolean) => {
    if (!active) {
      pointerActive = false;
      pointerX = -9999;
      pointerY = -9999;
      pointerSpeed = 0;
      prevX = -9999;
      prevY = -9999;
      return;
    }
    if (prevX < -9000) {
      prevX = x;
      prevY = y;
      pointerSpeed = 0;
    } else {
      pointerSpeed = Math.sqrt((x - prevX) * (x - prevX) + (y - prevY) * (y - prevY));
      prevX = x;
      prevY = y;
    }
    pointerX = x;
    pointerY = y;
    pointerActive = true;
  };

  const tick = () => {
    if (!visible || !awake) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const radius = 150;
    const radius2 = radius * radius;
    const speedFactor = Math.min(pointerSpeed / 14, 3.0);
    const neighborRadius = 38;
    const neighborRadius2 = neighborRadius * neighborRadius;
    for (let i = 0; i < count; i += 1) {
      const off = i * PARTICLE_F32_STRIDE;
      let px = f32[off + 0];
      let py = f32[off + 1];
      let vx = f32[off + 2];
      let vy = f32[off + 3];
      const baseY = f32[off + 4];
      const size = f32[off + 5];
      let rot = f32[off + 6];
      let vr = f32[off + 7];
      const symIdx = u32[off + 8];
      const colIdx = u32[off + 9];

      if (pointerActive && speedFactor > 0.05) {
        const dx = px - pointerX;
        const dy = py - pointerY;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius2 && d2 > 0.5) {
          const dist = Math.sqrt(d2);
          const falloff = 1 - dist / radius;
          const force = falloff * falloff * speedFactor * 1.6;
          vx += (dx / dist) * force;
          vy += (dy / dist) * force;
          vr += (dx / radius) * 0.014 * speedFactor;
        }
      }

      let sepX = 0;
      let sepY = 0;
      let aliX = 0;
      let aliY = 0;
      let cohX = 0;
      let cohY = 0;
      let n = 0;
      for (let k = 1; k <= 6; k += 1) {
        const j = ((i + k * 13 + 1) % count) * PARTICLE_F32_STRIDE;
        const odx = px - f32[j + 0];
        const ody = py - f32[j + 1];
        const od2 = odx * odx + ody * ody;
        if (od2 < neighborRadius2 && od2 > 0.5) {
          const od = Math.sqrt(od2);
          sepX += odx / od / od;
          sepY += ody / od / od;
          aliX += f32[j + 2];
          aliY += f32[j + 3];
          cohX += f32[j + 0];
          cohY += f32[j + 1];
          n += 1;
        }
      }
      if (n > 0) {
        vx += sepX * 1.1;
        vy += sepY * 1.1;
        vx += (aliX / n - vx) * 0.04;
        vy += (aliY / n - vy) * 0.04;
        vx += (cohX / n - px) * 0.0018;
        vy += (cohY / n - py) * 0.0018;
      }

      vy += (baseY - py) * 0.0035;
      vy += 0.06;
      vx *= 0.9;
      vy *= 0.9;
      vr *= 0.93;

      px += vx;
      py += vy;
      rot += vr;

      if (px < 6) { px = 6; vx *= -0.4; }
      if (px > cssWidth - 6) { px = cssWidth - 6; vx *= -0.4; }
      if (py > cssHeight - 6) { py = cssHeight - 6; vy *= -0.32; vx *= 0.96; }
      if (py < -160) { py = -160; if (vy < 0) vy = 0; }

      f32[off + 0] = px;
      f32[off + 1] = py;
      f32[off + 2] = vx;
      f32[off + 3] = vy;
      f32[off + 6] = rot;
      f32[off + 7] = vr;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = paletteHex[colIdx] ?? '#111';
      ctx.font = `700 ${size}px var(--font-sans), 'Segoe UI Symbol', system-ui, sans-serif`;
      ctx.fillText(symbols[symIdx] ?? '+', 0, 0);
      ctx.restore();
    }
    pointerSpeed *= 0.78;
    rafId = window.requestAnimationFrame(tick);
  };

  return {
    backend: 'canvas2d',
    resize,
    setPointer,
    setVisible: (v) => { visible = v; },
    setAwake: (a) => { awake = a; },
    start: () => {
      if (rafId === null) rafId = window.requestAnimationFrame(tick);
    },
    stop: () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    dispose: () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}
