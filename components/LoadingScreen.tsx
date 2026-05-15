'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

const MIN_VISIBLE_MS = 1200;
const MAX_WEBGL_WAIT_MS = 7000;

function waitForPageReady() {
  if (typeof window === 'undefined') return Promise.resolve();

  const fontReady = 'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve();
  const windowReady = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        window.addEventListener('load', () => resolve(), { once: true });
      });

  return Promise.all([fontReady, windowReady]);
}

export default function LoadingScreen({ webglReady }: { webglReady: boolean }) {
  const [isVisible, setIsVisible] = useState(true);
  const [fallbackReady, setFallbackReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    window.scrollTo(0, 0);

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '0px';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.body.style.overflow = originalBodyOverflow;
      window.scrollTo(0, 0);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
  }, [isVisible]);

  useLayoutEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    const root = rootRef.current;
    const mark = markRef.current;
    if (!root || !mark) return;

    gsap.set(root, { autoAlpha: 1 });
    gsap.set(mark, {
      autoAlpha: 1,
      y: 0,
      scale: 0.985,
    });

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro
      .fromTo(mark, { y: 14, scale: 0.985 }, { y: 0, scale: 1, duration: 0.72 }, 0);

    return () => {
      intro.kill();
    };
  }, [isVisible]);

  useEffect(() => {
    if (webglReady) return;

    const fallbackTimer = window.setTimeout(() => {
      setFallbackReady(true);
    }, MAX_WEBGL_WAIT_MS);

    return () => window.clearTimeout(fallbackTimer);
  }, [webglReady]);

  useEffect(() => {
    if (!webglReady && !fallbackReady) return;

    let mounted = true;
    let exitTimeline: gsap.core.Timeline | null = null;

    const minVisible = new Promise((resolve) => window.setTimeout(resolve, MIN_VISIBLE_MS));

    Promise.all([waitForPageReady(), minVisible]).then(() => {
      if (!mounted) return;

      const root = rootRef.current;
      const mark = markRef.current;
      if (!root || !mark) {
        setIsVisible(false);
        return;
      }

      exitTimeline = gsap.timeline({
        onComplete: () => {
          if (mounted) setIsVisible(false);
        },
      });

      exitTimeline
        .to(mark, {
          autoAlpha: 0,
          y: -16,
          duration: 0.42,
          ease: 'power3.inOut',
        }, 0)
        .to(root, {
          autoAlpha: 0,
          duration: 0.36,
          ease: 'power2.out',
        }, 0.22);
    });

    return () => {
      mounted = false;
      exitTimeline?.kill();
    };
  }, [webglReady, fallbackReady]);

  if (!isVisible) return null;

  return (
    <div
      ref={rootRef}
      suppressHydrationWarning
      className="premium-loader fixed inset-0 z-[9999] grid place-items-center bg-black text-white"
      role="status"
      aria-live="polite"
      aria-label="Loading site"
    >
      <div ref={markRef} suppressHydrationWarning className="premium-loader__mark" data-label="ML" aria-hidden="true">ML</div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
