import type { ParticlesEngine, ParticlesEngineOptions } from './types';
import { createCanvas2DEngine } from './canvas2d';
import { createWebGPUEngine } from './webgpu';

export type { ParticlesEngine, ParticlesEngineOptions } from './types';

export async function createParticlesEngine(opts: ParticlesEngineOptions): Promise<ParticlesEngine> {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const engine = await createWebGPUEngine(opts);
      if (engine) return engine;
    } catch (err) {
      console.warn('[particles] WebGPU init failed, falling back to Canvas 2D:', err);
    }
  }
  return createCanvas2DEngine(opts);
}
