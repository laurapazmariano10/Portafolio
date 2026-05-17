'use client';

import { useLayoutEffect } from 'react';
import {
  PROJECT_RETURN_SCROLL_GUARD_KEY,
  projectTransitionLog,
} from '@/components/projects/projectAnimationConfig';

const SCROLL_RESET_DELAYS = [0, 80, 240, 520];
const RETURN_SCROLL_GUARD_TTL = 2500;

type ReturnScrollGuard = {
  scrollY: number;
  createdAt: number;
};

function setWindowScrollTop(y: number) {
  window.scrollTo({ top: y, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
}

export function useProjectsInitialScroll() {
  useLayoutEffect(() => {
    const rawReturnTransition = window.sessionStorage.getItem('project-return-transition');
    projectTransitionLog('projects initial scroll layout effect', {
      hasReturnTransition: Boolean(rawReturnTransition),
      currentScrollY: window.scrollY,
      pathname: window.location.pathname,
    });

    if (rawReturnTransition) {
      try {
        const returnTransition = JSON.parse(rawReturnTransition) as { scrollY?: number };
        if (typeof returnTransition.scrollY === 'number') {
          window.sessionStorage.setItem(
            PROJECT_RETURN_SCROLL_GUARD_KEY,
            JSON.stringify({
              scrollY: returnTransition.scrollY,
              createdAt: performance.now(),
            } satisfies ReturnScrollGuard),
          );

          projectTransitionLog('projects initial scroll applying return scrollY', {
            targetScrollY: returnTransition.scrollY,
            beforeScrollY: window.scrollY,
          });
          setWindowScrollTop(returnTransition.scrollY);
          projectTransitionLog('projects initial scroll applied', {
            afterScrollY: window.scrollY,
            documentTop: document.documentElement.scrollTop,
            bodyTop: document.body.scrollTop,
          });
        }
      } catch {
        projectTransitionLog('projects initial scroll malformed return context');
        // The reveal hook will ignore malformed transition context as well.
      }

      return;
    }

    const rawReturnScrollGuard = window.sessionStorage.getItem(PROJECT_RETURN_SCROLL_GUARD_KEY);
    if (rawReturnScrollGuard) {
      try {
        const guard = JSON.parse(rawReturnScrollGuard) as ReturnScrollGuard;
        const isFresh = performance.now() - guard.createdAt < RETURN_SCROLL_GUARD_TTL;

        projectTransitionLog('projects initial scroll guard check', {
          isFresh,
          guardScrollY: guard.scrollY,
          currentScrollY: window.scrollY,
        });

        if (isFresh && typeof guard.scrollY === 'number') {
          setWindowScrollTop(guard.scrollY);
          return;
        }
      } catch {
        projectTransitionLog('projects initial scroll malformed guard');
      }

      window.sessionStorage.removeItem(PROJECT_RETURN_SCROLL_GUARD_KEY);
    }

    const resetScroll = () => setWindowScrollTop(0);
    projectTransitionLog('projects initial scroll reset to top');
    resetScroll();

    const resetIds = SCROLL_RESET_DELAYS.map((delay) => window.setTimeout(resetScroll, delay));
    return () => resetIds.forEach((id) => window.clearTimeout(id));
  }, []);
}
