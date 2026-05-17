'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  PAGE_TRANSITION_NAVIGATION_EVENT,
  type PageTransitionNavigationDetail,
} from '@/components/navigation/pageTransitionEvents';
import { PROJECT_ROUTE_TRANSITION_EVENT, projectTransitionLog } from '@/components/projects/projectAnimationConfig';

const COVER_DURATION = 0.46;
const REVEAL_DURATION = 0.62;
const MIN_VISIBLE_MS = 820;
const ROUTE_SETTLE_MS = 420;
const MAX_WAIT_MS = 6500;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function normalizePath(path: string): string {
  if (path === '/') return path;
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function toStaticHref(target: URL): string {
  let pathname = target.pathname;
  const lastSegment = pathname.split('/').pop() ?? '';
  const hasFileExtension = lastSegment.includes('.');

  if (pathname !== '/' && !pathname.endsWith('/') && !hasFileExtension) {
    pathname = `${pathname}/`;
  }

  return `${pathname}${target.search}${target.hash}`;
}

function shouldSkipTransition(currentPathname: string, target: URL, anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== '_self') return true;
  if (anchor.hasAttribute('download')) return true;
  if (target.origin !== window.location.origin) return true;
  if (target.protocol !== 'http:' && target.protocol !== 'https:') return true;

  const targetNorm = normalizePath(target.pathname);
  const currentNorm = normalizePath(currentPathname);

  if (targetNorm === currentNorm && target.hash) return true;
  if (targetNorm === currentNorm && target.search === window.location.search) return true;

  const isProjectDetailTarget = /^\/projects\/[^/]+/.test(targetNorm);
  const isProjectDetailFromProjectsIndex = currentNorm === '/projects' && isProjectDetailTarget;
  const isProjectReturnTarget = targetNorm === '/projects' && /^\/projects\/[^/]+/.test(currentNorm);
  return isProjectDetailFromProjectsIndex || isProjectReturnTarget;
}

export function PageTransitionLoader() {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const coveredAtRef = useRef(0);
  const targetHrefRef = useRef<string | null>(null);
  const maxWaitTimerRef = useRef<number | null>(null);
  const navigateTimerRef = useRef<number | null>(null);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const mark = markRef.current;
    const line = lineRef.current;
    if (!overlay || !mark || !line) return;

    gsap.set(overlay, {
      autoAlpha: 0,
      clipPath: 'inset(100% 0% 0% 0%)',
      pointerEvents: 'none',
    });
    gsap.set(mark, { autoAlpha: 0, y: 18, scale: 0.985 });
    gsap.set(line, { scaleX: 0, transformOrigin: '50% 50%' });
  }, []);

  useEffect(() => {
    const clearMaxWait = () => {
      if (maxWaitTimerRef.current) {
        window.clearTimeout(maxWaitTimerRef.current);
        maxWaitTimerRef.current = null;
      }
    };
    const clearNavigateTimer = () => {
      if (navigateTimerRef.current) {
        window.clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = null;
      }
    };

    const forceReveal = () => {
      clearMaxWait();
      clearNavigateTimer();
      const overlay = overlayRef.current;
      const mark = markRef.current;
      const line = lineRef.current;
      if (!overlay || !mark || !line) return;

      gsap.killTweensOf([overlay, mark, line]);
      gsap.timeline({
        onComplete: () => {
          activeRef.current = false;
          targetHrefRef.current = null;
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none', clipPath: 'inset(100% 0% 0% 0%)' });
          gsap.set(mark, { autoAlpha: 0, y: 18, scale: 0.985 });
          gsap.set(line, { scaleX: 0 });
        },
      })
        .to(mark, { autoAlpha: 0, y: -16, duration: 0.28, ease: 'power3.inOut' }, 0)
        .to(line, { scaleX: 0, duration: 0.24, ease: 'power3.inOut' }, 0)
        .to(overlay, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: REVEAL_DURATION,
          ease: 'power4.inOut',
        }, 0.08);
    };

    const beginTransition = (href: string, options: { replace?: boolean; scroll?: boolean } = {}) => {
      if (activeRef.current) return;
      projectTransitionLog('page loader begin transition', {
        href,
        options,
        pathname: window.location.pathname,
        scrollY: window.scrollY,
      });

      const overlay = overlayRef.current;
      const mark = markRef.current;
      const line = lineRef.current;
      if (!overlay || !mark || !line) {
        if (options.replace) {
          router.replace(href, { scroll: options.scroll ?? true });
        } else {
          router.push(href, { scroll: options.scroll ?? true });
        }
        return;
      }

      activeRef.current = true;
      targetHrefRef.current = href;
      coveredAtRef.current = 0;
      clearMaxWait();
      clearNavigateTimer();
      let hasNavigated = false;
      const navigateOnce = () => {
        if (hasNavigated) return;
        hasNavigated = true;
        coveredAtRef.current = performance.now();
        if (options.replace) {
          router.replace(href, { scroll: options.scroll ?? true });
        } else {
          router.push(href, { scroll: options.scroll ?? true });
        }
        maxWaitTimerRef.current = window.setTimeout(forceReveal, MAX_WAIT_MS);
      };

      gsap.killTweensOf([overlay, mark, line]);
      gsap.set(overlay, {
        autoAlpha: 1,
        clipPath: 'inset(100% 0% 0% 0%)',
        pointerEvents: 'auto',
      });
      gsap.set(mark, { autoAlpha: 0, y: 18, scale: 0.985 });
      gsap.set(line, { scaleX: 0, transformOrigin: '50% 50%' });

      gsap.timeline({
        onComplete: navigateOnce,
      })
        .to(overlay, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: COVER_DURATION,
          ease: 'power4.inOut',
        }, 0)
        .to(mark, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: 'power3.out',
        }, 0.14)
        .to(line, {
          scaleX: 1,
          duration: 0.34,
          ease: 'power3.out',
        }, 0.22);

      navigateTimerRef.current = window.setTimeout(navigateOnce, COVER_DURATION * 1000 + 80);
    };

    const beginObservedTransition = (href: string) => {
      if (activeRef.current) return;
      projectTransitionLog('page loader begin observed transition', {
        href,
        pathname: window.location.pathname,
        scrollY: window.scrollY,
      });

      const overlay = overlayRef.current;
      const mark = markRef.current;
      const line = lineRef.current;
      if (!overlay || !mark || !line) return;

      activeRef.current = true;
      targetHrefRef.current = href;
      coveredAtRef.current = performance.now();
      clearMaxWait();
      clearNavigateTimer();

      gsap.killTweensOf([overlay, mark, line]);
      gsap.set(overlay, {
        autoAlpha: 1,
        clipPath: 'inset(0% 0% 0% 0%)',
        pointerEvents: 'auto',
      });
      gsap.fromTo(mark, { autoAlpha: 0, y: 12, scale: 0.985 }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.28,
        ease: 'power3.out',
      });
      gsap.fromTo(line, { scaleX: 0, transformOrigin: '50% 50%' }, {
        scaleX: 1,
        duration: 0.26,
        ease: 'power3.out',
      });

      const targetPathname = new URL(href, window.location.href).pathname;
      if (normalizePath(pathnameRef.current) === normalizePath(targetPathname)) {
        navigateTimerRef.current = window.setTimeout(forceReveal, MIN_VISIBLE_MS);
      }

      maxWaitTimerRef.current = window.setTimeout(forceReveal, MAX_WAIT_MS);
    };

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const targetNode = event.target;
      if (!(targetNode instanceof Element)) return;

      const anchor = targetNode.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const target = new URL(href, window.location.href);
      const currentPathname = window.location.pathname;
      if (shouldSkipTransition(currentPathname, target, anchor)) return;

      event.preventDefault();
      const nextHref = toStaticHref(target);
      beginTransition(nextHref);
    };

    const onProgrammaticTransition = (event: Event) => {
      const detail = (event as CustomEvent<PageTransitionNavigationDetail>).detail;
      if (!detail?.href) return;
      projectTransitionLog('page loader programmatic event', {
        detail,
        pathname: window.location.pathname,
        scrollY: window.scrollY,
      });

      const target = new URL(detail.href, window.location.href);
      if (target.origin !== window.location.origin) {
        window.location.href = target.href;
        return;
      }

      beginTransition(toStaticHref(target), {
        replace: detail.replace,
        scroll: detail.scroll,
      });
    };

    const onPopState = () => {
      const target = new URL(window.location.href);
      if (target.origin !== window.location.origin) return;
      projectTransitionLog('page loader popstate observed', {
        href: target.href,
        pathname: window.location.pathname,
        scrollY: window.scrollY,
      });
      beginObservedTransition(toStaticHref(target));
    };

    // ── Camera-transition abort listener ──────────────────────────────────────
    // When the user clicks a project card the camera overlay (z-999) covers the
    // screen. If the page-loader (z-950) is still running its reveal animation
    // underneath, a flash of black is visible once the camera overlay fades out.
    // Fix: listen for the 'enter' phase of the camera transition and immediately
    // snap the loader to hidden (no animation) so there is nothing behind.
    const onCameraTransition = (e: Event) => {
      const detail = (e as CustomEvent<{ type?: string }>).detail;
      if (detail?.type !== 'enter') return;
      if (!activeRef.current) return;

      clearMaxWait();
      clearNavigateTimer();

      const overlay = overlayRef.current;
      const mark    = markRef.current;
      const line    = lineRef.current;
      if (!overlay || !mark || !line) return;

      gsap.killTweensOf([overlay, mark, line]);
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none', clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(mark,    { autoAlpha: 0, y: 18, scale: 0.985 });
      gsap.set(line,    { scaleX: 0 });
      activeRef.current    = false;
      targetHrefRef.current = null;
    };

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('popstate', onPopState);
    window.addEventListener(PAGE_TRANSITION_NAVIGATION_EVENT, onProgrammaticTransition);
    window.addEventListener(PROJECT_ROUTE_TRANSITION_EVENT, onCameraTransition);
    return () => {
      clearMaxWait();
      clearNavigateTimer();
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener(PAGE_TRANSITION_NAVIGATION_EVENT, onProgrammaticTransition);
      window.removeEventListener(PROJECT_ROUTE_TRANSITION_EVENT, onCameraTransition);
    };
  }, [router]);

  useEffect(() => {
    if (!activeRef.current || !targetHrefRef.current) return;

    const targetPathname = new URL(targetHrefRef.current, window.location.href).pathname;
    if (normalizePath(pathname) !== normalizePath(targetPathname)) return;
    projectTransitionLog('page loader pathname matched target', {
      pathname,
      targetHref: targetHrefRef.current,
      scrollY: window.scrollY,
    });

    const elapsed = coveredAtRef.current ? performance.now() - coveredAtRef.current : 0;
    const wait = Math.max(MIN_VISIBLE_MS - elapsed, ROUTE_SETTLE_MS);
    const revealTimer = window.setTimeout(() => {
      const overlay = overlayRef.current;
      const mark = markRef.current;
      const line = lineRef.current;
      if (!overlay || !mark || !line) return;

      if (maxWaitTimerRef.current) {
        window.clearTimeout(maxWaitTimerRef.current);
        maxWaitTimerRef.current = null;
      }
      if (navigateTimerRef.current) {
        window.clearTimeout(navigateTimerRef.current);
        navigateTimerRef.current = null;
      }

      gsap.killTweensOf([overlay, mark, line]);
      gsap.timeline({
        onComplete: () => {
          activeRef.current = false;
          targetHrefRef.current = null;
          gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none', clipPath: 'inset(100% 0% 0% 0%)' });
          gsap.set(mark, { autoAlpha: 0, y: 18, scale: 0.985 });
          gsap.set(line, { scaleX: 0 });
        },
      })
        .to(mark, {
          autoAlpha: 0,
          y: -16,
          scale: 1.015,
          duration: 0.34,
          ease: 'power3.inOut',
        }, 0)
        .to(line, {
          scaleX: 0,
          duration: 0.28,
          ease: 'power3.inOut',
        }, 0.02)
        .to(overlay, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: REVEAL_DURATION,
          ease: 'power4.inOut',
        }, 0.12);
    }, wait);

    return () => window.clearTimeout(revealTimer);
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      suppressHydrationWarning
      className="page-transition-loader pointer-events-none invisible fixed inset-0 z-[950] grid place-items-center bg-black text-white opacity-0"
      style={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      aria-hidden="true"
    >
      <div ref={markRef} suppressHydrationWarning className="premium-loader__mark opacity-0" data-label="ML">ML</div>
      <div ref={lineRef} suppressHydrationWarning className="page-transition-loader__line" style={{ transform: 'translate(-50%, -50%) scaleX(0)' }} />
    </div>
  );
}
