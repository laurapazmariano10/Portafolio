'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PROJECT_ROUTE_TRANSITION_EVENT, projectTransitionLog } from '@/components/projects/projectAnimationConfig';
import { getProjectDetailHref, setProjectDetailReturnTarget } from '@/components/projects/projectNavigation';
import type { Project } from '@/components/projects/projectsData';

function normalizePath(path: string) {
  if (path === '/') return path;
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function useProjectEnterTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const isTransitioningRef = useRef(false);
  const fallbackResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (normalizePath(pathname) === '/projects') {
      projectTransitionLog('enter guard reset on projects pathname', {
        pathname,
        scrollY: window.scrollY,
      });
      isTransitioningRef.current = false;
    }

    if (fallbackResetTimerRef.current !== null) {
      window.clearTimeout(fallbackResetTimerRef.current);
      fallbackResetTimerRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (fallbackResetTimerRef.current !== null) {
        window.clearTimeout(fallbackResetTimerRef.current);
      }
    };
  }, []);

  return useCallback((event: React.MouseEvent<HTMLAnchorElement>, project: Project) => {
    if (isTransitioningRef.current) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    const href = getProjectDetailHref(project);
    const card = event.currentTarget.querySelector('[data-project-card-frame]') as HTMLElement | null;

    if (!card) {
      projectTransitionLog('enter fallback: card frame not found', { slug: project.slug, href });
      router.push(href, { scroll: false });
      return;
    }

    const rect = card.getBoundingClientRect();
    const context = {
      slug: project.slug,
      scrollY: window.scrollY,
      cover: project.cover,
      gradient: project.gradient,
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
    };

    isTransitioningRef.current = true;
    setProjectDetailReturnTarget({
      source: 'projects',
      href: '/projects/',
      scrollY: context.scrollY,
    });
    projectTransitionLog('enter dispatch', {
      slug: project.slug,
      href,
      scrollY: context.scrollY,
      rect: context.rect,
      currentPathname: window.location.pathname,
    });

    fallbackResetTimerRef.current = window.setTimeout(() => {
      if (normalizePath(window.location.pathname) === '/projects') {
        projectTransitionLog('enter fallback guard reset', {
          pathname: window.location.pathname,
          scrollY: window.scrollY,
        });
        isTransitioningRef.current = false;
      }
      fallbackResetTimerRef.current = null;
    }, 1800);

    window.sessionStorage.setItem('project-transition-context', JSON.stringify(context));
    window.dispatchEvent(new CustomEvent(PROJECT_ROUTE_TRANSITION_EVENT, {
      detail: {
        type: 'enter',
        href,
        context,
        onNavigate: () => router.push(href, { scroll: false }),
      },
    }));
  }, [router]);
}
