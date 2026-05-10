// ─── Particle System Types & Shared Utilities ────────────────────────────────

export interface ParticlesEngineOptions {
  canvas:      HTMLCanvasElement;
  symbols:     string[];
  paletteHex:  string[];
  pastelCount: number;
}

export interface ParticlesEngine {
  backend:    'canvas2d' | 'webgpu';
  resize:     (width: number, height: number, devicePixelRatio: number) => void;
  setPointer: (x: number, y: number, active: boolean) => void;
  setVisible: (visible: boolean) => void;
  setAwake:   (awake: boolean) => void;
  start:      () => void;
  stop:       () => void;
  dispose:    () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Max particles we ever allocate buffers for */
export const MAX_PARTICLES = 4096;

/**
 * Per-particle layout in the shared Float32Array / Uint32Array:
 *   [0] x
 *   [1] y
 *   [2] vx
 *   [3] vy
 *   [4] baseY   (rest position)
 *   [5] size    (font size in CSS px)
 *   [6] rot     (radians)
 *   [7] vr      (angular velocity)
 *   [8] symIdx  (u32 — index into symbols)
 *   [9] colIdx  (u32 — index into palette)
 */
export const PARTICLE_F32_STRIDE = 10;

/** Atlas grid dimensions for the WebGPU symbol texture */
export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 4;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** How many particles to spawn given the viewport size */
export function computeParticleCount(
  width: number,
  height: number,
  dpr: number,
): number {
  // Scale with area but cap at MAX_PARTICLES
  const area = width * height;
  const base = Math.floor(area / 900); // ~1 particle per 30×30 CSS‑px cell
  return Math.min(base, MAX_PARTICLES);
}

export interface SeedOptions {
  width:        number;
  height:       number;
  count:        number;
  symbolCount:  number;
  paletteCount: number;
  pastelCount:  number;
}

/** Populate the particle buffer with initial random positions */
export function seedParticles(
  f32: Float32Array,
  u32: Uint32Array,
  opts: SeedOptions,
): void {
  const { width, height, count, symbolCount, paletteCount, pastelCount } = opts;
  for (let i = 0; i < count; i++) {
    const off = i * PARTICLE_F32_STRIDE;
    const x = Math.random() * width;
    const y = Math.random() * height;
    f32[off + 0] = x;                                      // x
    f32[off + 1] = y;                                      // y
    f32[off + 2] = 0;                                      // vx
    f32[off + 3] = 0;                                      // vy
    f32[off + 4] = y;                                      // baseY
    f32[off + 5] = 10 + Math.random() * 16;                // size
    f32[off + 6] = Math.random() * Math.PI * 2;            // rot
    f32[off + 7] = 0;                                      // vr
    u32[off + 8] = Math.floor(Math.random() * symbolCount); // symIdx
    // Prefer pastel colours (first N entries) — ~70% chance
    if (pastelCount > 0 && Math.random() < 0.7) {
      u32[off + 9] = Math.floor(Math.random() * pastelCount);
    } else {
      u32[off + 9] = Math.floor(Math.random() * paletteCount);
    }
  }
}

/** Convert a hex colour string (#RRGGBB or #RGB) to an RGBA Float32 array [0-1] */
export function hexToRGBA(hex: string): [number, number, number, number] {
  let r = 0, g = 0, b = 0;
  const h = hex.replace('#', '');
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16) / 255;
    g = parseInt(h[1] + h[1], 16) / 255;
    b = parseInt(h[2] + h[2], 16) / 255;
  } else if (h.length >= 6) {
    r = parseInt(h.slice(0, 2), 16) / 255;
    g = parseInt(h.slice(2, 4), 16) / 255;
    b = parseInt(h.slice(4, 6), 16) / 255;
  }
  return [r, g, b, 1];
}

/**
 * Builds an off-screen canvas atlas containing every symbol in a grid layout.
 * Used by the WebGPU renderer so each particle can pick its glyph via UV offset.
 */
export function buildSymbolAtlas(symbols: string[]): HTMLCanvasElement {
  const cellSize = 64;
  const cols = ATLAS_COLS;
  const rows = ATLAS_ROWS;
  const canvas = document.createElement('canvas');
  canvas.width  = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${cellSize * 0.6}px var(--font-sans), 'Segoe UI Symbol', system-ui, sans-serif`;

  const maxSlots = cols * rows;
  for (let i = 0; i < Math.min(symbols.length, maxSlots); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellSize + cellSize / 2;
    const cy = row * cellSize + cellSize / 2;
    ctx.fillText(symbols[i], cx, cy);
  }

  return canvas;
}
