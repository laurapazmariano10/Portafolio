import { Group, PerspectiveCamera, Box3, Vector3 } from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── UTILIDADES ───────────────────────────────────────────────────────────────
/** Interpolación lineal entre dos valores */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/** Curva de Bezier Cuadrática (Parábola suave) */
function bezier(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

/** Interpola entre dos poses usando interpolación lineal (para tramos simples) */
function lerpPose(
  A: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number },
  B: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number },
  t: number,
) {
  return {
    pos: { x: lerp(A.pos.x, B.pos.x, t), y: lerp(A.pos.y, B.pos.y, t), z: lerp(A.pos.z, B.pos.z, t) },
    rot: { x: lerp(A.rot.x, B.rot.x, t), y: lerp(A.rot.y, B.rot.y, t), z: lerp(A.rot.z, B.rot.z, t) },
    scale: lerp(A.scale, B.scale, t),
  };
}

/** Genera una trayectoria parabólica suave usando un punto de control (curva Bezier) */
function bezierPose(
  A: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number },
  Control: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number },
  B: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number },
  t: number,
) {
  return {
    pos: {
      x: bezier(A.pos.x, Control.pos.x, B.pos.x, t),
      y: bezier(A.pos.y, Control.pos.y, B.pos.y, t),
      z: bezier(A.pos.z, Control.pos.z, B.pos.z, t),
    },
    rot: {
      x: bezier(A.rot.x, Control.rot.x, B.rot.x, t),
      y: bezier(A.rot.y, Control.rot.y, B.rot.y, t),
      z: bezier(A.rot.z, Control.rot.z, B.rot.z, t),
    },
    scale: bezier(A.scale, Control.scale, B.scale, t),
  };
}

// ─── POSES MAESTRAS (fuente de verdad) ───────────────────────────────────────
const POSES = {
  S1_HERO: {
    pos: { x: -0.850, y: -3.950, z: -6.000 },
    rot: { x: -3.100, y: -3.150, z: -1.650 },
    scale: 0.250,
    camZ: 5.500,
  },
  S2_ABOUT: {
    pos: { x: 1.850, y: 0.300, z: -1.200 },
    rot: { x: 0.240, y: -3.150, z: 0.000 },
    scale: 0.150,
    camZ: 5.500,
  },
  WP_GAP_1: {
    pos: { x: -0.550, y: -1.200, z: -6.000 },
    rot: { x: -3.100, y: -0.050, z: -1.650 },
    scale: 0.250,
    camZ: 5.500,
  },
  S3_SERVICES: {
    pos: { x: -2.100, y: 0.300, z: -0.350 },
    rot: { x: 0.390, y: 0.150, z: -0.050 },
    scale: 0.150,
    camZ: 5.500,
  },
  WP_GAP_2: {
    pos: { x: -0.550, y: -2.200, z: -6.000 },
    rot: { x: -1.020, y: -3.150, z: -1.650 },
    scale: 0.250,
    camZ: 5.500,
  },
  S4_STACK: {
    pos: { x: 5.450, y: 0.550, z: -6.000 },
    rot: { x: 0.190, y: -3.150, z: 0.000 },
    scale: 0.500,
    camZ: 11.300,
  },
} as const;

// ─── POSE FINAL (incrustada) ──────────────────────────────────────────────────
const POSE_FINAL = {
  rot: { x: -3.15, y: -0.05, z: 1.26 - Math.PI * 4 },
  pos: { y: -1.5 },
};

export function setupScrollAnimation(
  axe: Group,
  camera: PerspectiveCamera,
  wrapper: HTMLElement,
  canvas: HTMLCanvasElement,
): () => void {

  // 1. Centrar el modelo en su propio origen
  const rawBox = new Box3().setFromObject(axe);
  const center = new Vector3();
  rawBox.getCenter(center);
  axe.position.sub(center);

  // 2. Pose inicial (Hero)
  gsap.set(axe.position, POSES.S1_HERO.pos);
  gsap.set(axe.rotation, POSES.S1_HERO.rot);
  gsap.set(axe.scale, { x: POSES.S1_HERO.scale, y: POSES.S1_HERO.scale, z: POSES.S1_HERO.scale });
  gsap.set(camera.position, { z: POSES.S1_HERO.camZ });
  gsap.set(canvas, { filter: 'drop-shadow(0px 30px 25px rgba(0,0,0,0.6))', y: 0 });

  // ─── CÁLCULO MILIMÉTRICO 1:1 CON EL DOM ──────────────────────────────────
  const vp = window.innerHeight;
  const halfH = vp / 2;

  const heroEl    = document.getElementById('hero-section');
  const aboutEl   = document.getElementById('about-me-section');
  const servicesEl = document.getElementById('services-section');
  const stackEl   = document.getElementById('stack-section');

  const getTop = (el: HTMLElement | null): number => {
    if (!el) return 0;
    let offset = 0;
    let node: HTMLElement | null = el;
    while (node && node !== wrapper) {
      offset += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return offset;
  };

  const heroTop    = getTop(heroEl);
  const aboutTop   = getTop(aboutEl);
  const servicesTop = getTop(servicesEl);
  const stackTop   = getTop(stackEl);

  const heroH     = heroEl    ? heroEl.offsetHeight    : vp;
  const aboutH    = aboutEl   ? aboutEl.offsetHeight   : vp;
  const servicesH = servicesEl ? servicesEl.offsetHeight : vp;
  const stackH    = stackEl   ? stackEl.offsetHeight   : vp * 2;

  // Puntos maestros de scroll
  const raw_S1  = 0;
  const raw_S2  = aboutTop  + aboutH  / 2 - halfH;
  const raw_S3  = servicesTop + servicesH / 2 - halfH;
  const raw_S4  = stackTop  - halfH * 0.6;

  // Scroll total = fondo de la sección Stack toca fondo de pantalla
  const scrollMax   = stackTop + stackH - vp;
  const raw_SpinEnd = scrollMax;

  // Clamp estrictamente creciente
  const GAP  = 20;
  const t_S1  = raw_S1;
  const t_S2  = Math.max(t_S1  + GAP, raw_S2);
  const t_S3  = Math.max(t_S2  + GAP, raw_S3);
  const t_S4  = Math.max(t_S3  + GAP, raw_S4);
  const t_End = Math.max(t_S4  + GAP, raw_SpinEnd);

  // Duraciones de cada tramo principal
  const dur_S1toS2  = t_S2  - t_S1;
  const dur_S2toS3  = t_S3  - t_S2;
  const dur_S3toS4  = t_S4  - t_S3;
  const dur_Spin    = t_End - t_S4;
  const dur_Hold    = Math.max(0, scrollMax - t_End);

  // ─── HELPER: añade sub-waypoints interpolados (LINEAL) ─────────────
  function addSegment(
    tl: gsap.core.Timeline,
    from: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number; camZ?: number },
    to:   { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number; camZ?: number },
    totalDur: number,
    position: string | number,
    steps = 4,
  ) {
    const stepDur = totalDur / steps;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const p = lerpPose(from, to, t);
      tl
        .to(axe.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z, duration: stepDur, ease: 'none' }, i === 1 ? position : '>')
        .to(axe.rotation, { x: p.rot.x, y: p.rot.y, z: p.rot.z, duration: stepDur, ease: 'none' }, '<')
        .to(axe.scale,    { x: p.scale,  y: p.scale,  z: p.scale,  duration: stepDur, ease: 'none' }, '<');
      if (to.camZ !== undefined && from.camZ !== undefined) {
        tl.to(camera.position, { z: lerp(from.camZ, to.camZ, t), duration: stepDur, ease: 'none' }, '<');
      }
    }
  }

  // ─── HELPER: añade sub-waypoints interpolados (BEZIER / CURVA) ─────────────
  function addBezierSegment(
    tl: gsap.core.Timeline,
    from: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number; camZ?: number },
    control: { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number },
    to:   { pos: { x: number; y: number; z: number }; rot: { x: number; y: number; z: number }; scale: number; camZ?: number },
    totalDur: number,
    position: string | number,
    steps = 10,
  ) {
    const stepDur = totalDur / steps;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const p = bezierPose(from, control, to, t);
      tl
        .to(axe.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z, duration: stepDur, ease: 'none' }, i === 1 ? position : '>')
        .to(axe.rotation, { x: p.rot.x, y: p.rot.y, z: p.rot.z, duration: stepDur, ease: 'none' }, '<')
        .to(axe.scale,    { x: p.scale,  y: p.scale,  z: p.scale,  duration: stepDur, ease: 'none' }, '<');
      if (to.camZ !== undefined && from.camZ !== undefined) {
        tl.to(camera.position, { z: lerp(from.camZ, to.camZ, t), duration: stepDur, ease: 'none' }, '<');
      }
    }
  }

  // ─── MASTER TIMELINE ──────────────────────────────────────────────────────
  const masterTL = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${scrollMax}`,
      scrub: 0.8,      // Responsive sin delay excesivo
      invalidateOnRefresh: true,
      onLeave: () => {
        canvas.style.position = 'absolute';
        canvas.style.top      = `${scrollMax}px`;
        canvas.style.bottom   = 'auto';
      },
      onEnterBack: () => {
        canvas.style.position = 'fixed';
        canvas.style.top      = '0px';
        canvas.style.bottom   = '0px';
      },
    },
  });

  // Sombra en el primer tramo
  masterTL.to(canvas, {
    filter: 'drop-shadow(0px 30px 25px rgba(0,0,0,0.0))',
    duration: dur_S1toS2,
    ease: 'none',
  }, 0);

  // TRAMO 1 ─ Hero → About (Movimiento lineal simple inicial)
  addSegment(masterTL, POSES.S1_HERO, POSES.S2_ABOUT, dur_S1toS2, 0, 4);

  // TRAMO 2 ─ About → Services (Curva Parabólica usando WP_GAP_1 como punto de control)
  // Genera un barrido suave tipo "caída" sin detenerse en el gap
  addBezierSegment(masterTL, POSES.S2_ABOUT, POSES.WP_GAP_1, POSES.S3_SERVICES, dur_S2toS3, '>', 12);

  // TRAMO 3 ─ Services → Stack S4 (Curva Parabólica usando WP_GAP_2 como punto de control)
  addBezierSegment(masterTL, POSES.S3_SERVICES, POSES.WP_GAP_2, POSES.S4_STACK, dur_S3toS4, '>', 12);

  // TRAMO 6 ─ Gran giro + bajada hacia pose incrustada (6 sub-pasos)
  if (dur_Spin > 0) {
    const fromRot = { ...POSES.S4_STACK.rot };
    const toRot   = POSE_FINAL.rot;
    const fromPosY = POSES.S4_STACK.pos.y;
    const toPosY   = POSE_FINAL.pos.y;
    const steps    = 6;
    const stepDur  = dur_Spin / steps;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
      masterTL
        .to(axe.rotation, {
          x: lerp(fromRot.x, toRot.x, eased),
          y: lerp(fromRot.y, toRot.y, eased),
          z: lerp(fromRot.z, toRot.z, eased),
          duration: stepDur,
          ease: 'none',
        }, '>')
        .to(axe.position, {
          y: lerp(fromPosY, toPosY, eased),
          duration: stepDur,
          ease: 'none',
        }, '<');
    }
  }

  // TRAMO 7 ─ Hold
  if (dur_Hold > 0) {
    masterTL.to({}, { duration: dur_Hold }, '>');
  }

  // ─── CINEMATIC SCROLL REVEAL ─────────────────────────────────────────────
  // ScrollTrigger.create directo (más estable que gsap.fromTo + scrollTrigger anidado)
  // El contenido empieza a revelarse al 60% del vuelo del hacha — se ve la animación primero
  const revealSTs: ScrollTrigger[] = [];

  function revealSection(
    id: string,
    startScroll: number,
    endScroll: number,
    fromRight: boolean,
  ) {
    const el = document.getElementById(id);
    if (!el) return;

    const contentContainers = Array.from(el.children).filter(
      (c): c is HTMLElement => c instanceof HTMLElement && !c.hasAttribute('aria-hidden')
    );

    contentContainers.forEach((container) => {
      const innerChildren = Array.from(container.children).filter(
        (c): c is HTMLElement => c instanceof HTMLElement
      );

      const slideX = fromRight ? 90 : -90;
      const childCount = innerChildren.length;
      const staggerStep = childCount > 1 ? (endScroll - startScroll) / (childCount + 1) : (endScroll - startScroll) * 0.5;

      innerChildren.forEach((child, index) => {
        const childStart = startScroll + index * staggerStep;
        const childEnd = childStart + staggerStep * 1.3;

        // Estado inicial
        gsap.set(child, { opacity: 0, x: slideX, scale: 0.96 });

        // Animación scroll-driven con scrub ligero
        const tween = gsap.to(child, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          paused: true,
        });

        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: childStart,
          end: childEnd,
          scrub: 0.4,
          onUpdate: (self) => {
            tween.progress(self.progress);
          },
        });

        revealSTs.push(st);
      });
    });
  }

  // Services: empieza a revelarse al 60% del vuelo del hacha (About → Services)
  revealSection('services-section', t_S2 + dur_S2toS3 * 0.60, t_S3 + dur_S2toS3 * 0.20, true);

  // Stack: empieza a revelarse al 60% del vuelo del hacha (Services → Stack)
  revealSection('stack-section', t_S3 + dur_S3toS4 * 0.60, t_S4 + dur_S3toS4 * 0.20, false);

  // ─── Observador de resize ─────────────────────────────────────────────────
  const observer = new ResizeObserver(() => ScrollTrigger.refresh());
  observer.observe(wrapper);

  return () => {
    observer.disconnect();
    masterTL.kill();
    revealSTs.forEach((st) => st.kill());
    ScrollTrigger.getAll().forEach((st: ScrollTrigger) => st.kill());
  };
}
