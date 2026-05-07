'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

const MIN_VISIBLE_MS = 1200;

const TILE_WORD = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  N: ['10001', '11001', '10101', '10101', '10011', '10001', '10001'],
  G: ['01111', '10000', '10000', '10011', '10001', '10001', '01110'],
} as const;

const LOADING_LETTERS = ['L', 'O', 'A', 'D', 'I', 'N', 'G'] as const;

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
  const rootRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!webglReady) return;

    let mounted = true;
    let exitTimeline: gsap.core.Timeline | null = null;

    const minVisible = new Promise((resolve) => window.setTimeout(resolve, MIN_VISIBLE_MS));

    Promise.all([waitForPageReady(), minVisible]).then(() => {
      if (!mounted) return;

      const root = rootRef.current;
      const word = wordRef.current;
      if (!root || !word) {
        setIsVisible(false);
        return;
      }
      const activeTiles = root.querySelectorAll('.loading-tile.is-on');

      exitTimeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          if (mounted) setIsVisible(false);
        },
      });

      exitTimeline
        .set(activeTiles, { animation: 'none', opacity: 1, x: 0, y: 0 })
        .set(word, { x: 0, y: 0, rotation: 0 })
        .to(activeTiles, {
          autoAlpha: 0,
          scale: 0,
          y: () => gsap.utils.random(-8, 8),
          x: () => gsap.utils.random(-8, 8),
          duration: 0.34,
          ease: 'power3.inOut',
          stagger: {
            each: 0.008,
            from: 'random',
          },
        }, 0)
        .to(word, {
          autoAlpha: 0,
          duration: 0.18,
          ease: 'power2.out',
        }, 0.42)
        .to(root, {
          autoAlpha: 0,
          duration: 0.55,
          ease: 'power3.inOut',
        }, 0.5);
    });

    return () => {
      mounted = false;
      exitTimeline?.kill();
    };
  }, [webglReady]);

  if (!isVisible) return null;

  return (
    <div
      ref={rootRef}
      suppressHydrationWarning
      className="fixed inset-0 z-[9999] grid place-items-center bg-black text-white"
      role="status"
      aria-live="polite"
      aria-label="Loading site"
    >
      <div
        ref={wordRef}
        className="loading-tile-word relative z-10 select-none"
      >
        {LOADING_LETTERS.map((letter, letterIndex) => (
          <span
            key={`${letter}-${letterIndex}`}
            className="loading-tile-letter"
            aria-hidden="true"
          >
            {TILE_WORD[letter].map((row, rowIndex) => (
              <span key={`${letter}-${rowIndex}`} className="loading-tile-row">
                {row.split('').map((cell, columnIndex) => (
                  <span
                    key={`${letter}-${rowIndex}-${columnIndex}`}
                    className={cell === '1' ? 'loading-tile is-on' : 'loading-tile'}
                    style={{ animationDelay: `${(letterIndex * 5 + rowIndex + columnIndex) * 42}ms` }}
                  />
                ))}
              </span>
            ))}
          </span>
        ))}
        <span className="sr-only">LOADING</span>
      </div>
    </div>
  );
}
