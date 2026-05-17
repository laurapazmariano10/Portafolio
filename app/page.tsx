'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback, type CSSProperties } from 'react';
import { Navbar } from '@/components/navbar';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SignatureSVG from '@/components/SignatureSVG';
import EditorialSignatureScene from '@/components/EditorialSignatureScene';
import LoadingScreen from '@/components/LoadingScreen';
import ServicesAboutSections from '@/components/ServicesAboutSections';
import { projectTransitionLog } from '@/components/projects/projectAnimationConfig';

type LiquidSceneProps = {
  isGlobalRevealed?: boolean;
  onTrailUpdate: (trail: Array<{ x: number; y: number; z: number }>, screenW: number, screenH: number, globalRevealVal: number) => void;
  onReady: () => void;
  sceneProgressOverride: number | undefined;
  containerStyle: CSSProperties | undefined;
  backgroundOnly?: boolean;
  dpr?: number[];
  interactionEnabled?: boolean;
};

const LiquidScene = dynamic<LiquidSceneProps>(() => import('@/components/LiquidScene').then((mod) => mod.default), { ssr: false });

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HERO_REVEAL_SCROLL_FACTOR = 0.62;

// ═══════════════════════════════════════════════════════════════════
// REPLICACIÓN EXACTA DEL SDF DEL SHADER EN CANVAS 2D
// Mismas cápsulas + smin + smoothstep que fragmentBackground/fragmentLiquid
// ═══════════════════════════════════════════════════════════════════

function smin(a: number, b: number, k: number): number {
  if (k < 0.00001) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.min(a, b) - h * h * h * k * (1.0 / 6.0);
}

function sdCapsule(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  r1: number, r2: number
): number {
  const pax = px - ax, pay = py - ay;
  const bax = bx - ax, bay = by - ay;
  const dotB = bax * bax + bay * bay;
  const h = dotB > 0.00001 ? Math.max(0, Math.min(1, (pax * bax + pay * bay) / dotB)) : 0;
  const r = r1 + (r2 - r1) * h;
  const dx = pax - bax * h;
  const dy = pay - bay * h;
  return Math.sqrt(dx * dx + dy * dy) - r;
}

// Smoothstep idéntico al de GLSL
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Dibuja la máscara SDF en el canvas de máscara.
 * Replica 1:1 la lógica de máscara del fragmentBackground shader.
 */
function renderSdfMask(
  ctx: CanvasRenderingContext2D,
  imgData: ImageData,
  trail: Array<{ x: number; y: number; z: number }>,
  screenW: number,
  screenH: number,
  globalReveal: number
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const data = imgData.data;
  const aspect = screenW / Math.max(screenH, 1);
  const SMIN_K = 0.020;

  for (let py = 0; py < h; py++) {
    // V en UV: shader tiene vUv.y = 0 abajo, 1 arriba
    const v = 1.0 - py / h;
    for (let px = 0; px < w; px++) {
      const u = px / w;

      // Corrección de aspecto idéntica al shader: p.x *= (s.x / s.y)
      const cx = u * aspect;
      const cy = v;

      let maxR = 0;
      let d = 100.0;

      for (let i = 0; i < 9; i++) {
        const t0 = trail[i];
        const t1 = trail[i + 1];

        const ax = t0.x * aspect;
        const ay = t0.y;
        const bx = t1.x * aspect;
        const by = t1.y;
        const r1 = t0.z;
        const r2 = t1.z;

        maxR = Math.max(maxR, r1, r2);

        const dist = sdCapsule(cx, cy, ax, ay, bx, by, r1, r2);
        const currentSminK = Math.min(SMIN_K, Math.max(r1, r2) * 0.6);
        d = smin(d, dist, currentSminK);
      }

      // isActive: idéntico al shader smoothstep(0.0001, 0.005, maxR)
      const isActive = smoothstep(0.0001, 0.005, maxR);

      // mask: idéntico al shader (1.0 - smoothstep(0.0, 0.002, d)) * isActive
      const cursorMask = (1.0 - smoothstep(0.0, 0.002, d)) * isActive;

      // Combinar con globalReveal (max, idéntico al shader)
      const mask = Math.max(cursorMask, globalReveal);

      const idx = (py * w + px) * 4;
      const v8 = (mask * 255) | 0; // Fast floor
      data[idx]     = 255;  // R
      data[idx + 1] = 255;  // G
      data[idx + 2] = 255;  // B
      data[idx + 3] = v8;   // Alpha = máscara (blanco donde se revela)
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

export default function Home() {
  const [isGlobalRevealed, setIsGlobalRevealed] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [isTouchViewport, setIsTouchViewport] = useState(false);
  const [isTouchRevealActive, setIsTouchRevealActive] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousBodyOverflowRef = useRef('');
  const previousHtmlOverflowRef = useRef('');

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const restoreInitialScroll = (phase: string) => {
      if (window.location.hash === '#projects') {
        const projects = document.getElementById('projects');
        projectTransitionLog('home hash restore attempt', {
          phase,
          hash: window.location.hash,
          hasProjects: Boolean(projects),
          beforeScrollY: window.scrollY,
          projectsRect: projects?.getBoundingClientRect(),
        });
        projects?.scrollIntoView({ block: 'start' });
        projectTransitionLog('home hash restore applied', {
          phase,
          afterScrollY: window.scrollY,
          projectsRect: projects?.getBoundingClientRect(),
        });
        return;
      }

      projectTransitionLog('home initial scroll reset to top', {
        phase,
        beforeScrollY: window.scrollY,
        pathname: window.location.pathname,
        hash: window.location.hash,
      });
      window.scrollTo(0, 0);
    };

    restoreInitialScroll('layout-effect');
    const frameId = window.requestAnimationFrame(() => restoreInitialScroll('raf-1'));
    const settleIds = window.location.hash === '#projects'
      ? [120, 360, 720].map((delay) => window.setTimeout(() => restoreInitialScroll(`timeout-${delay}`), delay))
      : [];
    return () => {
      window.cancelAnimationFrame(frameId);
      settleIds.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (!webglReady) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(id);
  }, [webglReady]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => {
      setIsTouchViewport(media.matches);
      if (!media.matches) setIsTouchRevealActive(false);
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isTouchViewport || !isTouchRevealActive) {
      document.body.style.overflow = previousBodyOverflowRef.current;
      document.documentElement.style.overflow = previousHtmlOverflowRef.current;
      return;
    }

    previousBodyOverflowRef.current = document.body.style.overflow;
    previousHtmlOverflowRef.current = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflowRef.current;
      document.documentElement.style.overflow = previousHtmlOverflowRef.current;
    };
  }, [isTouchViewport, isTouchRevealActive]);

  useEffect(() => {
    if (isTouchViewport && !isTouchRevealActive) {
      const resetTimer = window.setTimeout(() => setIsGlobalRevealed(false), 0);
      return () => window.clearTimeout(resetTimer);
    }
  }, [isTouchViewport, isTouchRevealActive]);

  // Canvas de máscara SDF
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imgDataRef = useRef<ImageData | null>(null);
  const heroWhiteLayerRef = useRef<HTMLDivElement>(null);
  const nameWhiteLayerRef = useRef<HTMLDivElement>(null);
  const nameBaseRef = useRef<HTMLHeadingElement>(null);
  const lastMaskUpdateRef = useRef(0);
  const maskModeRef = useRef<'hidden' | 'dynamic' | 'full' | null>(null);
  const cursorRevealEnabledRef = useRef(true);

  // Scroll Refs
  const heroRef = useRef<HTMLElement>(null);
  const heroFadingLayerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const heroFadingLayer = heroFadingLayerRef.current;
    const hero = heroRef.current;
    const nameBase = nameBaseRef.current;
    if (!heroFadingLayer || !hero) return;

    const tween = gsap.to(heroFadingLayer, {
      autoAlpha: 0,
      clearProps: 'transform',
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'bottom bottom',
        end: () => `+=${Math.max(window.innerHeight * HERO_REVEAL_SCROLL_FACTOR, 1)}`,
        scrub: 0.55,
        invalidateOnRefresh: true,
      },
    });

    const cursorRevealTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: () => window.innerHeight * HERO_REVEAL_SCROLL_FACTOR,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        cursorRevealEnabledRef.current = self.progress < 0.995;
        if (!cursorRevealEnabledRef.current && maskModeRef.current !== 'hidden') {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setIsGlobalRevealed(false);
          [heroWhiteLayerRef.current, nameWhiteLayerRef.current].forEach((layer) => {
            if (!layer) return;
            layer.style.opacity = '0';
            layer.style.maskImage = 'none';
            layer.style.webkitMaskImage = 'none';
          });
          maskModeRef.current = 'hidden';
        }
      },
    });

    const nameColorTween = nameBase
      ? gsap.to(nameBase, {
          color: '#FFFFFF',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: () => window.innerHeight * HERO_REVEAL_SCROLL_FACTOR,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      : null;

    const nameHideTrigger = ScrollTrigger.create({
      trigger: '#services-about',
      start: 'top 92%',
      end: 'top 62%',
      scrub: true,
      onUpdate: (self) => {
        const opacity = 1 - self.progress;
        if (nameBaseRef.current) nameBaseRef.current.style.opacity = `${opacity}`;
        if (nameWhiteLayerRef.current) nameWhiteLayerRef.current.style.opacity = '0';
      },
      onLeave: () => {
        if (nameBaseRef.current) nameBaseRef.current.style.opacity = '0';
        if (nameWhiteLayerRef.current) nameWhiteLayerRef.current.style.opacity = '0';
      },
      onEnterBack: () => {
        if (nameBaseRef.current) nameBaseRef.current.style.opacity = '1';
      },
    });

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
      cursorRevealTrigger.kill();
      if (nameColorTween?.scrollTrigger) nameColorTween.scrollTrigger.kill();
      nameColorTween?.kill();
      nameHideTrigger.kill();
    };
  }, []);

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Resolución de la máscara (bajo = rápido, la forma orgánica no necesita alta res)
  const MASK_W = 192;
  const MASK_H = 108; // 16:9

  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (canvas) {
      canvas.width = MASK_W;
      canvas.height = MASK_H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      maskCtxRef.current = ctx;
      if (ctx) {
        imgDataRef.current = ctx.createImageData(MASK_W, MASK_H);
      }
    }
  }, []);

  // Callback que se ejecuta cada frame dentro del useFrame del WebGL
  const handleTrailUpdate = useCallback(
    (trail: Array<{ x: number; y: number; z: number }>, screenW: number, screenH: number, globalRevealVal: number) => {
      const ctx = maskCtxRef.current;
      const imgData = imgDataRef.current;
      const canvas = maskCanvasRef.current;
      const revealLayers = [heroWhiteLayerRef.current, nameWhiteLayerRef.current].filter(Boolean) as HTMLDivElement[];
      if (!ctx || !imgData || !canvas || revealLayers.length === 0) return;

      if (!cursorRevealEnabledRef.current) {
        if (maskModeRef.current !== 'hidden') {
          revealLayers.forEach((layer) => {
            layer.style.opacity = '0';
            layer.style.maskImage = 'none';
            layer.style.webkitMaskImage = 'none';
          });
          maskModeRef.current = 'hidden';
        }
        return;
      }

      const hasCursorReveal = trail.some((node) => node.z > 0.001);
      const reveal = Math.max(0, Math.min(1, globalRevealVal));

      if (reveal >= 0.995) {
        if (maskModeRef.current !== 'full') {
          revealLayers.forEach((layer) => {
            layer.style.opacity = '1';
            layer.style.maskImage = 'none';
            layer.style.webkitMaskImage = 'none';
          });
          maskModeRef.current = 'full';
        }
        return;
      }

      if (!hasCursorReveal && reveal <= 0.001) {
        if (maskModeRef.current !== 'hidden') {
          revealLayers.forEach((layer) => {
            layer.style.opacity = '0';
            layer.style.maskImage = 'none';
            layer.style.webkitMaskImage = 'none';
          });
          maskModeRef.current = 'hidden';
        }
        return;
      }

      const now = performance.now();
      if (maskModeRef.current === 'dynamic' && now - lastMaskUpdateRef.current < 33) {
        return;
      }

      revealLayers.forEach((layer) => {
        layer.style.opacity = '1';
      });

      // Renderizar la máscara SDF con la misma matemática del shader.
      renderSdfMask(ctx, imgData, trail, screenW, screenH, globalRevealVal);

      // Evitamos regenerar el data URL a 60fps; la máscara aguanta muy bien a ~30fps.
      const dataUrl = canvas.toDataURL();
      revealLayers.forEach((layer) => {
        layer.style.maskImage = `url(${dataUrl})`;
        layer.style.webkitMaskImage = `url(${dataUrl})`;
      });
      lastMaskUpdateRef.current = now;
      maskModeRef.current = 'dynamic';
    },
    []
  );

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsGlobalRevealed(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsGlobalRevealed(false);
  };

  return (
    <main className="relative w-full text-black bg-transparent" suppressHydrationWarning>
      <LoadingScreen webglReady={webglReady} />
      
      {/* FONDO WEBGL FIJO (Se oscurece solo con el scroll) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <LiquidScene
          isGlobalRevealed={isGlobalRevealed}
          onTrailUpdate={handleTrailUpdate}
          onReady={() => setWebglReady(true)}
          sceneProgressOverride={undefined}
          containerStyle={isTouchViewport && !isTouchRevealActive ? { pointerEvents: 'none' } : undefined}
          interactionEnabled={!isTouchViewport || isTouchRevealActive}
        />
      </div>

      <div ref={heroFadingLayerRef} className="fixed inset-0 z-20 pointer-events-none">
        {/* Canvas oculto para generar la máscara SDF (no visible) */}
        <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

      {/* CAPA BASE: TEXTOS EN NEGRO (siempre visibles, debajo) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* FIRMA — Esquina Superior Izquierda */}
        <div className="absolute left-5 top-[6.1875rem] w-32 drop-shadow-md sm:w-40 md:left-8 md:top-[6.9375rem] md:w-48 lg:left-10 lg:top-10 lg:w-[22rem]">
          <SignatureSVG color="#1D1D1B" className="w-full h-auto opacity-90" />
        </div>
      </div>

      {/* CAPA REVELADA: TEXTOS EN BLANCO (mascarada con SDF idéntico al shader) */}
      <div 
        ref={heroWhiteLayerRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 31,
          maskImage: 'none',
          WebkitMaskImage: 'none',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%' as any,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat' as any,
          opacity: 0,
        }}
      >
        {/* FIRMA BLANCA — misma posición exacta */}
        <div className="absolute left-5 top-[6.1875rem] w-32 sm:w-40 md:left-8 md:top-[6.9375rem] md:w-48 lg:left-10 lg:top-10 lg:w-[22rem]">
          <SignatureSVG color="#FFFFFF" className="w-full h-auto" />
        </div>
        <div className="absolute right-5 top-[6.0875rem] z-30 pointer-events-none select-none md:right-8 md:top-[6.9375rem] lg:hidden">
          <h1
            className="text-right text-[clamp(1.45rem,8.8vw,2.25rem)] font-bold uppercase leading-[0.82] tracking-[-0.03em] md:text-[clamp(2rem,6.4vw,3rem)]"
            style={{ fontFamily: 'var(--font-serif)', color: '#FFFFFF' }}
          >
            Mariano<br />Laura
          </h1>
        </div>
      </div>

      {/* MINI TARJETA REVELADORA — solo en la pantalla principal */}
      <div
        className="absolute bottom-8 left-8 z-30 hidden cursor-default group pointer-events-auto lg:bottom-10 lg:left-10 lg:block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-[4.5rem] h-[6.5rem] md:w-[5.5rem] md:h-[8rem] transition-all duration-500 ease-out group-hover:scale-[1.03]">
          <div className="absolute top-0 left-0 right-0 h-px bg-[#1D1D1B]/50 group-hover:bg-[#1D1D1B]/70 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1D1D1B]/50 group-hover:bg-[#1D1D1B]/70 transition-colors duration-500" />
          <div className="absolute top-[20%] bottom-[20%] left-0 w-px bg-[#1D1D1B]/50 group-hover:bg-[#1D1D1B]/70 transition-colors duration-500" />
          <div className="absolute top-[20%] bottom-[20%] right-0 w-px bg-[#1D1D1B]/50 group-hover:bg-[#1D1D1B]/70 transition-colors duration-500" />

          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <Image
              src="/Hero.webp"
              alt=""
              fill
              sizes="320px"
              unoptimized
              className="object-cover opacity-60 transition-opacity duration-500 pointer-events-none group-hover:opacity-75"
              style={{ objectPosition: '50% 48%' }}
            />
          </div>

          <div className="absolute bottom-[5px] left-0 right-0 flex justify-center pointer-events-none">
            <span className="whitespace-nowrap rounded-full bg-white/86 px-1.5 py-[2px] text-[0.5rem] font-semibold leading-none tracking-normal text-[#1D1D1B]/78 shadow-[0_3px_10px_rgba(0,0,0,0.08)] transition-colors duration-500 group-hover:bg-white/94 group-hover:text-[#1D1D1B]/88 md:text-[0.58rem]">
              0.5 seg
            </span>
          </div>

          <div className="absolute top-[6px] right-[6px] w-1 h-1 rounded-full bg-[#1D1D1B]/50 group-hover:bg-[#1D1D1B]/70 transition-all duration-500" />
        </div>
      </div>
      <div className="absolute right-5 top-[6.0875rem] z-30 pointer-events-none select-none md:right-8 md:top-[6.9375rem] lg:hidden">
        <h1
          className="text-right text-[clamp(1.45rem,8.8vw,2.25rem)] font-bold uppercase leading-[0.82] tracking-[-0.03em] md:text-[clamp(2rem,6.4vw,3rem)]"
          style={{ fontFamily: 'var(--font-serif)', color: '#1D1D1B' }}
        >
          Mariano<br />Laura
        </h1>
      </div>
      <button
        type="button"
        aria-pressed={isTouchRevealActive}
        onClick={() => setIsTouchRevealActive((active) => !active)}
        className="pointer-events-auto absolute bottom-8 right-5 z-30 flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-[0.48rem] font-bold uppercase tracking-[0.18em] text-white/95 shadow-[0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-md transition-colors duration-300 md:right-8 lg:hidden"
      >
        <span>{isTouchRevealActive ? 'Tap para scrollear' : 'Tap para interactuar'}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-[0.7rem] text-[1rem] shadow-[0_10px_24px_rgba(104,114,242,0.25)] transition-colors duration-300 ${isTouchRevealActive ? 'bg-white text-[#6872F2]' : 'bg-[#6872F2] text-white'}`}>
          {isTouchRevealActive ? '×' : '↯'}
        </span>
      </button>
      </div>

      <div className="fixed right-8 top-8 z-40 hidden pointer-events-none select-none lg:right-10 lg:top-10 lg:block">
        <h1
          ref={nameBaseRef}
          className="text-[5.5rem] font-bold uppercase leading-[0.8] tracking-[-0.03em] text-right"
          style={{ fontFamily: 'var(--font-serif)', color: '#1D1D1B' }}
        >
          Mariano<br />Laura
        </h1>
      </div>

      <div
        ref={nameWhiteLayerRef}
        className="fixed inset-0 z-50 hidden pointer-events-none select-none lg:block"
        style={{
          maskImage: 'none',
          WebkitMaskImage: 'none',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%' as any,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat' as any,
          opacity: 0,
        }}
      >
        <div className="absolute right-8 top-8 lg:right-10 lg:top-10">
          <h1
            className="text-[5.5rem] font-bold uppercase leading-[0.8] tracking-[-0.03em] text-right"
            style={{ fontFamily: 'var(--font-serif)', color: '#FFFFFF' }}
          >
            Mariano<br />Laura
          </h1>
        </div>
      </div>

      {/* 1. SECCIÓN HERO (espacio de scroll inicial) */}
      <section ref={heroRef} className="relative min-h-screen w-full bg-transparent pointer-events-none">

      </section>

      {/* 2. ESCENA EDITORIAL STICKY */}
      <EditorialSignatureScene />

      <ServicesAboutSections />

      {/* NAVBAR */}
      <Navbar />
    </main>
  );
}
