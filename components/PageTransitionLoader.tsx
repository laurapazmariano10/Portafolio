'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

const COVER_DURATION = 0.46;
const REVEAL_DURATION = 0.62;
const MIN_VISIBLE_MS = 820;
const ROUTE_SETTLE_MS = 420;
const MAX_WAIT_MS = 6500;

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function shouldSkipTransition(currentPathname: string, target: URL, anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== '_self') return true;
  if (anchor.hasAttribute('download')) return true;
  if (target.origin !== window.location.origin) return true;
  if (target.protocol !== 'http:' && target.protocol !== 'https:') return true;
  if (target.pathname === currentPathname && target.hash) return true;
  if (target.pathname === currentPathname && target.search === window.location.search) return true;

  const isProjectDetailTarget = target.pathname.startsWith('/projects/');
  const isProjectReturnTarget = target.pathname === '/projects' && currentPathname.startsWith('/projects/');
  return isProjectDetailTarget || isProjectReturnTarget;
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

    const beginTransition = (href: string) => {
      if (activeRef.current) return;

      const overlay = overlayRef.current;
      const mark = markRef.current;
      const line = lineRef.current;
      if (!overlay || !mark || !line) {
        router.push(href);
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
        router.push(href);
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

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const targetNode = event.target;
      if (!(targetNode instanceof Element)) return;

      const anchor = targetNode.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const target = new URL(href, window.location.href);
      if (shouldSkipTransition(pathname, target, anchor)) return;

      event.preventDefault();
      const nextHref = `${target.pathname}${target.search}${target.hash}`;
      beginTransition(nextHref);
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => {
      clearMaxWait();
      clearNavigateTimer();
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [pathname, router]);

  useEffect(() => {
    if (!activeRef.current || !targetHrefRef.current) return;

    const targetPathname = new URL(targetHrefRef.current, window.location.href).pathname;
    if (pathname !== targetPathname) return;

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
      className="page-transition-loader fixed inset-0 z-[950] grid place-items-center bg-black text-white"
      aria-hidden="true"
    >
      <div ref={markRef} suppressHydrationWarning className="premium-loader__mark" data-label="ML">ML</div>
      <div ref={lineRef} suppressHydrationWarning className="page-transition-loader__line" />
    </div>
  );
}
