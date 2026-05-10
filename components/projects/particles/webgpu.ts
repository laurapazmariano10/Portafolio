import type { ParticlesEngine, ParticlesEngineOptions } from './types';
import {
  ATLAS_COLS,
  ATLAS_ROWS,
  MAX_PARTICLES,
  PARTICLE_F32_STRIDE,
  buildSymbolAtlas,
  computeParticleCount,
  hexToRGBA,
  seedParticles,
} from './types';
import { COMPUTE_WGSL, RENDER_WGSL } from './shaders';

export async function createWebGPUEngine(opts: ParticlesEngineOptions): Promise<ParticlesEngine | null> {
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) return null;
  const gpu = navigator.gpu;
  const adapter = await gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  if (!device) return null;

  const { canvas, symbols, paletteHex, pastelCount } = opts;
  const context = canvas.getContext('webgpu') as GPUCanvasContext | null;
  if (!context) {
    device.destroy();
    return null;
  }

  const format = gpu.getPreferredCanvasFormat();
  context.configure({ device, format, alphaMode: 'opaque' });

  // ---------- Buffers ----------
  const particleBufferSize = MAX_PARTICLES * PARTICLE_F32_STRIDE * 4;
  const particleBuffer = device.createBuffer({
    size: particleBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const simParamsArray = new ArrayBuffer(32);
  const simParamsF32 = new Float32Array(simParamsArray);
  const simParamsU32 = new Uint32Array(simParamsArray);
  const simParamsBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const renderUniformsArray = new Float32Array(4); // vp.xy, atlasGrid.xy
  renderUniformsArray[2] = ATLAS_COLS;
  renderUniformsArray[3] = ATLAS_ROWS;
  const renderUniformsBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Palette: 16 vec4 = 256 bytes
  const paletteData = new Float32Array(64);
  for (let i = 0; i < 16; i += 1) {
    const c = paletteHex[i] ?? paletteHex[i % paletteHex.length] ?? '#111111';
    const rgba = hexToRGBA(c);
    paletteData.set(rgba, i * 4);
  }
  const paletteBuffer = device.createBuffer({
    size: 256,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(paletteBuffer, 0, paletteData);

  // ---------- Atlas texture ----------
  const atlasCanvas = buildSymbolAtlas(symbols);
  const atlasTexture = device.createTexture({
    size: [atlasCanvas.width, atlasCanvas.height, 1],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  device.queue.copyExternalImageToTexture(
    { source: atlasCanvas },
    { texture: atlasTexture },
    [atlasCanvas.width, atlasCanvas.height]
  );
  const atlasSampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
  });

  // ---------- Bind group layouts ----------
  const computeBgl = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
    ],
  });
  const renderBgl = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      { binding: 2, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } },
      { binding: 3, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'float' } },
      { binding: 4, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
    ],
  });

  const computeBindGroup = device.createBindGroup({
    layout: computeBgl,
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: simParamsBuffer } },
    ],
  });
  const renderBindGroup = device.createBindGroup({
    layout: renderBgl,
    entries: [
      { binding: 0, resource: { buffer: particleBuffer } },
      { binding: 1, resource: { buffer: renderUniformsBuffer } },
      { binding: 2, resource: { buffer: paletteBuffer } },
      { binding: 3, resource: atlasTexture.createView() },
      { binding: 4, resource: atlasSampler },
    ],
  });

  // ---------- Pipelines ----------
  device.pushErrorScope('validation');
  const computeModule = device.createShaderModule({ code: COMPUTE_WGSL });
  const renderModule = device.createShaderModule({ code: RENDER_WGSL });

  const computeInfo = await computeModule.getCompilationInfo();
  const renderInfo = await renderModule.getCompilationInfo();
  const shaderError = [...computeInfo.messages, ...renderInfo.messages].find((m) => m.type === 'error');
  if (shaderError) {
    const validationError = await device.popErrorScope();
    console.error('[particles] WGSL compile error:', shaderError, validationError);
    device.destroy();
    return null;
  }

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [computeBgl] }),
    compute: { module: computeModule, entryPoint: 'main' },
  });

  const renderPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({ bindGroupLayouts: [renderBgl] }),
    vertex: { module: renderModule, entryPoint: 'vs' },
    fragment: {
      module: renderModule,
      entryPoint: 'fs',
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          },
        },
      ],
    },
    primitive: { topology: 'triangle-list' },
  });

  const pipelineError = await device.popErrorScope();
  if (pipelineError) {
    console.error('[particles] pipeline validation error:', pipelineError);
    device.destroy();
    return null;
  }

  device.onuncapturederror = (ev) => {
    console.error('[particles] uncaptured WebGPU error:', ev.error);
  };

  // ---------- Particle CPU mirror for reseeding ----------
  const cpuBuffer = new ArrayBuffer(particleBufferSize);
  const cpuF32 = new Float32Array(cpuBuffer);
  const cpuU32 = new Uint32Array(cpuBuffer);

  // ---------- State ----------
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
  let lost = false;

  device.lost.then(() => { lost = true; }).catch(() => { lost = true; });

  const resize = (width: number, height: number, devicePixelRatio: number) => {
    cssWidth = width;
    cssHeight = height;
    dpr = devicePixelRatio;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    count = computeParticleCount(width, height, dpr);
    seedParticles(cpuF32, cpuU32, {
      width,
      height,
      count,
      symbolCount: Math.min(symbols.length, ATLAS_COLS * ATLAS_ROWS),
      paletteCount: Math.min(paletteHex.length, 16),
      pastelCount,
    });
    device.queue.writeBuffer(particleBuffer, 0, cpuBuffer, 0, count * PARTICLE_F32_STRIDE * 4);
    renderUniformsArray[0] = canvas.width;
    renderUniformsArray[1] = canvas.height;
    device.queue.writeBuffer(renderUniformsBuffer, 0, renderUniformsArray);
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

  const writeSimParams = () => {
    // Convert pointer from CSS px to device px so it matches particle coords (which we keep in CSS px).
    // We keep particles in CSS-px space; render scales using vp = device px / dpr would mismatch.
    // Solution: use CSS px in render too -> renderUniforms.vp = cssWidth*dpr but particle coords need scaling.
    // Simpler: keep particles in CSS-px. Render uniforms vp = device px (canvas.width). So in shader we
    // divide world (CSS px) by vp. But canvas.width = cssWidth*dpr. To match, multiply world by dpr.
    // Easiest fix: write vp = cssWidth, cssHeight (CSS px), then NDC math uses CSS px directly.
    // Done at resize but using device px. Recompute here using CSS px.
    renderUniformsArray[0] = cssWidth;
    renderUniformsArray[1] = cssHeight;
    device.queue.writeBuffer(renderUniformsBuffer, 0, renderUniformsArray);

    simParamsF32[0] = cssWidth;
    simParamsF32[1] = cssHeight;
    simParamsF32[2] = pointerX;
    simParamsF32[3] = pointerY;
    simParamsF32[4] = pointerSpeed;
    simParamsF32[5] = pointerActive ? 1 : 0;
    simParamsU32[6] = count;
    simParamsU32[7] = 0;
    device.queue.writeBuffer(simParamsBuffer, 0, simParamsArray);
  };

  const tick = () => {
    if (lost) return;
    if (!visible || !awake) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }
    if (count === 0 || cssWidth === 0) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }

    writeSimParams();

    let currentTexture: GPUTexture;
    try {
      currentTexture = context.getCurrentTexture();
    } catch {
      // Context lost configuration (e.g. racing engine dispose, canvas resize
      // to 0, or GPU pressure). Try to re-configure once before giving up.
      try {
        context.configure({ device, format, alphaMode: 'opaque' });
        currentTexture = context.getCurrentTexture();
      } catch (err) {
        console.warn('[particles] canvas context unrecoverable, halting webgpu loop:', err);
        lost = true;
        return;
      }
    }

    const encoder = device.createCommandEncoder();

    const compPass = encoder.beginComputePass();
    compPass.setPipeline(computePipeline);
    compPass.setBindGroup(0, computeBindGroup);
    compPass.dispatchWorkgroups(Math.ceil(count / 64));
    compPass.end();

    const view = currentTexture.createView();
    const renderPass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view,
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 1, g: 1, b: 1, a: 1 },
        },
      ],
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, renderBindGroup);
    renderPass.draw(6, count, 0, 0);
    renderPass.end();

    device.queue.submit([encoder.finish()]);

    pointerSpeed *= 0.78;
    rafId = window.requestAnimationFrame(tick);
  };

  return {
    backend: 'webgpu',
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
      lost = true;
      // NOTE: deliberately do NOT call `context.unconfigure()` here. Under React
      // Strict Mode the effect runs twice and a stale dispose would otherwise
      // wipe the configuration that the live engine just installed.
      try { atlasTexture.destroy(); } catch { /* noop */ }
      try { particleBuffer.destroy(); } catch { /* noop */ }
      try { simParamsBuffer.destroy(); } catch { /* noop */ }
      try { renderUniformsBuffer.destroy(); } catch { /* noop */ }
      try { paletteBuffer.destroy(); } catch { /* noop */ }
      try { device.destroy(); } catch { /* noop */ }
    },
  };
}
