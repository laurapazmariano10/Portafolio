'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  PROJECT_CARD_BORDER_RADIUS,
  PROJECT_CARD_IMAGE_SCALE,
  PROJECT_RETURN_SCROLL_GUARD_KEY,
  PROJECT_ROUTE_TRANSITION_EVENT,
  projectTransitionLog,
} from '@/components/projects/projectAnimationConfig';

type ProjectTransitionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type ProjectTransitionContext = {
  slug: string;
  scrollY: number;
  cover: string;
  gradient: string;
  rect?: ProjectTransitionRect;
};

type ProjectTransitionDetail = {
  type: 'enter' | 'return';
  href: string;
  context: ProjectTransitionContext;
  onNavigate?: () => void;
  isModalReturn?: boolean;
};

type PendingTransition = ProjectTransitionDetail;

const RETURN_LAYOUT_MAX_FRAMES = 45;
const RETURN_LAYOUT_STABLE_FRAMES = 3;
const RECT_STABLE_EPSILON = 0.75;
const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']);

function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function setScrollPosition(y: number) {
  window.scrollTo(0, y);
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
}

function toTransitionRect(rect: DOMRect): ProjectTransitionRect {
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function rectsAreStable(a: ProjectTransitionRect | null, b: ProjectTransitionRect) {
  if (!a) return false;
  return (
    Math.abs(a.left - b.left) <= RECT_STABLE_EPSILON &&
    Math.abs(a.top - b.top) <= RECT_STABLE_EPSILON &&
    Math.abs(a.width - b.width) <= RECT_STABLE_EPSILON &&
    Math.abs(a.height - b.height) <= RECT_STABLE_EPSILON
  );
}

function getStoredContext(fallback: ProjectTransitionContext): ProjectTransitionContext {
  try {
    const raw = window.sessionStorage.getItem('project-transition-context');
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function ProjectRouteTransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageLayerRef = useRef<HTMLDivElement>(null);
  const colorOverlayRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<PendingTransition | null>(null);
  const isAnimatingRef = useRef(false);
  const isScrollLockedRef = useRef(false);
  const previousHtmlOverflowRef = useRef('');
  const previousBodyOverflowRef = useRef('');
  const previousHtmlOverscrollRef = useRef('');
  const previousBodyOverscrollRef = useRef('');
  const previousBodyTouchActionRef = useRef('');

  const preventScrollEvent = useCallback((event: Event) => {
    if (!isScrollLockedRef.current) return;
    event.preventDefault();
  }, []);

  const preventScrollKey = useCallback((event: KeyboardEvent) => {
    if (!isScrollLockedRef.current || !SCROLL_KEYS.has(event.key)) return;
    event.preventDefault();
  }, []);

  const lockScroll = useCallback(() => {
    if (isScrollLockedRef.current) return;
    isScrollLockedRef.current = true;
    previousHtmlOverflowRef.current = document.documentElement.style.overflow;
    previousBodyOverflowRef.current = document.body.style.overflow;
    previousHtmlOverscrollRef.current = document.documentElement.style.overscrollBehavior;
    previousBodyOverscrollRef.current = document.body.style.overscrollBehavior;
    previousBodyTouchActionRef.current = document.body.style.touchAction;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.touchAction = 'none';
    window.addEventListener('wheel', preventScrollEvent, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScrollEvent, { passive: false, capture: true });
    window.addEventListener('keydown', preventScrollKey, { capture: true });
  }, [preventScrollEvent, preventScrollKey]);

  const unlockScroll = useCallback(() => {
    if (!isScrollLockedRef.current) return;
    isScrollLockedRef.current = false;
    document.documentElement.style.overflow = previousHtmlOverflowRef.current;
    document.body.style.overflow = previousBodyOverflowRef.current;
    document.documentElement.style.overscrollBehavior = previousHtmlOverscrollRef.current;
    document.body.style.overscrollBehavior = previousBodyOverscrollRef.current;
    document.body.style.touchAction = previousBodyTouchActionRef.current;
    window.removeEventListener('wheel', preventScrollEvent, { capture: true });
    window.removeEventListener('touchmove', preventScrollEvent, { capture: true });
    window.removeEventListener('keydown', preventScrollKey, { capture: true });
  }, [preventScrollEvent, preventScrollKey]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => unlockScroll();
  }, [unlockScroll]);

  useEffect(() => {
    const handleTransition = (event: Event) => {
      const detail = (event as CustomEvent<ProjectTransitionDetail>).detail;
      const overlay = overlayRef.current;
      const imageLayer = imageLayerRef.current;
      const colorOverlay = colorOverlayRef.current;
      if (!detail || !overlay || !imageLayer || !colorOverlay || isAnimatingRef.current) return;

      const context = detail.type === 'return' ? getStoredContext(detail.context) : detail.context;
      pendingRef.current = { ...detail, context };
      isAnimatingRef.current = true;
      lockScroll();
      projectTransitionLog('overlay event received', {
        type: detail.type,
        href: detail.href,
        context,
        pathname: window.location.pathname,
        scrollY: window.scrollY,
        isModalReturn: detail.isModalReturn,
      });

      const navigate = () => {
        projectTransitionLog('overlay navigate', {
          href: detail.href,
          type: detail.type,
          beforePathname: window.location.pathname,
          beforeScrollY: window.scrollY,
        });
        if (detail.onNavigate) {
          detail.onNavigate();
          return;
        }

        router.push(detail.href, { scroll: false });
      };

      if (detail.type === 'enter') {
        const rect = context.rect;
        if (!rect) {
          pendingRef.current = null;
          isAnimatingRef.current = false;
          unlockScroll();
          navigate();
          return;
        }

        window.sessionStorage.setItem('project-transition-context', JSON.stringify(context));
        gsap.killTweensOf([overlay, imageLayer, colorOverlay]);
        gsap.set(overlay, {
          autoAlpha: 1,
          pointerEvents: 'auto',
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          borderRadius: PROJECT_CARD_BORDER_RADIUS,
          scaleX: 1,
          scaleY: 1,
          force3D: true,
          willChange: 'transform, width, height, opacity, border-radius',
          backfaceVisibility: 'hidden',
          contain: 'layout paint style',
        });
        gsap.set(imageLayer, {
          backgroundImage: `url(${context.cover})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          scale: PROJECT_CARD_IMAGE_SCALE,
          force3D: true,
          willChange: 'transform',
        });
        gsap.set(colorOverlay, {
          autoAlpha: 0,
          background: context.gradient,
        });

        const timeline = gsap.timeline();

        timeline
          .to(overlay, {
            x: 0,
            y: 0,
            width: document.documentElement.clientWidth,
            height: window.innerHeight,
            borderRadius: 0,
            duration: 1,
            ease: 'power4.inOut',
          }, 0)
          .to(colorOverlay, {
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.inOut',
            onStart: navigate,
          }, '-=0.35');

        return;
      }

      window.sessionStorage.setItem('project-return-transition', JSON.stringify(context));
      gsap.killTweensOf([overlay, imageLayer, colorOverlay]);
      const liveTargetCard = detail.isModalReturn
        ? document.querySelector(`[data-project-slug="${context.slug}"] [data-project-card-frame]`) as HTMLElement | null
        : null;
      const liveTargetRect = liveTargetCard?.getBoundingClientRect();
      projectTransitionLog('overlay return start', {
        slug: context.slug,
        storedScrollY: context.scrollY,
        currentScrollY: window.scrollY,
        hasLiveTargetCard: Boolean(liveTargetCard),
        liveTargetRect: liveTargetRect ? toTransitionRect(liveTargetRect) : null,
        isModalReturn: detail.isModalReturn,
      });
      gsap.set(overlay, {
        autoAlpha: 0,
        pointerEvents: 'auto',
        x: 0,
        y: 0,
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
        borderRadius: 0,
        scaleX: 1,
        scaleY: 1,
        force3D: true,
        willChange: 'transform, width, height, opacity, border-radius',
        backfaceVisibility: 'hidden',
        contain: 'layout paint style',
      });
      gsap.set(imageLayer, {
        backgroundImage: `url(${context.cover})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        scale: PROJECT_CARD_IMAGE_SCALE,
        force3D: true,
        willChange: 'transform',
      });
      gsap.set(colorOverlay, {
        autoAlpha: 1,
        background: context.gradient,
      });

      if (detail.isModalReturn && liveTargetRect && liveTargetRect.width > 10 && liveTargetRect.height > 10) {
        gsap.timeline({
          defaults: { ease: 'power3.inOut' },
          onComplete: () => {
            navigate();
            setScrollPosition(context.scrollY);
            gsap.set([overlay, imageLayer, colorOverlay], { clearProps: 'all' });
            pendingRef.current = null;
            isAnimatingRef.current = false;
            unlockScroll();
          },
        })
          .to('[data-detail-intro], [data-project-frame]', {
            autoAlpha: 0,
            y: -22,
            filter: 'blur(10px)',
            duration: 0.38,
            stagger: { amount: 0.1, from: 'end' },
          })
          .to(overlay, { autoAlpha: 1, duration: 0.18, ease: 'power2.out' }, '-=0.05')
          .to('[data-project-detail-root]', { autoAlpha: 0, duration: 0.24, ease: 'power2.inOut' }, '-=0.05')
          .to(colorOverlay, { autoAlpha: 0, duration: 0.28, ease: 'power2.inOut' }, '<')
          .to(overlay, {
            x: liveTargetRect.left,
            y: liveTargetRect.top,
            width: liveTargetRect.width,
            height: liveTargetRect.height,
            borderRadius: PROJECT_CARD_BORDER_RADIUS,
            duration: 1.05,
            ease: 'power4.inOut',
          })
          .to(overlay, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' }, '-=0.02');

        return;
      }

      gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: navigate,
      })
        .to('[data-detail-intro], [data-project-frame]', {
          autoAlpha: 0,
          y: -22,
          filter: 'blur(10px)',
          duration: 0.42,
          stagger: { amount: 0.12, from: 'end' },
        })
        .to(overlay, { autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, '-=0.06')
        .to(colorOverlay, { autoAlpha: 0, duration: 0.32, ease: 'power2.inOut' }, '-=0.02');
    };

    window.addEventListener(PROJECT_ROUTE_TRANSITION_EVENT, handleTransition);
    return () => window.removeEventListener(PROJECT_ROUTE_TRANSITION_EVENT, handleTransition);
  }, [lockScroll, router, unlockScroll]);

  useEffect(() => {
    const pending = pendingRef.current;
    const overlay = overlayRef.current;
    const imageLayer = imageLayerRef.current;
    const colorOverlay = colorOverlayRef.current;
    if (!pending || !overlay || !imageLayer || !colorOverlay) return;
    if (normalizePath(pathname) !== normalizePath(pending.href)) return;
    projectTransitionLog('overlay pathname matched pending', {
      pathname,
      pendingHref: pending.href,
      type: pending.type,
      currentScrollY: window.scrollY,
    });

    if (pending.type === 'enter') {
      window.requestAnimationFrame(() => {
        gsap.to(overlay, {
          autoAlpha: 0,
          duration: 0.28,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set([overlay, imageLayer, colorOverlay], { clearProps: 'all' });
            pendingRef.current = null;
            isAnimatingRef.current = false;
            unlockScroll();
          },
        });
      });
      return;
    }

    const context = pending.context;
    const targetRect = context.rect;

    const finishWithoutTarget = () => {
      setScrollPosition(context.scrollY);
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set([overlay, imageLayer, colorOverlay], { clearProps: 'all' });
          pendingRef.current = null;
          isAnimatingRef.current = false;
          unlockScroll();
        },
      });
    };

    if (!targetRect) {
      finishWithoutTarget();
      return;
    }

    setScrollPosition(context.scrollY);
    projectTransitionLog('overlay return pre-layout scroll set', {
      targetScrollY: context.scrollY,
      afterScrollY: window.scrollY,
      documentTop: document.documentElement.scrollTop,
      bodyTop: document.body.scrollTop,
    });

    let frame = 0;
    let stableFrames = 0;
    let previousRect: ProjectTransitionRect | null = null;

    const waitForProjectsLayout = () => {
      setScrollPosition(context.scrollY);
      frame += 1;

      const scrollSettled = Math.abs(window.scrollY - context.scrollY) < 2;

      const targetCard = document.querySelector(`[data-project-slug="${context.slug}"] [data-project-card-frame]`) as HTMLElement | null;
      const rect = targetCard?.getBoundingClientRect();
      const candidateRect = rect && rect.width > 10 && rect.height > 10 ? toTransitionRect(rect) : null;

      if (candidateRect) {
        stableFrames = rectsAreStable(previousRect, candidateRect) ? stableFrames + 1 : 1;
        previousRect = candidateRect;
      } else {
        stableFrames = 0;
        previousRect = null;
      }

      const ready = Boolean(candidateRect && scrollSettled && stableFrames >= RETURN_LAYOUT_STABLE_FRAMES);
      if (frame <= 5 || ready || frame === RETURN_LAYOUT_MAX_FRAMES) {
        projectTransitionLog('overlay return layout frame', {
          frame,
          scrollY: window.scrollY,
          targetScrollY: context.scrollY,
          scrollSettled,
          stableFrames,
          ready,
          hasTargetCard: Boolean(targetCard),
          candidateRect,
        });
      }

      if (!ready && frame < RETURN_LAYOUT_MAX_FRAMES) {
        window.requestAnimationFrame(waitForProjectsLayout);
        return;
      }

      setScrollPosition(context.scrollY);
      gsap.killTweensOf([overlay, imageLayer, colorOverlay]);
      gsap.set(overlay, {
        autoAlpha: 1,
        pointerEvents: 'auto',
        x: 0,
        y: 0,
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
        borderRadius: 0,
        scaleX: 1,
        scaleY: 1,
        force3D: true,
        willChange: 'transform, width, height, opacity, border-radius',
        backfaceVisibility: 'hidden',
        contain: 'layout paint style',
      });
      gsap.set(imageLayer, {
        backgroundImage: `url(${context.cover})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        scale: PROJECT_CARD_IMAGE_SCALE,
        force3D: true,
        willChange: 'transform',
      });
      gsap.set(colorOverlay, { autoAlpha: 0 });

      const finalRect = candidateRect ?? targetRect;
      projectTransitionLog('overlay return animate to rect', {
        finalRect,
        usedFallbackRect: !candidateRect,
        scrollY: window.scrollY,
        targetScrollY: context.scrollY,
      });

      gsap.timeline({
        onComplete: () => {
          setScrollPosition(context.scrollY);
          projectTransitionLog('overlay return complete', {
            finalScrollY: window.scrollY,
            targetScrollY: context.scrollY,
          });
          window.sessionStorage.removeItem(PROJECT_RETURN_SCROLL_GUARD_KEY);
          gsap.set([overlay, imageLayer, colorOverlay], { clearProps: 'all' });
          pendingRef.current = null;
          isAnimatingRef.current = false;
          unlockScroll();
        },
      })
        .to(overlay, {
          x: finalRect.left,
          y: finalRect.top,
          width: finalRect.width,
          height: finalRect.height,
          borderRadius: PROJECT_CARD_BORDER_RADIUS,
          duration: 1.05,
          ease: 'power4.inOut',
        })
        .to(overlay, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' }, '-=0.02');
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(waitForProjectsLayout);
    });
  }, [pathname, unlockScroll]);

  return (
    <div ref={overlayRef} className="pointer-events-none fixed left-0 top-0 z-[999] overflow-hidden opacity-0 will-change-transform">
      <div ref={imageLayerRef} className="absolute inset-0 z-0" />
      <div ref={colorOverlayRef} className="absolute inset-0 z-10 opacity-0" />
    </div>
  );
}
