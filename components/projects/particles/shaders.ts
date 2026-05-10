const PARTICLE_STRUCT = /* wgsl */ `
struct Particle {
  pos: vec2<f32>,
  vel: vec2<f32>,
  baseY: f32,
  size: f32,
  rotation: f32,
  vRot: f32,
  symbolIdx: u32,
  colorIdx: u32,
  _pad0: f32,
  _pad1: f32,
}
`;

export const COMPUTE_WGSL = /* wgsl */ `
${PARTICLE_STRUCT}

struct SimParams {
  width: f32,
  height: f32,
  pointerX: f32,
  pointerY: f32,
  pointerSpeed: f32,
  pointerActive: f32,
  count: u32,
  _pad: u32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= params.count) { return; }

  var p = particles[i];

  let speedFactor = min(params.pointerSpeed / 14.0, 3.0);
  if (params.pointerActive > 0.5 && speedFactor > 0.05) {
    let d = p.pos - vec2<f32>(params.pointerX, params.pointerY);
    let d2 = dot(d, d);
    let radius = 150.0;
    let radius2 = radius * radius;
    if (d2 < radius2 && d2 > 0.5) {
      let dist = sqrt(d2);
      let falloff = 1.0 - dist / radius;
      let force = falloff * falloff * speedFactor * 1.6;
      p.vel = p.vel + (d / dist) * force;
      p.vRot = p.vRot + (d.x / radius) * 0.014 * speedFactor;
    }
  }

  var sep = vec2<f32>(0.0);
  var ali = vec2<f32>(0.0);
  var coh = vec2<f32>(0.0);
  var n: u32 = 0u;
  let nr = 38.0;
  let nr2 = nr * nr;
  for (var k: u32 = 1u; k <= 6u; k = k + 1u) {
    let j = (i + k * 13u + 1u) % params.count;
    let other = particles[j];
    let od = p.pos - other.pos;
    let od2 = dot(od, od);
    if (od2 < nr2 && od2 > 0.5) {
      let dd = sqrt(od2);
      sep = sep + (od / dd) / dd;
      ali = ali + other.vel;
      coh = coh + other.pos;
      n = n + 1u;
    }
  }
  if (n > 0u) {
    let nf = f32(n);
    p.vel = p.vel + sep * 1.1;
    p.vel = p.vel + (ali / nf - p.vel) * 0.04;
    p.vel = p.vel + (coh / nf - p.pos) * 0.0018;
  }

  p.vel.y = p.vel.y + (p.baseY - p.pos.y) * 0.0035;
  p.vel.y = p.vel.y + 0.06;
  p.vel = p.vel * 0.9;
  p.vRot = p.vRot * 0.93;

  p.pos = p.pos + p.vel;
  p.rotation = p.rotation + p.vRot;

  if (p.pos.x < 6.0) { p.pos.x = 6.0; p.vel.x = p.vel.x * -0.4; }
  if (p.pos.x > params.width - 6.0) { p.pos.x = params.width - 6.0; p.vel.x = p.vel.x * -0.4; }
  if (p.pos.y > params.height - 6.0) { p.pos.y = params.height - 6.0; p.vel.y = p.vel.y * -0.32; p.vel.x = p.vel.x * 0.96; }
  if (p.pos.y < -160.0) { p.pos.y = -160.0; p.vel.y = max(p.vel.y, 0.0); }

  particles[i] = p;
}
`;

export const RENDER_WGSL = /* wgsl */ `
${PARTICLE_STRUCT}

struct RenderUniforms {
  vp: vec2<f32>,
  atlasGrid: vec2<f32>,
}

struct Palette {
  colors: array<vec4<f32>, 16>,
}

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) color: vec4<f32>,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uni: RenderUniforms;
@group(0) @binding(2) var<uniform> palette: Palette;
@group(0) @binding(3) var atlasTex: texture_2d<f32>;
@group(0) @binding(4) var atlasSamp: sampler;

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VSOut {
  var corners = array<vec2<f32>, 6>(
    vec2<f32>(-0.5, -0.5), vec2<f32>(0.5, -0.5), vec2<f32>(-0.5, 0.5),
    vec2<f32>(-0.5, 0.5), vec2<f32>(0.5, -0.5), vec2<f32>(0.5, 0.5)
  );
  var uvs = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 0.0), vec2<f32>(0.0, 1.0),
    vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 0.0), vec2<f32>(1.0, 1.0)
  );
  let p = particles[ii];
  let corner = corners[vi];
  let baseUV = uvs[vi];
  let c = cos(p.rotation);
  let s = sin(p.rotation);
  let rot = vec2<f32>(corner.x * c - corner.y * s, corner.x * s + corner.y * c);
  let scale = p.size * 1.85;
  let world = p.pos + rot * scale;
  let ndc = vec2<f32>(world.x / uni.vp.x * 2.0 - 1.0, 1.0 - world.y / uni.vp.y * 2.0);

  let cols = uni.atlasGrid.x;
  let cell = vec2<f32>(f32(p.symbolIdx) % cols, floor(f32(p.symbolIdx) / cols));
  let uv = (cell + baseUV) / uni.atlasGrid;

  var out: VSOut;
  out.position = vec4<f32>(ndc, 0.0, 1.0);
  out.uv = uv;
  out.color = palette.colors[p.colorIdx];
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4<f32> {
  let s = textureSample(atlasTex, atlasSamp, in.uv);
  let a = s.a * 0.92;
  return vec4<f32>(in.color.rgb, a);
}
`;
