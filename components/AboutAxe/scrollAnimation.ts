import { Box3, Group, PerspectiveCamera, Vector3 } from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── UTILIDADES ───────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function bezier(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

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

// ─── ESCALA GLOBAL ─────────────────────────────────────────────────────────
// Multiplicador para todas las escalas. 2.16 = 35% más grande que el ajuste anterior (1.6).
const SCALE_MULT = 2.16;
const S = (n: number) => n * SCALE_MULT;

const KATANA_DRAW_OFFSET = 5.5; // cuánto se desliza la katana al desenvainar (eje X mundo)
const INITIAL_KATANA_DRAW = 1.2; // katana arranca ya parcialmente fuera de la vaina (eje X+)

// ─── TRANSFORM ENVAINADO (compartido katana+vaina al inicio) ─────────────
// Ambos modelos comparten origen (0,0,0) en la handguard.
// Mismo transform → katana perfectamente envainada.
const SHEATHED_S1 = {
  pos: { x: -0.700, y: -3.950, z: -6.000 },
  rot: { x: 0, y: 0, z: Math.PI / 2 },       // Horizontal invertida: filo hacia la izquierda
  scale: S(0.325),
};

// Offset Y de la vaina respecto a la katana para evitar clipping por curvatura al desenvainar
const VAINA_Y_OFFSET = 0.06;
const VAINA_OFFSCREEN_X = -22;

// Pose intermedia: katana ya DESENVAINADA, deslizada en X+ a lo largo de su filo.
// Misma rotación, misma altura, solo X desplazado.
const S1_DRAWN = {
  pos: { x: SHEATHED_S1.pos.x + KATANA_DRAW_OFFSET, y: SHEATHED_S1.pos.y, z: SHEATHED_S1.pos.z },
  rot: { ...SHEATHED_S1.rot },
  scale: SHEATHED_S1.scale,
  camZ: 5.500,
};

// ─── POSES KATANA (S2-S4 con DOM intactas, solo escala global aumentada) ──
const KATANA_POSES = {
  S1_HERO: {
    ...SHEATHED_S1,
    camZ: 5.500,
  },
  S2_ABOUT: {
    pos: { x: 1.850, y: 0.300, z: -1.200 },
    rot: { x: 0.240, y: -3.150, z: 0.000 },
    scale: S(0.195),
    camZ: 5.500,
  },
  WP_GAP_1: {
    pos: { x: -0.550, y: -1.200, z: -6.000 },
    rot: { x: -3.100, y: -0.050, z: -1.650 },
    scale: S(0.325),
    camZ: 5.500,
  },
  S3_SERVICES: {
    pos: { x: -2.100, y: 0.300, z: -0.350 },
    rot: { x: 0.390, y: 0.150, z: -0.050 },
    scale: S(0.195),
    camZ: 5.500,
  },
  WP_GAP_2: {
    pos: { x: -2.100, y: -2.500, z: -6.000 },
    rot: { x: -1.020, y: -3.150, z: -1.650 },
    scale: S(0.325),
    camZ: 5.500,
  },
  S4_STACK: {
    pos: { x: 5.450, y: 0.550, z: -6.000 },
    rot: { x: 0.190, y: -3.150, z: 0.000 },
    scale: S(0.500),
    camZ: 11.300,
  },
  // S4 macro scan: katana vertical, grande y fija. La cámara recorre desde
  // el mango hasta la punta durante todo el scroll de la sección.
  // Giro invertido para que el mango pase cerca de cámara. Katana termina
  // completamente vertical y boca abajo (mango arriba, filo abajo).
  S4_CLOSEUP: {
    pos: { x: 2.900, y: 0.000, z: -3.600 },
    rot: { x: Math.PI, y: 3.200, z: 0 },
    scale: S(0.700),
    camZ: 4.600,
    camY_start: 5.000,
    camY_end:  -5.000,
  },
} as const;

export function setupScrollAnimation(
  katana: Group,
  vaina: Group,
  camera: PerspectiveCamera,
  wrapper: HTMLElement,
  canvas: HTMLCanvasElement,
): () => void {
  const isTouchLayout = window.matchMedia('(max-width: 1023px)').matches;

  if (isTouchLayout) {
    const mobileStart = {
      pos: { x: 0.000, y: -0.900, z: -6.200 },
      rot: { x: -2.900, y: -0.220, z: -0.950 },
      scale: S(0.210),
      camZ: 6.100,
    };
    const mobileServices = {
      pos: { x: 0.000, y: -0.340, z: -5.750 },
      rot: { x: -2.250, y: 0.550, z: -3.050 },
      scale: S(0.245),
      camZ: 5.850,
    };
    const mobileStack = {
      pos: { x: 0.000, y: 0.120, z: -5.450 },
      rot: { x: -1.650, y: 1.150, z: -5.650 },
      scale: S(0.285),
      camZ: 5.450,
    };
    const mobileStackFlow = {
      pos: { x: 0.000, y: -0.220, z: -5.850 },
      rot: { x: -2.950, y: 1.850, z: -8.550 },
      scale: S(0.235),
      camZ: 5.950,
    };
    const mobileStackExit = {
      pos: { x: 0.000, y: 0.360, z: -6.100 },
      rot: { x: -1.950, y: 2.450, z: -11.350 },
      scale: S(0.210),
      camZ: 6.100,
    };

    vaina.visible = false;
    gsap.set(katana.position, mobileStart.pos);
    gsap.set(katana.rotation, mobileStart.rot);
    gsap.set(katana.scale, { x: mobileStart.scale, y: mobileStart.scale, z: mobileStart.scale });
    gsap.set(camera.position, { x: 0, y: 0, z: mobileStart.camZ });
    gsap.set(canvas, { filter: 'drop-shadow(0px 18px 24px rgba(0,0,0,0.24))', y: 0, opacity: 1 });

    const stackEl = document.getElementById('stack-section');
    const processEl = document.getElementById('process-section');
    const contactEl = document.getElementById('contact');
    const getTop = (el: HTMLElement | null): number => {
      if (!el) return window.innerHeight * 2.4;
      let offset = 0;
      let node: HTMLElement | null = el;
      while (node && node !== wrapper) {
        offset += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return offset;
    };

    const stackTop = getTop(stackEl);
    const processTop = getTop(processEl);
    const endDistance = Math.max(processTop - window.innerHeight * 0.62, stackTop + window.innerHeight * 0.72);
    const mobileTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${endDistance}`,
        scrub: 0.40,
        invalidateOnRefresh: true,
      },
    });
    const ctaHideTrigger = processEl
      ? ScrollTrigger.create({
          trigger: processEl,
          start: 'bottom bottom',
          onEnter: () => gsap.set(canvas, { opacity: 0, visibility: 'hidden' }),
          onLeaveBack: () => gsap.set(canvas, { opacity: 1, visibility: 'visible' }),
        })
      : undefined;
    const contactHideTrigger = contactEl
      ? ScrollTrigger.create({
          trigger: contactEl,
          start: 'top bottom',
          onEnter: () => gsap.set(canvas, { opacity: 0, visibility: 'hidden', display: 'none' }),
          onLeaveBack: () => gsap.set(canvas, { opacity: 1, visibility: 'visible', display: 'block' }),
        })
      : undefined;

    mobileTimeline
      .to(katana.position, { ...mobileServices.pos, duration: 0.22, ease: 'none' }, 0)
      .to(katana.rotation, { ...mobileServices.rot, duration: 0.22, ease: 'none' }, 0)
      .to(katana.scale, { x: mobileServices.scale, y: mobileServices.scale, z: mobileServices.scale, duration: 0.22, ease: 'none' }, 0)
      .to(camera.position, { z: mobileServices.camZ, duration: 0.22, ease: 'none' }, 0)
      .to(katana.position, { ...mobileStack.pos, duration: 0.26, ease: 'none' }, 0.22)
      .to(katana.rotation, { ...mobileStack.rot, duration: 0.26, ease: 'none' }, 0.22)
      .to(katana.scale, { x: mobileStack.scale, y: mobileStack.scale, z: mobileStack.scale, duration: 0.26, ease: 'none' }, 0.22)
      .to(camera.position, { z: mobileStack.camZ, duration: 0.26, ease: 'none' }, 0.22)
      .to(katana.position, { ...mobileStackFlow.pos, duration: 0.28, ease: 'none' }, 0.48)
      .to(katana.rotation, { ...mobileStackFlow.rot, duration: 0.28, ease: 'none' }, 0.48)
      .to(katana.scale, { x: mobileStackFlow.scale, y: mobileStackFlow.scale, z: mobileStackFlow.scale, duration: 0.28, ease: 'none' }, 0.48)
      .to(camera.position, { z: mobileStackFlow.camZ, duration: 0.28, ease: 'none' }, 0.48)
      .to(katana.position, { ...mobileStackExit.pos, duration: 0.24, ease: 'none' }, 0.76)
      .to(katana.rotation, { ...mobileStackExit.rot, duration: 0.24, ease: 'none' }, 0.76)
      .to(katana.scale, { x: mobileStackExit.scale, y: mobileStackExit.scale, z: mobileStackExit.scale, duration: 0.24, ease: 'none' }, 0.76)
      .to(camera.position, { z: mobileStackExit.camZ, duration: 0.24, ease: 'none' }, 0.76)
      .to(canvas, { opacity: 0, duration: 0.16, ease: 'none' }, 0.84);

    return () => {
      contactHideTrigger?.kill();
      ctaHideTrigger?.kill();
      mobileTimeline.scrollTrigger?.kill();
      mobileTimeline.kill();
    };
  }

  // ─── POSE INICIAL ─────────────────────────────────────────────────────────
  // Katana arranca PARCIALMENTE desenvainada (visualmente más alejada de la vaina).
  const INITIAL_KATANA_X = SHEATHED_S1.pos.x + INITIAL_KATANA_DRAW;
  const FINAL_KATANA_X   = SHEATHED_S1.pos.x + KATANA_DRAW_OFFSET;

  gsap.set(katana.position, { x: INITIAL_KATANA_X, y: SHEATHED_S1.pos.y, z: SHEATHED_S1.pos.z });
  gsap.set(katana.rotation, SHEATHED_S1.rot);
  gsap.set(katana.scale, { x: SHEATHED_S1.scale, y: SHEATHED_S1.scale, z: SHEATHED_S1.scale });

  // VAINA estática: pose única, nunca se anima ni se mueve.
  gsap.set(vaina.position, {
    x: SHEATHED_S1.pos.x,
    y: SHEATHED_S1.pos.y + VAINA_Y_OFFSET,
    z: SHEATHED_S1.pos.z,
  });
  gsap.set(vaina.rotation, SHEATHED_S1.rot);
  gsap.set(vaina.scale, { x: SHEATHED_S1.scale, y: SHEATHED_S1.scale, z: SHEATHED_S1.scale });
  vaina.visible = true;

  gsap.set(camera.position, { x: 0, y: 0, z: KATANA_POSES.S1_HERO.camZ });
  gsap.set(canvas, { filter: 'drop-shadow(0px 30px 25px rgba(0,0,0,0.6))', y: 0 });

  // ─── BOUNDING BOX KATANA: longitud real para calibrar pan vertical S4 ────
  katana.updateMatrixWorld(true);
  const bbox = new Box3().setFromObject(katana);
  const bboxSize = new Vector3();
  bbox.getSize(bboxSize);
  const longestDim = Math.max(bboxSize.x, bboxSize.y, bboxSize.z);
  // Longitud sin escalar
  const naturalLength = longestDim / SHEATHED_S1.scale;
  // Longitud final en S4 (escala S4_CLOSEUP). Se usa para calibrar el paneo
  // vertical de cámara desde mango hasta punta.
  const s4Length = naturalLength * KATANA_POSES.S4_CLOSEUP.scale;

  // ─── FASE INICIAL: SIN PIN ───────────────────────────────────────────────
  // Antes el hero quedaba pinned durante el desenvainado, lo que provocaba
  // parpadeo en desktop al re-engancharse el pin (Framer Motion + position:fixed).
  // Ahora la página scrollea con normalidad: la katana se desenvaina y la vaina
  // se desliza a la derecha durante los primeros UNSHEATH_SCROLL px de scroll.
  // Reducido drásticamente a 100px y GAP aumentado para asegurar separación máxima.
  const UNSHEATH_SCROLL = 100; // px de scroll dedicados al desenvainado

  // ─── CÁLCULO MILIMÉTRICO 1:1 CON EL DOM ──────────────────────────────────
  // NOTA: se calcula DESPUÉS de crear el pin para que el spacer ya esté en el DOM
  const vp = window.innerHeight;
  const halfH = vp / 2;

  const aboutEl    = document.getElementById('about-me-section');
  const servicesEl = document.getElementById('services-section');
  const stackEl    = document.getElementById('stack-section');

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

  // Sin pin: las posiciones DOM son las naturales. El desenvainado ocurre
  // dentro de los primeros UNSHEATH_SCROLL px de scroll del propio hero.
  const aboutTop    = getTop(aboutEl);
  const servicesTop = getTop(servicesEl);
  const stackTop    = getTop(stackEl);

  const aboutH     = aboutEl    ? aboutEl.offsetHeight    : vp;
  const servicesH  = servicesEl ? servicesEl.offsetHeight : vp;
  const stackH     = stackEl    ? stackEl.offsetHeight    : vp * 2;
  const GAP  = 80;

  // Puntos maestros de scroll (en píxeles absolutos desde el inicio del wrapper)
  const t_S1        = 0;                        // inicio (envainado parcial)
  const t_S1_drawn  = UNSHEATH_SCROLL;          // fin del pin = katana totalmente desenvainada
  const raw_S2      = aboutTop    + aboutH    / 2 - halfH;
  const raw_S3      = servicesTop + servicesH / 2 - halfH;
  const raw_S4      = stackTop    - halfH * 1.55;

  const scrollMax   = Math.max(t_S1_drawn + GAP, stackTop + stackH - vp);
  const raw_SpinEnd = scrollMax;

  // Clamp estrictamente creciente. S2 forzado a empezar 500px después del desenvainado
  // para asegurar máxima separación visual.
  const t_S2  = Math.max(t_S1_drawn + 500, raw_S2);
  const t_S3  = Math.max(t_S2       + GAP, raw_S3);
  const t_S4  = Math.max(t_S3       + GAP, raw_S4);
  const t_End = Math.max(t_S4       + GAP, raw_SpinEnd);

  // Duraciones de cada tramo principal
  const dur_Unsheathe   = t_S1_drawn - t_S1;
  const dur_S1drawnToS2 = t_S2  - t_S1_drawn;
  const dur_S2toS3      = t_S3  - t_S2;
  const dur_S3toS4      = t_S4  - t_S3;
  const dur_Spin        = t_End - t_S4;
  const dur_Hold        = Math.max(0, scrollMax - t_End);

  // ─── HELPERS: sub-waypoints ──────────────────────────────────────────────
  function addSegment(
    tl: gsap.core.Timeline,
    target: Group,
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
        .to(target.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z, duration: stepDur, ease: 'none' }, i === 1 ? position : '>')
        .to(target.rotation, { x: p.rot.x, y: p.rot.y, z: p.rot.z, duration: stepDur, ease: 'none' }, '<')
        .to(target.scale,    { x: p.scale,  y: p.scale,  z: p.scale,  duration: stepDur, ease: 'none' }, '<');
      if (to.camZ !== undefined && from.camZ !== undefined) {
        tl.to(camera.position, { z: lerp(from.camZ, to.camZ, t), duration: stepDur, ease: 'none' }, '<');
      }
    }
  }

  function addBezierSegment(
    tl: gsap.core.Timeline,
    target: Group,
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
        .to(target.position, { x: p.pos.x, y: p.pos.y, z: p.pos.z, duration: stepDur, ease: 'none' }, i === 1 ? position : '>')
        .to(target.rotation, { x: p.rot.x, y: p.rot.y, z: p.rot.z, duration: stepDur, ease: 'none' }, '<')
        .to(target.scale,    { x: p.scale,  y: p.scale,  z: p.scale,  duration: stepDur, ease: 'none' }, '<');
      if (to.camZ !== undefined && from.camZ !== undefined) {
        tl.to(camera.position, { z: lerp(from.camZ, to.camZ, t), duration: stepDur, ease: 'none' }, '<');
      }
    }
  }

  // ─── MASTER TIMELINE (UNIFICADO: pinned + post-pin) ──────────────────────
  const masterTL = gsap.timeline({
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => `+=${scrollMax}`,
      scrub: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
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

  // ─── FASE 0: DESENVAINADO (durante el pin) ──────────────────────────────
  // SOLO se mueve katana.position.x. Vaina queda quieta. Sin rotación ni escala.
  masterTL.fromTo(
    katana.position,
    { x: INITIAL_KATANA_X },
    { x: FINAL_KATANA_X, duration: dur_Unsheathe, ease: 'none', immediateRender: false },
    t_S1,
  );
  // (Sombra estática: la animación del filter causaba repintados que parpadeaban
  // al cruzar el borde del pin. Mejor mantener la sombra constante.)

  // VAINA: curva hacia abajo tipo e^-x para que no desaparezca de golpe.
  // Primero se desliza más en X para evitar choque con S2, luego baja en Y negativo
  // con rotación Z sincronizada. Desplazamiento más lento.
  const vainaStartX = SHEATHED_S1.pos.x;
  const vainaStartY = SHEATHED_S1.pos.y + VAINA_Y_OFFSET;
  const vainaMidX = vainaStartX - 3.5;
  const vainaMidY = vainaStartY;
  const vainaEndX = vainaMidX - 1.0;
  const vainaEndY = vainaStartY - 12.0;
  const vainaEndZ = SHEATHED_S1.pos.z;
  const vainaDur = 150;

  // Fase 1: desplazamiento ligero hacia la izquierda
  masterTL.to(vaina.position, {
    x: vainaMidX,
    y: vainaMidY,
    z: vainaEndZ,
    duration: vainaDur * 0.4,
    ease: 'power2.inOut',
    immediateRender: false,
  }, t_S1_drawn + 5);

  // Fase 2: curva suave hacia arriba con rotación Z
  masterTL.to(vaina.position, {
    x: vainaEndX,
    y: vainaEndY,
    z: vainaEndZ,
    duration: vainaDur * 0.6,
    ease: 'power2.inOut',
  }, t_S1_drawn + 5 + vainaDur * 0.4);
  masterTL.to(vaina.rotation, {
    z: Math.PI / 6,
    duration: vainaDur * 0.6,
    ease: 'power2.inOut',
  }, t_S1_drawn + 5 + vainaDur * 0.4);

  // ─── FASE 1: VUELO — katana de S1_DRAWN → S2_ABOUT (rotando suavemente) ──
  addSegment(masterTL, katana, S1_DRAWN, KATANA_POSES.S2_ABOUT, Math.max(1, dur_S1drawnToS2 - 8), t_S1_drawn + 8, 5);

  // ─── FASE 2: About → Services (curva parabólica) ─────────────────────────
  addBezierSegment(masterTL, katana, KATANA_POSES.S2_ABOUT, KATANA_POSES.WP_GAP_1, KATANA_POSES.S3_SERVICES, dur_S2toS3, t_S2, 12);

  // ─── FASE 3: Services → Stack S4 (curva parabólica) ──────────────────────
  addBezierSegment(masterTL, katana, KATANA_POSES.S3_SERVICES, KATANA_POSES.WP_GAP_2, KATANA_POSES.S4_STACK, dur_S3toS4, t_S3, 12);

  // ─── FASE 4: S4 macro scan ───────────────────────────────────────────────
  // Tres fases: aproximación → giro cinematográfico a boca abajo → pan vertical.
  if (dur_Spin > 0) {
    const CU = KATANA_POSES.S4_CLOSEUP;
    const dur_Approach = Math.min(dur_Spin * 0.15, 280);
    const dur_Flip     = Math.min(dur_Spin * 0.45, 700);
    const dur_Pan      = dur_Spin - dur_Approach - dur_Flip;

    const visibleHeight = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * CU.camZ;
    const camY_start_dyn = -s4Length * 0.50 + visibleHeight * 0.34;
    const camY_end_dyn   = +s4Length * 0.50 - visibleHeight * 0.34;

    // Fase A: aproximación a macro (posición, escala, cámara Z).
    masterTL.to(katana.position, {
      x: CU.pos.x, y: CU.pos.y, z: CU.pos.z,
      duration: dur_Approach, ease: 'power2.out',
    }, t_S4);
    masterTL.to(katana.scale, {
      x: CU.scale, y: CU.scale, z: CU.scale,
      duration: dur_Approach, ease: 'power2.out',
    }, t_S4);
    masterTL.to(camera.position, {
      z: CU.camZ,
      y: camY_start_dyn,
      duration: dur_Approach, ease: 'power2.out',
    }, t_S4);

    // Fase B: giro cinematográfico a boca abajo. Giro limpio con easing suave.
    masterTL.to(katana.rotation, {
      x: CU.rot.x, y: CU.rot.y, z: CU.rot.z,
      duration: dur_Flip, ease: 'power3.inOut',
    }, t_S4 + dur_Approach);

    // Fase C: pan vertical. Katana ya está boca abajo, cámara recorre de arriba a abajo.
    masterTL.to(camera.position, {
      y: camY_end_dyn,
      duration: dur_Pan, ease: 'none',
    }, t_S4 + dur_Approach + dur_Flip);
  }

  // ─── FASE 5: Hold ────────────────────────────────────────────────────────
  if (dur_Hold > 0) {
    masterTL.to({}, { duration: dur_Hold }, t_End);
  }

  // ─── VAINA: físicamente fuera de cámara fuera de S1, sin toggles de visible ──

  // ─── CINEMATIC SCROLL REVEAL ─────────────────────────────────────────────
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

      const slideX = fromRight ? 120 : -120;
      const childCount = innerChildren.length;
      const staggerStep = childCount > 1 ? (endScroll - startScroll) / (childCount + 2) : (endScroll - startScroll) * 0.6;

      innerChildren.forEach((child, index) => {
        const childStart = startScroll + index * staggerStep;
        const childEnd = childStart + staggerStep * 1.5;

        gsap.set(child, { opacity: 0, x: slideX, scale: 0.90, y: 20 });

        const tween = gsap.to(child, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: 'power3.inOut',
          paused: true,
        });

        const st = ScrollTrigger.create({
          trigger: wrapper,
          start: childStart,
          end: childEnd,
          scrub: 1,
          onUpdate: (self) => {
            tween.progress(self.progress);
          },
        });

        revealSTs.push(st);
      });
    });
  }

  // Services (S2): reveal cuando la katana está en S2_ABOUT, sincronizado
  revealSection('services-section', t_S2 + dur_S2toS3 * 0.20, t_S2 + dur_S2toS3 * 0.70, true);

  // Stack (S4): no tocar según instrucción del usuario

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
