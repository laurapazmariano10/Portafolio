'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── SYMBOLS & COLORS ───────────────────────────────────────────────────────
const SYMBOLS = [
  '+','−','×','÷','√','π','∞','∫','≈',
  'Σ','Φ','Ω','∆','∇','±','∅','≠','≤',
  '∂','µ','∈','⊂','∪','∩','λ','θ','ƒ',
];
const GRAYS = [
  '#0a0a0a','#1a1a1a','#2d2d2d','#3d3d3d',
  '#5a5a5a','#6b6b6b','#7d7d7d','#8d8d8d',
  '#a0a0a0','#b0b0b0','#c0c0c0','#d0d0d0','#dedede','#e8e8e8',
];
const ACCENTS = ['#E84855','#3366FF','#22C55E','#A855F7','#CCFF00'];
const pickColor = () => Math.random() < 0.80
  ? GRAYS[Math.floor(Math.random() * GRAYS.length)]
  : ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

// ─── PHYSICS ─────────────────────────────────────────────────────────────────
const FILL      = 0.75;       // particles fill bottom 75%
const MIN_FS    = 30;
const MAX_FS    = 68;
const GRAVITY   = 1.5;        // realistic fall acceleration
const DAMPING   = 0.97;       // air resistance per frame
const CUR_R     = 160;        // cursor influence radius
const CUR_STR   = 0.55;       // cursor force multiplier
const SEP_GAP   = 2;
const PRESSURE  = 0.45;       // push apart on overlap
const SLEEP_V   = 0.5;        // velocity below which → settled
const WAKE_V    = 2.0;        // collision speed to wake neighbors

interface P {
  x: number; y: number;
  vx: number; vy: number;
  fs: number; rot: number; vr: number;
  sym: string; col: string;
  alpha: number; bold: boolean; outlined: boolean;
  settled: boolean;
  sprite: HTMLCanvasElement;    // pre-rendered glyph
  spSz: number;                // sprite canvas size
}

// ─── PRE-RENDER SPRITE ───────────────────────────────────────────────────────
function makeSprite(p: Omit<P, 'sprite' | 'spSz' | 'settled'>): { sprite: HTMLCanvasElement; spSz: number } {
  const sz = Math.ceil(p.fs * 1.4);
  const c = document.createElement('canvas');
  c.width = sz; c.height = sz;
  const x = c.getContext('2d')!;
  x.font = `${p.bold ? '700' : '400'} ${p.fs}px "Segoe UI Symbol","Apple Symbols",system-ui,sans-serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.globalAlpha = p.alpha;
  if (p.outlined) {
    x.strokeStyle = p.col;
    x.lineWidth = Math.max(1.5, p.fs * 0.055);
    x.strokeText(p.sym, sz / 2, sz / 2);
  } else {
    x.fillStyle = p.col;
    x.fillText(p.sym, sz / 2, sz / 2);
  }
  return { sprite: c, spSz: sz };
}

// ─── SEED ────────────────────────────────────────────────────────────────────
function seed(w: number, h: number): P[] {
  const top = h * (1 - FILL);
  const fh = h - top;
  const avg = (MIN_FS + MAX_FS) / 2;
  const count = Math.min(Math.floor((w * fh * 0.55) / (avg * avg * 0.55)), 380);
  const cols = Math.ceil(Math.sqrt(count * (w / fh)));
  const rows = Math.ceil(count / cols);
  const cw = w / cols, ch = fh / rows;
  const out: P[] = [];

  for (let i = 0; i < count; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const fs = MIN_FS + Math.random() * (MAX_FS - MIN_FS);
    const base = {
      x: cw * c + cw * 0.5 + (Math.random() - 0.5) * cw * 0.3,
      y: top + ch * r + ch * 0.5 + (Math.random() - 0.5) * ch * 0.2,
      vx: 0, vy: 0, fs,
      rot: (Math.random() - 0.5) * 0.5, vr: 0,
      sym: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      col: pickColor(),
      alpha: 0.75 + Math.random() * 0.25,
      bold: Math.random() < 0.6,
      outlined: Math.random() < 0.2,
    };
    const { sprite, spSz } = makeSprite(base);
    out.push({ ...base, settled: false, sprite, spSz });
  }
  // Pre-settle: keep ALL awake so none freeze mid-air
  for (let f = 0; f < 500; f++) {
    sim(out, w, h, 0, 0, 0, 0);
    for (const p of out) p.settled = false; // force awake each frame
  }
  for (const p of out) { p.vx = 0; p.vy = 0; p.vr = 0; p.settled = true; }
  return out;
}

// ─── SIMULATION ──────────────────────────────────────────────────────────────
function sim(
  ps: P[], w: number, h: number,
  cvx: number, cvy: number,   // cursor VELOCITY vector
  cx: number, cy: number,     // cursor position
) {
  const n = ps.length;
  if (n === 0) return;

  const cSpeed = Math.sqrt(cvx * cvx + cvy * cvy);

  // ── 1. CURSOR FORCE ─ F = v_cursor × falloff² (real impulse) ─────────
  if (cSpeed > 0.2) {
    const r2 = CUR_R * CUR_R;
    const cnx = cvx / cSpeed, cny = cvy / cSpeed;
    for (let i = 0; i < n; i++) {
      const p = ps[i];
      const dx = p.x - cx, dy = p.y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2 && d2 > 1) {
        const dist = Math.sqrt(d2);
        const ff = (1 - dist / CUR_R) ** 2;
        // Radial push (60%) + directional push (40%)
        const radF = ff * cSpeed * CUR_STR * 0.6;
        const dirF = ff * cSpeed * CUR_STR * 0.4;
        p.vx += (dx / dist) * radF + cnx * dirF;
        p.vy += (dy / dist) * radF + cny * dirF;
        p.vr += (cnx * 0.01 + (dx / dist) * 0.005) * cSpeed * 0.04;
        p.settled = false; // WAKE UP
      }
    }
  }

  // ── 2. SPATIAL HASH ──────────────────────────────────────────────────
  const cell = MAX_FS * 0.76 + SEP_GAP * 2 + MAX_FS; // covers 2× largest radius
  const gc = Math.ceil(w / cell) + 1;
  const grid = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const gx = Math.floor(ps[i].x / cell);
    const gy = Math.floor((ps[i].y + h) / cell);
    const a = grid.get(gy * gc + gx);
    if (a) a.push(i); else grid.set(gy * gc + gx, [i]);
  }

  // ── 3. PBD SEPARATION + SUPPORT ── Position Based Dynamics ──────────
  // Instead of adding velocity (causes oscillation/jitter), we directly
  // MOVE particles apart. Zero velocity added = zero trembling.
  const supported = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const hr = ps[i].fs * 0.5;
    if (ps[i].y + hr >= h - 2) supported[i] = 1;
  }

  for (let i = 0; i < n; i++) {
    const a = ps[i];
    const ra = a.fs * 0.38 + SEP_GAP; // larger radius = more spacing
    const gx = Math.floor(a.x / cell);
    const gy = Math.floor((a.y + h) / cell);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const arr = grid.get((gy + dy) * gc + (gx + dx));
        if (!arr) continue;
        for (let k = 0; k < arr.length; k++) {
          const j = arr[k];
          if (j <= i) continue;
          const b = ps[j];

          // Both settled → skip entirely (already in equilibrium)
          if (a.settled && b.settled) continue;

          const rb = b.fs * 0.38 + SEP_GAP;
          const ddx = a.x - b.x, ddy = a.y - b.y;
          const d2 = ddx * ddx + ddy * ddy;
          const minD = ra + rb;
          if (d2 < minD * minD && d2 > 0.01) {
            const dist = Math.sqrt(d2);
            const overlap = (minD - dist) * 0.5;
            const nx = ddx / dist, ny = ddy / dist;

            // POSITION-BASED: directly move apart (no velocity = no jitter)
            if (!a.settled) { a.x += nx * overlap; a.y += ny * overlap; }
            if (!b.settled) { b.x -= nx * overlap; b.y -= ny * overlap; }

            // Support detection
            if (ddy < 0) supported[i] = 1;
            if (ddy > 0) supported[j] = 1;

            // VELOCITY transfer only for fast collisions (wave propagation)
            const relVx = a.vx - b.vx, relVy = a.vy - b.vy;
            const relSpd = relVx * relVx + relVy * relVy;
            if (relSpd > WAKE_V * WAKE_V) {
              const transfer = overlap * 0.2;
              if (!a.settled) { a.vx += nx * transfer; a.vy += ny * transfer; }
              if (!b.settled) { b.vx -= nx * transfer; b.vy -= ny * transfer; }
              a.settled = false;
              b.settled = false;
            }
          }
        }
      }
    }
  }

  // ── 4. INTEGRATE ─────────────────────────────────────────────────────
  for (let i = 0; i < n; i++) {
    const p = ps[i];
    const hr = p.fs * 0.5;
    const onFloor = p.y + hr >= h - 2;
    const isSupported = supported[i] === 1;

    // Settled particles: skip physics entirely (no jitter)
    if (p.settled) {
      if (onFloor) p.y = h - hr;
      continue;
    }

    // Apply gravity only if NOT supported
    if (!isSupported) {
      p.vy += GRAVITY;
    } else {
      if (p.vy > 0) p.vy *= 0.3; // kill downward velocity on support
      p.vx *= 0.88; // surface friction
    }

    p.vx *= DAMPING;
    p.vy *= DAMPING;
    p.vr *= 0.92;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;

    // Wall collisions
    if (p.y + hr > h) { p.y = h - hr; p.vy *= -0.06; }
    if (p.x - hr < 0) { p.x = hr; p.vx *= -0.12; }
    if (p.x + hr > w) { p.x = w - hr; p.vx *= -0.12; }
    if (p.y - hr < -h * 0.5) { p.y = -h * 0.5 + hr; if (p.vy < 0) p.vy *= 0.3; }

    // SETTLE: low velocity + supported → sleep (works for mid-pile too)
    const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (spd < SLEEP_V && isSupported) {
      p.vx = 0; p.vy = 0; p.vr = 0;
      p.settled = true;
    }
  }
}

// ─── RENDER (sprites + setTransform = ~10× faster than fillText) ────────────
function draw(ctx: CanvasRenderingContext2D, ps: P[], w: number, h: number, dpr: number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    if (p.y + p.fs < 0 || p.y - p.fs > h) continue;
    const hs = p.spSz * 0.5;
    const cos = Math.cos(p.rot), sin = Math.sin(p.rot);
    ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * p.x, dpr * p.y);
    ctx.drawImage(p.sprite, -hs, -hs);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // restore
}

// ─── SLOT WORD ───────────────────────────────────────────────────────────────
function SlotWord({ word, idPrefix }: { word: string; idPrefix: string }) {
  return (
    <span className="slot-word">
      {word.split('').map((ch, i) => (
        <span key={`${idPrefix}-${i}`} className="slot-cell" aria-hidden="true">
          <span className="slot-track">
            <span className="slot-glyph">{ch}</span>
            <span className="slot-glyph">{ch}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function MathFluidParticles() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const psRef = useRef<P[]>([]);
  const ptrRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 });
  const rafRef = useRef<number | null>(null);
  const awakeRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let cw = 0, ch = 0, curDpr = 1;

    const resize = () => {
      const r = sticky.getBoundingClientRect();
      cw = r.width; ch = r.height;
      curDpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cw * curDpr);
      canvas.height = Math.floor(ch * curDpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(curDpr, 0, 0, curDpr, 0, 0);
      if (psRef.current.length === 0) psRef.current = seed(cw, ch);
    };
    resize();
    requestAnimationFrame(resize);

    const resObs = new ResizeObserver(resize);
    resObs.observe(sticky);

    const wakeObs = new IntersectionObserver(
      ([e]) => { awakeRef.current = e.isIntersecting; },
      { rootMargin: '300px' },
    );
    wakeObs.observe(sticky);

    // Track cursor VELOCITY (not just speed) — this is key for direction
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      const ptr = ptrRef.current;
      if (ptr.prevX > -9000) {
        ptr.vx = nx - ptr.prevX;
        ptr.vy = ny - ptr.prevY;
      }
      ptr.prevX = nx; ptr.prevY = ny;
      ptr.x = nx; ptr.y = ny;
    };
    const onLeave = () => {
      const p = ptrRef.current;
      p.x = -9999; p.y = -9999;
      p.vx = 0; p.vy = 0; p.prevX = -9999; p.prevY = -9999;
    };
    sticky.addEventListener('pointermove', onMove, { passive: true });
    sticky.addEventListener('pointerleave', onLeave);

    const tick = () => {
      if (cw > 0 && awakeRef.current) {
        const ptr = ptrRef.current;
        sim(psRef.current, cw, ch, ptr.vx, ptr.vy, ptr.x, ptr.y);
        draw(ctx, psRef.current, cw, ch, curDpr);
        // Gentle decay — preserves velocity between frames for responsiveness
        ptr.vx *= 0.88;
        ptr.vy *= 0.88;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      resObs.disconnect(); wakeObs.disconnect();
      sticky.removeEventListener('pointermove', onMove);
      sticky.removeEventListener('pointerleave', onLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useGSAP(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const curtain = curtainRef.current;
    const text = textRef.current;
    if (!section || !sticky || !curtain || !text) return;

    gsap.set(curtain, { yPercent: 100 });
    gsap.set(text, { autoAlpha: 0, y: 28 });
    gsap.set('.slot-track', { yPercent: 0 });

    const textIn = gsap.to(text, {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: sticky, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
    const slot = gsap.timeline({
      repeat: -1, repeatDelay: 1.4,
      scrollTrigger: { trigger: sticky, start: 'top 70%', end: 'bottom top', toggleActions: 'play pause resume pause' },
    });
    slot
      .to('.slot-track', { yPercent: -50, duration: 0.55, ease: 'power3.inOut', stagger: { amount: 2, from: 'random' } })
      .to('.slot-track', { yPercent: 0, duration: 0 }, '+=0.3');

    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: section, start: 'top top', end: '+=350%',
        pin: sticky, pinSpacing: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true,
      },
    });
    pinTl.to(curtain, { yPercent: 0, ease: 'none' }, 0.55);

    return () => {
      textIn.scrollTrigger?.kill(); textIn.kill();
      slot.scrollTrigger?.kill(); slot.kill();
      pinTl.scrollTrigger?.kill(); pinTl.kill();
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="math-fluid relative">
      <div ref={stickyRef} className="math-fluid__sticky relative h-screen w-full overflow-hidden" style={{ backgroundColor: '#FAF8F5' }}>
        <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
        <div ref={textRef} className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-[#111]">
          <p className="mb-5 font-[family-name:var(--font-sans)] text-[clamp(0.78rem,1vw,0.95rem)] font-medium uppercase tracking-[0.22em] text-[#303030]/70">
            tienes una idea en mente?
          </p>
          <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3.4rem,9vw,8.4rem)] font-bold uppercase leading-[1.05] tracking-[-0.045em]">
            <span className="block"><SlotWord word="Trabajemos" idPrefix="t" /></span>
            <span className="block"><SlotWord word="juntos!" idPrefix="j" /></span>
          </h2>
        </div>
        <div ref={curtainRef} className="absolute inset-0 z-20 flex translate-y-full items-center justify-center px-6 text-center" style={{ willChange: 'transform', backgroundColor: '#FAF8F5' }}>
          <div>
            <p className="font-[family-name:var(--font-sans)] text-sm uppercase tracking-[0.28em] text-[#303030]/45">siguiente paso</p>
            <h3 className="mt-5 font-[family-name:var(--font-antonio)] text-[clamp(3rem,8.5vw,8rem)] font-bold uppercase leading-[1] tracking-[-0.04em] text-[#111]">Hagamos algo memorable</h3>
            <a href="#contact" className="mt-9 inline-flex h-12 items-center justify-center rounded-full bg-[#111] px-8 font-[family-name:var(--font-sans)] text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform duration-300 hover:scale-105">Contacto</a>
          </div>
        </div>
      </div>
    </section>
  );
}
