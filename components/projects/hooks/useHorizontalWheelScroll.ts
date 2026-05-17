'use client';

import { useEffect, useRef, type RefObject } from 'react';

export function useHorizontalWheelScroll(rootRef: RefObject<HTMLElement | null>) {
  const horizontalScrollTargetRef = useRef(0);
  const horizontalScrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = window.matchMedia('(min-width: 1024px)');
    horizontalScrollTargetRef.current = root.scrollLeft;

    const stopHorizontalScroll = () => {
      if (horizontalScrollRafRef.current !== null) {
        window.cancelAnimationFrame(horizontalScrollRafRef.current);
        horizontalScrollRafRef.current = null;
      }
    };

    const animateHorizontalScroll = () => {
      const current = root.scrollLeft;
      const target = horizontalScrollTargetRef.current;
      const next = current + (target - current) * 0.18;

      if (Math.abs(target - current) < 0.6) {
        root.scrollLeft = target;
        horizontalScrollRafRef.current = null;
        return;
      }

      root.scrollLeft = next;
      horizontalScrollRafRef.current = window.requestAnimationFrame(animateHorizontalScroll);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!media.matches) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      const maxScrollLeft = root.scrollWidth - root.clientWidth;
      horizontalScrollTargetRef.current = Math.max(0, Math.min(maxScrollLeft, horizontalScrollTargetRef.current + event.deltaY));

      if (horizontalScrollRafRef.current === null) {
        horizontalScrollRafRef.current = window.requestAnimationFrame(animateHorizontalScroll);
      }
    };

    root.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      root.removeEventListener('wheel', handleWheel);
      stopHorizontalScroll();
    };
  }, [rootRef]);
}
