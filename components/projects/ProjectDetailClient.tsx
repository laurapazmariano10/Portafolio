'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react';
import SignatureSVG from '@/components/SignatureSVG';
import { dispatchPageTransitionNavigation } from '@/components/navigation/pageTransitionEvents';
import { PROJECT_ROUTE_TRANSITION_EVENT, projectTransitionLog } from '@/components/projects/projectAnimationConfig';
import { useHorizontalWheelScroll } from '@/components/projects/hooks/useHorizontalWheelScroll';
import { useProjectDetailReveal } from '@/components/projects/hooks/useProjectDetailReveal';
import { useProjectDetailScrollReset } from '@/components/projects/hooks/useProjectDetailScrollReset';
import {
  clearProjectDetailReturnTarget,
  getProjectDetailHref,
  readProjectDetailReturnTarget,
  type ProjectDetailReturnTarget,
} from '@/components/projects/projectNavigation';
import { getProjectDetailFrameClassName } from '@/components/projects/projectVisualConfig';
import type { Project } from '@/components/projects/projectsData';

type ProjectDetailClientProps = {
  project: Project;
  mode?: 'page' | 'modal';
};

function ProjectDetailImage({
  project,
  image,
  index,
}: {
  project: Project;
  image: Project['images'][number];
  index: number;
}) {
  const [failed, setFailed] = useState(false);
  const loadLoggedRef = useRef(false);

  const handleLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    if (loadLoggedRef.current) return;
    loadLoggedRef.current = true;

    projectTransitionLog('project detail image loaded', {
      slug: project.slug,
      index,
      src: image.src,
      naturalWidth: event.currentTarget.naturalWidth,
      naturalHeight: event.currentTarget.naturalHeight,
      pathname: window.location.pathname,
    });
  }, [image.src, index, project.slug]);

  const handleError = useCallback(() => {
    projectTransitionLog('project detail image error', {
      slug: project.slug,
      index,
      src: image.src,
      pathname: window.location.pathname,
    });
    setFailed(true);
  }, [image.src, index, project.slug]);

  if (failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-white/12 px-6 text-center text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-black/45">
        Imagen no disponible
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={image.variant === 'tall' ? '(max-width: 1023px) 100vw, 560px' : '(max-width: 1023px) 100vw, 1264px'}
      className="object-contain lg:object-cover"
      priority={index === 0}
      loading={index === 0 ? undefined : 'eager'}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}

export default function ProjectDetailClient({ project, mode = 'page' }: ProjectDetailClientProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isReturningRef = useRef(false);
  const returnFallbackTimerRef = useRef<number | null>(null);
  const isModal = mode === 'modal';

  useProjectDetailScrollReset(rootRef, project.slug);
  useHorizontalWheelScroll(rootRef);
  useProjectDetailReveal(rootRef, trackRef, isModal, project.slug);

  useEffect(() => {
    projectTransitionLog('project detail mounted', {
      slug: project.slug,
      mode,
      imageCount: project.images.length,
      imageSources: project.images.map((image) => image.src),
      returnTarget: readProjectDetailReturnTarget(),
      pathname: window.location.pathname,
      scrollY: window.scrollY,
    });
  }, [mode, project.images, project.slug]);

  useEffect(() => {
    return () => {
      if (returnFallbackTimerRef.current !== null) {
        window.clearTimeout(returnFallbackTimerRef.current);
      }
    };
  }, [project.slug]);

  const readProjectReturnContext = useCallback(() => {
    const returnTarget = readProjectDetailReturnTarget();
    let context: { slug: string; scrollY: number; cover: string; gradient: string } = {
      slug: project.slug,
      scrollY: returnTarget?.source === 'projects' ? returnTarget.scrollY : 0,
      cover: project.cover,
      gradient: project.gradient,
    };

    if (returnTarget?.source === 'projects') {
      try {
        const raw = window.sessionStorage.getItem('project-transition-context');
        if (raw) context = { ...context, ...JSON.parse(raw) };
      } catch {
        context = {
          slug: project.slug,
          scrollY: returnTarget.scrollY,
          cover: project.cover,
          gradient: project.gradient,
        };
      }
    }

    return context;
  }, [project.cover, project.gradient, project.slug]);

  const startHomeReturn = useCallback((returnTarget: ProjectDetailReturnTarget, replace = false) => {
    if (isReturningRef.current) return;

    isReturningRef.current = true;
    projectTransitionLog('detail home return start', {
      slug: project.slug,
      returnTarget,
      replace,
      currentPathname: window.location.pathname,
      windowScrollY: window.scrollY,
      rootScrollTop: rootRef.current?.scrollTop,
      rootScrollLeft: rootRef.current?.scrollLeft,
    });
    clearProjectDetailReturnTarget();
    dispatchPageTransitionNavigation({
      href: returnTarget.href,
      replace,
      scroll: true,
    });
  }, [project.slug]);

  const startProjectsReturn = useCallback((replace = false) => {
    if (isReturningRef.current) return;

    isReturningRef.current = true;
    const context = readProjectReturnContext();
    clearProjectDetailReturnTarget();

    window.sessionStorage.setItem('project-return-transition', JSON.stringify(context));
    projectTransitionLog('detail back dispatch return', {
      slug: project.slug,
      context,
      isModal,
      currentPathname: window.location.pathname,
      windowScrollY: window.scrollY,
      rootScrollTop: rootRef.current?.scrollTop,
      rootScrollLeft: rootRef.current?.scrollLeft,
    });

    returnFallbackTimerRef.current = window.setTimeout(() => {
      projectTransitionLog('detail back fallback reset', {
        slug: project.slug,
        pathname: window.location.pathname,
        windowScrollY: window.scrollY,
      });
      isReturningRef.current = false;
      returnFallbackTimerRef.current = null;
    }, 2200);

    window.dispatchEvent(new CustomEvent(PROJECT_ROUTE_TRANSITION_EVENT, {
      detail: {
        type: 'return',
        href: '/projects/',
        context,
        isModalReturn: isModal,
        onNavigate: () => {
          if (isModal) {
            router.back();
            return;
          }

          if (replace) {
            router.replace('/projects/', { scroll: false });
            return;
          }

          router.push('/projects/', { scroll: false });
        },
      },
    }));
  }, [isModal, project.slug, readProjectReturnContext, router]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isReturningRef.current) return;

      const returnTarget = readProjectDetailReturnTarget();
      if (!returnTarget) return;

      projectTransitionLog('detail popstate intercepted', {
        slug: project.slug,
        returnTarget,
        pathname: window.location.pathname,
        scrollY: window.scrollY,
      });
      event.stopImmediatePropagation();
      window.history.pushState(window.history.state, '', getProjectDetailHref(project));

      if (returnTarget.source === 'home') {
        startHomeReturn(returnTarget, true);
        return;
      }

      startProjectsReturn(true);
    };

    window.addEventListener('popstate', handlePopState, true);
    return () => window.removeEventListener('popstate', handlePopState, true);
  }, [project, startHomeReturn, startProjectsReturn]);

  const handleBackClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;

    const returnTarget = readProjectDetailReturnTarget();
    projectTransitionLog('detail back click', {
      slug: project.slug,
      returnTarget,
      pathname: window.location.pathname,
      scrollY: window.scrollY,
    });
    if (returnTarget?.source === 'home') {
      event.preventDefault();
      startHomeReturn(returnTarget);
      return;
    }

    event.preventDefault();
    startProjectsReturn();
  };

  const getFrameClassName = (image: Project['images'][number]) => {
    const mobileAspect = getProjectDetailFrameClassName(project, image);
    const desktopSize = image.variant === 'tall'
      ? 'lg:h-[92vh] lg:w-[min(560px,82vw)] lg:rounded-[30px]'
      : 'lg:h-[min(728px,74vh)] lg:w-[min(1264px,86vw)] lg:rounded-[34px]';

    return `relative w-full shrink-0 overflow-hidden bg-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.20)] lg:shadow-[0_35px_120px_rgba(0,0,0,0.22)] ${mobileAspect} rounded-[28px] ${desktopSize}`;
  };

  const rootClassName = isModal
    ? 'fixed inset-0 z-[120] h-[100dvh] overflow-y-auto overflow-x-hidden overscroll-contain text-white lg:overflow-x-auto lg:overflow-y-hidden'
    : 'min-h-screen overflow-x-hidden text-white lg:h-screen lg:overflow-x-auto lg:overflow-y-hidden';

  return (
    <main ref={rootRef} data-project-detail-root className={rootClassName} style={{ background: project.gradient }}>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), transparent 34%)' }} />
      <div data-detail-intro className="fixed left-5 top-5 z-30 flex items-center gap-3 md:left-8 md:top-8">
        <Link href="/projects/" onClick={handleBackClick} className={`inline-flex h-11 items-center justify-center rounded-full px-6 text-xs font-bold uppercase tracking-[-0.02em] shadow-[0_18px_50px_rgba(0,0,0,0.13)] transition-transform duration-300 hover:scale-105 ${project.slug === 'qualitiktok' ? 'bg-white text-[#070e36]' : 'bg-white/86 text-[#111]'}`}>
          Atrás
        </Link>
        <Link href="/contacto/#contact" className={`group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full px-6 text-xs font-bold uppercase tracking-[-0.02em] shadow-[0_18px_50px_rgba(0,0,0,0.13)] ring-1 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-[0_22px_62px_rgba(104,114,242,0.28)] ${project.slug === 'qualitiktok' ? 'bg-white/14 text-white ring-white/36 backdrop-blur-md hover:bg-white hover:text-[#070e36] hover:ring-white/70' : 'bg-[#111]/88 text-white ring-white/10 hover:bg-[#6872F2] hover:ring-[#6872F2]/45'}`}>
          <span className="absolute inset-0 -translate-x-[120%] bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.34)_45%,transparent_68%)] transition-transform duration-700 ease-out group-hover:translate-x-[120%]" />
          <span className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.38),transparent_44%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="relative z-10 transition-transform duration-500 ease-out group-hover:translate-x-[-3px]">Contacto</span>
          <span className="relative z-10 ml-1.5 translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100">→</span>
        </Link>
      </div>
      <div ref={trackRef} className="relative z-10 flex w-full flex-col gap-12 px-5 pb-16 pt-24 md:px-10 md:pb-20 md:pt-28 lg:h-screen lg:w-max lg:flex-row lg:items-center lg:gap-[210px] lg:px-[clamp(2rem,7vw,6rem)] lg:py-10 lg:will-change-transform">
        <section className="grid w-full shrink-0 grid-cols-1 gap-8 pt-8 md:gap-10 lg:h-[calc(100vh-5rem)] lg:w-[min(960px,88vw)] lg:content-start lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-16 lg:pt-[18vh]">
          <div>
            <div data-detail-intro className="mb-10 w-[190px] md:w-[260px] lg:mb-[8vh] lg:w-[300px]">
              <SignatureSVG color={project.slug === 'qualitiktok' ? '#FFFFFF' : '#111111'} className="h-auto w-full" />
            </div>
            <h1 data-detail-intro className={`font-[family-name:var(--font-antonio)] text-[clamp(3.75rem,18vw,8rem)] font-normal uppercase leading-[0.86] tracking-[-0.06em] lg:text-[clamp(5rem,12vw,10rem)] lg:leading-[0.82] ${project.slug === 'qualitiktok' ? 'text-white' : 'text-[#111]'}`}>
              {project.title}
            </h1>
            <p data-detail-intro className={`mt-8 max-w-[500px] font-[family-name:var(--font-sans)] text-[11.5px] font-semibold leading-[1.6] tracking-[-0.01em] ${project.slug === 'qualitiktok' ? 'text-white/82' : 'text-[#111]/78'}`}>
              {project.description}
            </p>
          </div>

          <aside data-detail-intro className={`self-start pt-[4vh] font-[family-name:var(--font-sans)] ${project.slug === 'qualitiktok' ? 'text-white' : 'text-[#111]'}`}>
            <p className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] opacity-62">Servicio:</p>
            <ul className="space-y-2 text-[0.98rem] font-semibold leading-[1.1]">
              {project.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </aside>
        </section>

        {project.images.map((image, index) => (
          <figure
            key={image.src}
            data-project-frame
            className={getFrameClassName(image)}
          >
            <ProjectDetailImage project={project} image={image} index={index} />
          </figure>
        ))}
      </div>
    </main>
  );
}
