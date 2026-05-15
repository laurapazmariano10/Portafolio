'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

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

const EVENT_NAME = 'project-route-transition';
const CARD_IMAGE_SCALE = 1 / 0.92;

function setScrollPosition(y: number) {
  window.scrollTo(0, y);
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
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
  const previousHtmlOverflowRef = useRef('');
  const previousBodyOverflowRef = useRef('');

  const lockScroll = () => {
    previousHtmlOverflowRef.current = document.documentElement.style.overflow;
    previousBodyOverflowRef.current = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = previousHtmlOverflowRef.current;
    document.body.style.overflow = previousBodyOverflowRef.current;
  };

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

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
      const navigate = () => {
        if (detail.onNavigate) {
          detail.onNavigate();
          return;
        }

        router.push(detail.href, { scroll: false });
      };

      if (detail.type === 'enter') {
        const rect = context.rect;
        if (!rect) {
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
          borderRadius: 28,
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
          scale: CARD_IMAGE_SCALE,
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
        scale: CARD_IMAGE_SCALE,
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
            borderRadius: 28,
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

    window.addEventListener(EVENT_NAME, handleTransition);
    return () => window.removeEventListener(EVENT_NAME, handleTransition);
  }, [router]);

  useEffect(() => {
    const pending = pendingRef.current;
    const overlay = overlayRef.current;
    const imageLayer = imageLayerRef.current;
    const colorOverlay = colorOverlayRef.current;
    if (!pending || !overlay || !imageLayer || !colorOverlay) return;
    if (pathname !== pending.href) return;

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

    let frame = 0;
    const waitForProjectsLayout = () => {
      setScrollPosition(context.scrollY);
      frame += 1;

      const targetCard = document.querySelector(`[data-project-slug="${context.slug}"] [data-project-card-frame]`) as HTMLElement | null;
      const rect = targetCard?.getBoundingClientRect();
      const ready = rect && rect.width > 10 && rect.height > 10;

      if (!ready && frame < 12) {
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
        scale: CARD_IMAGE_SCALE,
        force3D: true,
        willChange: 'transform',
      });
      gsap.set(colorOverlay, { autoAlpha: 0 });

      const finalRect = rect ?? targetRect;

      gsap.timeline({
        onComplete: () => {
          setScrollPosition(context.scrollY);
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
          borderRadius: 28,
          duration: 1.05,
          ease: 'power4.inOut',
        })
        .to(overlay, { autoAlpha: 0, duration: 0.18, ease: 'power2.out' }, '-=0.02');
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(waitForProjectsLayout);
    });
  }, [pathname]);

  return (
    <div ref={overlayRef} className="pointer-events-none fixed left-0 top-0 z-[999] overflow-hidden opacity-0 will-change-transform">
      <div ref={imageLayerRef} className="absolute inset-0 z-0" />
      <div ref={colorOverlayRef} className="absolute inset-0 z-10 opacity-0" />
    </div>
  );
}
