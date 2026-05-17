'use client';

import { useLayoutEffect, type RefObject } from 'react';

const DETAIL_SCROLL_RESET_DELAYS = [0, 80, 240, 520];

export function useProjectDetailScrollReset(
  rootRef: RefObject<HTMLElement | null>,
  projectSlug: string,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const isMobileOrTablet = window.matchMedia('(max-width: 1023px)').matches;

    if (!isMobileOrTablet) {
      if (root) root.scrollLeft = 0;
      return;
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (root) {
        root.scrollTop = 0;
        root.scrollLeft = 0;
      }
    };

    resetScroll();
    const resetIds = DETAIL_SCROLL_RESET_DELAYS.map((delay) => window.setTimeout(resetScroll, delay));
    return () => resetIds.forEach((id) => window.clearTimeout(id));
  }, [projectSlug, rootRef]);
}
