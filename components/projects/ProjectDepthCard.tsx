'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type ProjectDepthCardProps = {
  cover: string;
  depthMap: string;
  title: string;
  className?: string;
};

export default function ProjectDepthCard({ cover, depthMap, title, className }: ProjectDepthCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ tx: 0, ty: 0, x: 0, y: 0, active: false });
  const depthSampleRef = useRef<{ data: Uint8ClampedArray | null; w: number; h: number }>({ data: null, w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Sample depth map once.
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = depthMap;
    img.onload = () => {
      if (cancelled) return;
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 48;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      try {
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        depthSampleRef.current = { data: id.data, w: c.width, h: c.height };
      } catch {
        depthSampleRef.current = { data: null, w: 0, h: 0 };
      }
    };
    return () => {
      cancelled = true;
    };
  }, [depthMap]);

  // RAF parallax loop.
  useEffect(() => {
    const loop = () => {
      const wrap = wrapRef.current;
      const coverEl = coverRef.current;
      const highlight = highlightRef.current;
      if (!wrap || !coverEl) {
        rafRef.current = window.requestAnimationFrame(loop);
        return;
      }

      const p = pointerRef.current;
      p.x += (p.tx - p.x) * 0.12;
      p.y += (p.ty - p.y) * 0.12;

      // Sample average depth around cursor (0..1, 0.5 = neutral).
      const sample = depthSampleRef.current;
      let depth = 0.5;
      if (sample.data && p.active) {
        const u = (p.x + 1) * 0.5;
        const v = (p.y + 1) * 0.5;
        const sx = Math.max(0, Math.min(sample.w - 1, Math.floor(u * sample.w)));
        const sy = Math.max(0, Math.min(sample.h - 1, Math.floor(v * sample.h)));
        depth = sample.data[(sy * sample.w + sx) * 4] / 255;
      }
      const strength = (depth - 0.5) * 2; // -1..1, mapping near/far.

      const maxShift = p.active ? 34 : 0;
      // Depth follows the cursor: far pixels shift more, near pixels less.
      const depthMag = 0.55 + Math.abs(strength) * 0.9;
      const tx = p.x * maxShift * depthMag;
      const ty = p.y * maxShift * 0.62 * depthMag;
      const scale = p.active ? 1.055 : 1.0;

      coverEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${scale})`;

      if (highlight) {
        if (p.active) {
          const gx = (p.x + 1) * 50;
          const gy = (p.y + 1) * 50;
          highlight.style.opacity = '1';
          highlight.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18), rgba(255,255,255,0) 55%)`;
        } else {
          highlight.style.opacity = '0';
        }
      }

      rafRef.current = window.requestAnimationFrame(loop);
    };

    rafRef.current = window.requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointerRef.current.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  const handlePointerEnter = () => {
    pointerRef.current.active = true;
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 460);
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.tx = 0;
    pointerRef.current.ty = 0;
  };

  return (
    <div
      ref={wrapRef}
      className={`project-depth-card relative aspect-[1120/746] overflow-hidden rounded-[28px] bg-[#f1f1f1] ${isShaking ? 'project-depth-card--shake' : ''} ${className ?? ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div ref={coverRef} className="absolute inset-0 will-change-transform" style={{ transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)' }}>
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 88vw, 1120px"
          className="select-none object-cover"
          draggable={false}
          priority={false}
        />
      </div>
      <div ref={highlightRef} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-screen" />
    </div>
  );
}
