'use client';

import type { RefObject } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { projectTransitionLog } from '@/components/projects/projectAnimationConfig';

type ProjectReturnTransition = {
  slug: string;
  scrollY: number;
  cover: string;
  gradient: string;
};

function readReturnTransition(): ProjectReturnTransition | null {
  try {
    const raw = window.sessionStorage.getItem('project-return-transition');
    const transition = raw ? JSON.parse(raw) as ProjectReturnTransition : null;
    projectTransitionLog('projects reveal read return transition', {
      hasRaw: Boolean(raw),
      transition,
      currentScrollY: window.scrollY,
    });
    if (raw) window.sessionStorage.removeItem('project-return-transition');
    return transition;
  } catch {
    projectTransitionLog('projects reveal failed parsing return transition');
    return null;
  }
}

export function useProjectsListReveal(
  rootRef: RefObject<HTMLElement | null>,
  cardRefs: RefObject<Array<HTMLElement | null>>,
) {
  useGSAP(
    () => {
      const cards = cardRefs.current.filter((node): node is HTMLElement => node !== null);
      const title = rootRef.current?.querySelector('[data-projects-title]');
      const intro = rootRef.current?.querySelector('[data-projects-intro]');
      const returnTransition = readReturnTransition();

      if (returnTransition) {
        projectTransitionLog('projects reveal applying return state', {
          slug: returnTransition.slug,
          targetScrollY: returnTransition.scrollY,
          beforeScrollY: window.scrollY,
          cards: cards.length,
        });
        window.scrollTo(0, returnTransition.scrollY);
        projectTransitionLog('projects reveal applied scroll', {
          afterScrollY: window.scrollY,
        });
        gsap.set([title, intro, ...cards].filter(Boolean), {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: 'blur(0px)',
        });
      } else if (title) {
        gsap.fromTo(title, { y: 80, autoAlpha: 0, letterSpacing: '-0.09em' }, {
          y: 0,
          autoAlpha: 1,
          letterSpacing: '-0.055em',
          duration: 1.05,
          ease: 'power4.out',
        });
      }

      if (!returnTransition && intro) {
        gsap.fromTo(intro, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.18, ease: 'power3.out' });
      }

      if (!returnTransition) {
        gsap.set(cards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          filter: 'blur(0px)',
        });

        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const isNearInitialViewport = rect.top < window.innerHeight * 1.35;
          if (!isNearInitialViewport) return;

          gsap.fromTo(
            card,
            {
              autoAlpha: 0,
              y: index === 0 ? 44 : 64,
              scale: 0.992,
              rotate: 0,
              transformOrigin: '50% 55%',
              filter: 'blur(6px)',
            },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotate: 0,
              filter: 'blur(0px)',
              duration: 0.72,
              delay: 0.12 + index * 0.08,
              ease: 'power3.out',
              clearProps: 'transform,filter,opacity,visibility',
            },
          );
        });
      }

      return () => {
        gsap.killTweensOf([title, intro, ...cards].filter(Boolean));
      };
    },
    { scope: rootRef },
  );
}
