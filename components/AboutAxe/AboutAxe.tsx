'use client';

import { useEffect, useRef } from 'react';
import { createScene, handleResize } from './scene';
import { setupLights } from './lights';
import { loadKatanaModel } from './loaders';
import { setupScrollAnimation } from './scrollAnimation';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Fixed, full-viewport, transparent Three.js canvas that renders
 * the Leviathan axe and animates it with scroll through the About page.
 *
 * Usage:
 *   <div ref={wrapperRef} id="about-wrapper"> … HTML sections … </div>
 *   <AboutAxe wrapperRef={wrapperRef} />
 */
export default function AboutAxe({
  wrapperRef,
}: {
  wrapperRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    let disposed = false;
    let cleanupResize: (() => void) | undefined;
    let cleanupLights: (() => void) | undefined;
    let cleanupScroll: (() => void) | undefined;
    let visibilityST: ScrollTrigger | undefined;

    const init = async () => {
      // ── Scene ──
      const { scene, camera, renderer } = createScene(canvas);
      cleanupResize = handleResize(camera, renderer);

      // ── Lights + HDRI ──
      try {
        cleanupLights = await setupLights(scene);
      } catch (e) {
        console.warn('[AboutAxe] HDRI load failed, continuing without env map', e);
      }

      if (disposed) return;

      // ── Model ──
      let katana, vaina;
      try {
        ({ katana, vaina } = await loadKatanaModel());
      } catch (e) {
        console.error('[AboutAxe] Model load failed', e);
        return;
      }

      if (disposed) return;

      scene.add(katana);
      scene.add(vaina);

      // ── Scroll animation ──
      cleanupScroll = setupScrollAnimation(katana, vaina, camera, wrapper, canvas);

      // ── Show/hide canvas based on wrapper visibility ──
      visibilityST = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => { canvas.style.opacity = '1'; },
        onLeave: () => { canvas.style.opacity = '0'; },
        onEnterBack: () => { canvas.style.opacity = '1'; },
        onLeaveBack: () => { canvas.style.opacity = '0'; },
      });

      // ── Render loop (driven by gsap ticker for sync) ──
      const tick = () => {
        if (!disposed) {
          renderer.render(scene, camera);
        }
      };
      gsap.ticker.add(tick);

      // Store for cleanup
      const cleanup = () => {
        gsap.ticker.remove(tick);
        visibilityST?.kill();
        cleanupScroll?.();
        cleanupLights?.();
        cleanupResize?.();

        // Dispose model geometries/materials
        scene.traverse((obj) => {
          if ('geometry' in obj && obj.geometry) {
            (obj.geometry as { dispose: () => void }).dispose();
          }
          if ('material' in obj && obj.material) {
            const mat = obj.material;
            if (Array.isArray(mat)) {
              mat.forEach((m: { dispose: () => void }) => m.dispose());
            } else if (typeof (mat as { dispose: () => void }).dispose === 'function') {
              (mat as { dispose: () => void }).dispose();
            }
          }
        });

        renderer.dispose();
      };

      (canvas as HTMLCanvasElement & { __aboutAxeCleanup?: () => void }).__aboutAxeCleanup = cleanup;
    };

    init();

    return () => {
      disposed = true;
      const cleanup = (canvas as HTMLCanvasElement & { __aboutAxeCleanup?: () => void }).__aboutAxeCleanup;
      cleanup?.();
    };
  }, [wrapperRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 30,
        pointerEvents: 'none',
        transition: 'opacity 0.4s ease',
        filter: 'drop-shadow(0px 25px 25px rgba(0,0,0,0.4))',
      }}
    />
  );
}
