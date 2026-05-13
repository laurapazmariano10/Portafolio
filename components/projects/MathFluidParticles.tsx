import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Matter from 'matter-js';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// ─── SYMBOLS & COLORS ───────────────────────────────────────────────────────
const SYMBOLS = [
  '+', '−', '×', '÷', '√', 'π', '∞', '∫', '≈',
  'Σ', 'Φ', 'Ω', '∆', '∇', '±', '∅', '≠', '≤',
  '∂', 'µ', '∈', '⊂', '∪', '∩', 'λ', 'θ', 'ƒ',
];
const GRAYS = [
  '#0a0a0a', '#1a1a1a', '#2d2d2d', '#3d3d3d',
  '#5a5a5a', '#6b6b6b', '#7d7d7d', '#8d8d8d',
  '#a0a0a0', '#b0b0b0', '#c0c0c0', '#d0d0d0', '#dedede', '#e8e8e8',
];
const ACCENTS = ['#E84855', '#3366FF', '#22C55E', '#A855F7', '#CCFF00'];
const pickColor = () => Math.random() < 0.80
  ? GRAYS[Math.floor(Math.random() * GRAYS.length)]
  : ACCENTS[Math.floor(Math.random() * ACCENTS.length)];

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const FILL = 0.65;       // particles fill bottom 65%
const MIN_FS = 30;
const MAX_FS = 68;
const CUR_R = 100;        // cursor influence radius

interface SpriteData {
  fs: number;
  sym: string;
  col: string;
  alpha: number;
  sprite: HTMLCanvasElement;
  spSz: number;
}

// ─── PRE-RENDER SPRITE ───────────────────────────────────────────────────────
function makeSprite(fs: number, sym: string, col: string, alpha: number, bold: boolean, outlined: boolean): SpriteData {
  const sz = Math.ceil(fs * 1.4);
  const c = document.createElement('canvas');
  c.width = sz; c.height = sz;
  const x = c.getContext('2d')!;
  x.font = `${bold ? '700' : '400'} ${fs}px "Segoe UI Symbol","Apple Symbols",system-ui,sans-serif`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.globalAlpha = alpha;
  if (outlined) {
    x.strokeStyle = col;
    x.lineWidth = Math.max(1.5, fs * 0.055);
    x.strokeText(sym, sz / 2, sz / 2);
  } else {
    x.fillStyle = col;
    x.fillText(sym, sz / 2, sz / 2);
  }
  return { fs, sym, col, alpha, sprite: c, spSz: sz };
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
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const rafRef = useRef<number | null>(null);
  const awakeRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let cw = 0, ch = 0, curDpr = 1;

    // Initialize Matter.js
    const engine = Matter.Engine.create({
      positionIterations: 12,
      velocityIterations: 12,
    });
    engine.world.gravity.y = 1;
    engineRef.current = engine;

    const mouseRepulsor = Matter.Bodies.circle(-9999, -9999, CUR_R, {
      isStatic: true,
      friction: 0,
      restitution: 0,
      render: { visible: false }
    });

    let floor: Matter.Body, wallL: Matter.Body, wallR: Matter.Body;

    const resize = () => {
      const r = container.getBoundingClientRect();
      const newCw = r.width;
      const newCh = r.height;
      if (newCw === 0 || newCh === 0) return;

      const sizeChanged = Math.abs(cw - newCw) > 1 || Math.abs(ch - newCh) > 1;
      cw = newCw; ch = newCh;
      curDpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(cw * curDpr);
      canvas.height = Math.floor(ch * curDpr);
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;

      // Update Boundaries
      if (floor) Matter.Composite.remove(engine.world, [floor, wallL, wallR]);

      floor = Matter.Bodies.rectangle(cw / 2, ch + 50, cw * 2, 100, { isStatic: true, friction: 0.1 });
      wallL = Matter.Bodies.rectangle(-50, ch / 2, 100, ch * 3, { isStatic: true, friction: 0 });
      wallR = Matter.Bodies.rectangle(cw + 50, ch / 2, 100, ch * 3, { isStatic: true, friction: 0 });
      Matter.Composite.add(engine.world, [floor, wallL, wallR]);

      // Seed if empty
      const bodies = Matter.Composite.allBodies(engine.world).filter(b => !b.isStatic);
      if (bodies.length === 0) {
        Matter.Composite.add(engine.world, mouseRepulsor);

        const top = ch * (1 - FILL);
        const fh = ch - top;
        const avg = (MIN_FS + MAX_FS) / 2;
        const count = Math.min(Math.floor((cw * fh * 0.9) / (avg * avg * 0.8)), 460);

        const cols = Math.ceil(Math.sqrt(count * (cw / fh)));
        const rows = Math.ceil(count / cols);
        const colW = cw / cols, rowH = fh / rows;

        const newBodies: Matter.Body[] = [];
        for (let i = 0; i < count; i++) {
          const c = i % cols, r = Math.floor(i / cols);
          const fs = MIN_FS + Math.random() * (MAX_FS - MIN_FS);
          const radius = fs * 0.57; // Hitbox multiplier

          const x = colW * c + colW * 0.5 + (Math.random() - 0.5) * colW * 0.3;
          const y = top + rowH * r + rowH * 0.5 + (Math.random() - 0.5) * rowH * 0.2;

          const body = Matter.Bodies.circle(x, y, radius, {
            restitution: 0.05,   // very low bounce prevents micro-bouncing jitter
            friction: 0.05,      // enough friction to let them grip and rest, avoiding ice-like slipping
            frictionAir: 0.01,   // slightly less air drag for a more natural fall
            density: 0.001,
            sleepThreshold: 20,  // sleep when still to save CPU and stop micro-movements
          });

          const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          const col = pickColor();
          const alpha = 0.75 + Math.random() * 0.25;
          const bold = Math.random() < 0.6;
          const outlined = Math.random() < 0.2;

          (body as any).spriteData = makeSprite(fs, sym, col, alpha, bold, outlined);
          newBodies.push(body);
        }
        Matter.Composite.add(engine.world, newBodies);
      } else if (sizeChanged) {
        // Wake all bodies on resize so they fall to new floor
        bodies.forEach(b => Matter.Sleeping.set(b, false));
      }
    };
    resize();
    requestAnimationFrame(resize);

    const resObs = new ResizeObserver(resize);
    resObs.observe(container);

    const wakeObs = new IntersectionObserver(
      ([e]) => { awakeRef.current = e.isIntersecting; },
      { rootMargin: '300px' },
    );
    wakeObs.observe(container);

    // Runner manages the engine ticks smoothly
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    let lastMouseX = -9999, lastMouseY = -9999;
    let mouseVx = 0, mouseVy = 0;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;

      if (lastMouseX > -9000) {
        mouseVx = nx - lastMouseX;
        mouseVy = ny - lastMouseY;
      }
      lastMouseX = nx;
      lastMouseY = ny;

      // Move repulsor
      Matter.Body.setPosition(mouseRepulsor, { x: lastMouseX, y: lastMouseY });
    };

    const onLeave = () => {
      lastMouseX = -9999; lastMouseY = -9999;
      mouseVx = 0; mouseVy = 0;
      Matter.Body.setPosition(mouseRepulsor, { x: -9999, y: -9999 });
    };

    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerleave', onLeave);

    const tick = () => {
      if (cw > 0 && awakeRef.current) {
        // Apply liquid drag forces and WAVES
        if (lastMouseX > -9000) {
          const bodies = Matter.Composite.allBodies(engine.world);
          const speed = Math.sqrt(mouseVx * mouseVx + mouseVy * mouseVy);

          for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            if (b.isStatic) continue;
            const dx = b.position.x - lastMouseX;
            const dy = b.position.y - lastMouseY;
            const d2 = dx * dx + dy * dy;

            if (d2 < CUR_R * CUR_R * 1.5) {
              Matter.Sleeping.set(b, false);

              if (d2 > 100) {
                const dist = Math.sqrt(d2);
                // 1. Radial push (solid object displacement)
                const radialForce = (CUR_R * 1.2 - dist) * 0.000001;
                let fx = (dx / dist) * Math.max(0, radialForce);
                let fy = (dy / dist) * Math.max(0, radialForce);

                // 2. Wave transfer (viscosity/momentum) - apply strong impulse when mouse moves fast
                if (speed > 2) {
                  // Apply a fraction of mouse velocity to create a splash/wave
                  fx += mouseVx * 0.00005;
                  fy += mouseVy * 0.00005;
                }

                Matter.Body.applyForce(b, b.position, { x: fx, y: fy });
              }
            }
          }

          // Decay mouse velocity so it doesn't push when still
          mouseVx *= 0.8;
          mouseVy *= 0.8;
        }

        // Render
        ctx.setTransform(curDpr, 0, 0, curDpr, 0, 0);
        ctx.clearRect(0, 0, cw, ch);

        const bodies = Matter.Composite.allBodies(engine.world);
        for (let i = 0; i < bodies.length; i++) {
          const b = bodies[i];
          if (b.isStatic) continue;
          const sd = (b as any).spriteData as SpriteData;
          if (!sd) continue;

          if (b.position.y + sd.fs < 0 || b.position.y - sd.fs > ch) continue;

          const hs = sd.spSz * 0.5;
          const cos = Math.cos(b.angle), sin = Math.sin(b.angle);
          ctx.setTransform(curDpr * cos, curDpr * sin, -curDpr * sin, curDpr * cos, curDpr * b.position.x, curDpr * b.position.y);
          ctx.drawImage(sd.sprite, -hs, -hs);
        }
        ctx.setTransform(curDpr, 0, 0, curDpr, 0, 0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      resObs.disconnect(); wakeObs.disconnect();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      Matter.Engine.clear(engine);
    };
  }, []);

  useGSAP(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const text = textRef.current;
    if (!section || !container || !text) return;

    gsap.set(text, { autoAlpha: 0, y: 28 });
    gsap.set('.slot-track', { yPercent: 0 });

    const textIn = gsap.to(text, {
      autoAlpha: 1, y: 0, duration: 0.95, ease: 'power3.out',
      scrollTrigger: { trigger: container, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
    const slot = gsap.timeline({
      repeat: -1, repeatDelay: 1.4,
      scrollTrigger: { trigger: container, start: 'top 70%', end: 'bottom top', toggleActions: 'play pause resume pause' },
    });
    slot
      .to('.slot-track', { yPercent: -50, duration: 0.55, ease: 'power3.inOut', stagger: { amount: 2, from: 'random' } })
      .to('.slot-track', { yPercent: 0, duration: 0 }, '+=0.3');

    return () => {
      textIn.scrollTrigger?.kill(); textIn.kill();
      slot.scrollTrigger?.kill(); slot.kill();
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="math-fluid relative w-full h-screen">
      <div ref={containerRef} className="math-fluid__sticky relative h-full w-full overflow-hidden bg-white">
        <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />
        <div ref={textRef} className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-[#111]">
          <p className="mb-5 font-[family-name:var(--font-sans)] text-[clamp(0.78rem,1vw,0.95rem)] font-medium uppercase tracking-[0.22em] text-[#303030]/70">
            tienes una idea en mente?
          </p>
          <Link href="/contacto" className="pointer-events-auto transition-transform hover:scale-105 duration-300">
            <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3.4rem,9vw,8.4rem)] font-bold uppercase leading-[1.05] tracking-[-0.045em] drop-shadow-sm">
              <span className="block"><SlotWord word="Trabajemos" idPrefix="t" /></span>
              <span className="block"><SlotWord word="juntos!" idPrefix="j" /></span>
            </h2>
          </Link>
        </div>
      </div>
    </section>
  );
}
