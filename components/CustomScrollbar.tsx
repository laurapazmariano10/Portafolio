'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomScrollbar() {
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const setVisibleState = (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) return;
      visibleRef.current = nextVisible;
      setIsVisible(nextVisible);
    };

    const clearHideTimer = () => {
      if (hideTimerRef.current === null) return;
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    };

    const scheduleHide = () => {
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(() => {
        setVisibleState(false);
      }, 1500);
    };

    const updateProgress = (reveal: boolean) => {
      const maxScroll = Math.max(root.scrollHeight - root.clientHeight, 0);
      const scrollTop = Math.max(window.scrollY || root.scrollTop || 0, 0);
      const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;

      if (thumbRef.current) {
        thumbRef.current.style.transform = `scaleY(${progress})`;
      }

      if (reveal && maxScroll > 0) {
        setVisibleState(true);
        scheduleHide();
      }
    };

    const handleScroll = () => updateProgress(true);
    const handleResize = () => updateProgress(false);

    updateProgress(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      clearHideTimer();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed right-3 top-4 z-[2147483647] h-[calc(100dvh-2rem)] w-[3px] overflow-hidden rounded-full bg-transparent transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        ref={thumbRef}
        className="h-full w-full origin-top rounded-full bg-[#6872F2] shadow-[0_0_18px_rgba(104,114,242,0.28)]"
        style={{ transform: 'scaleY(0)' }}
      />
    </div>
  );
}
