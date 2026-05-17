'use client';

import type { RefObject } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { projectTransitionLog } from '@/components/projects/projectAnimationConfig';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function useProjectDetailReveal(
  rootRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLDivElement | null>,
  isModal: boolean,
  projectSlug: string,
) {
  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const mm = gsap.matchMedia();
      const scroller = isModal ? root : undefined;

      mm.add('(min-width: 1024px)', () => {
        gsap.set(track, { clearProps: 'transform' });
        gsap.set('[data-project-frame]', { autoAlpha: 1, scale: 1, rotate: 0, filter: 'blur(0px)' });

        gsap.fromTo('[data-detail-intro]', {
          autoAlpha: 0,
          y: 36,
          filter: 'blur(10px)',
        }, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          stagger: 0.08,
        });
      });

      mm.add('(max-width: 1023px)', () => {
        gsap.set(track, { clearProps: 'transform' });
        const frames = gsap.utils.toArray<HTMLElement>('[data-project-frame]');

        gsap.set('[data-detail-intro]', {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          clearProps: 'transform,filter',
        });
        gsap.set(frames, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          clearProps: 'transform,filter',
        });
        ScrollTrigger.refresh();

        projectTransitionLog('project detail mobile reveal disabled', {
          slug: projectSlug,
          frames: frames.length,
          scrollY: window.scrollY,
          rootScrollTop: root.scrollTop,
          viewportHeight: window.innerHeight,
          frameRects: frames.map((frame, index) => ({
            index,
            rect: frame.getBoundingClientRect(),
          })),
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef, dependencies: [isModal, projectSlug] },
  );
}
