'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SignatureSVG from '@/components/SignatureSVG';
import type { Project } from '@/components/projects/projectsData';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ProjectDetailClientProps = {
  project: Project;
};

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isReturningRef = useRef(false);

  useGSAP(
    () => {
      const root = rootRef.current;
      const track = trackRef.current;
      if (!root || !track) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const getScrollAmount = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth + 120);

        const tween = gsap.to(track, {
          x: () => -getScrollAmount(),
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: () => `+=${getScrollAmount()}`,
            scrub: 0.85,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

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

        gsap.utils.toArray<HTMLElement>('[data-project-frame]').forEach((frame) => {
          gsap.fromTo(frame, {
            autoAlpha: 0,
            scale: 0.92,
            rotate: -0.8,
            filter: 'blur(14px)',
          }, {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: frame,
              containerAnimation: tween,
              start: 'left 82%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      mm.add('(max-width: 1023px)', () => {
        gsap.set(track, { clearProps: 'transform' });

        gsap.fromTo('[data-detail-intro]', {
          autoAlpha: 0,
          y: 28,
          filter: 'blur(10px)',
        }, {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.06,
        });

        gsap.utils.toArray<HTMLElement>('[data-project-frame]').forEach((frame) => {
          gsap.fromTo(frame, {
            autoAlpha: 0,
            y: 42,
            scale: 0.97,
            filter: 'blur(10px)',
          }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: frame,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          });
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef }
  );

  const handleBackClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (isReturningRef.current) return;

    isReturningRef.current = true;

    let context: { slug: string; scrollY: number; cover: string; gradient: string } = {
      slug: project.slug,
      scrollY: 0,
      cover: project.cover,
      gradient: project.gradient,
    };

    try {
      const raw = window.sessionStorage.getItem('project-transition-context');
      if (raw) context = { ...context, ...JSON.parse(raw) };
    } catch {
      context = {
        slug: project.slug,
        scrollY: 0,
        cover: project.cover,
        gradient: project.gradient,
      };
    }

    window.sessionStorage.setItem('project-return-transition', JSON.stringify(context));
    window.dispatchEvent(new CustomEvent('project-route-transition', {
      detail: {
        type: 'return',
        href: '/projects',
        context,
      },
    }));
  };

  const getFrameClassName = (image: Project['images'][number]) => {
    const isZygoWebSecondImage = project.slug === 'zygo-web' && image.src.includes('/1.1W.webp');
    const mobileAspect = isZygoWebSecondImage ? 'aspect-[3/4]' : image.variant === 'tall' ? 'aspect-[9/16]' : 'aspect-video';
    const desktopSize = image.variant === 'tall'
      ? 'lg:h-[92vh] lg:w-[min(560px,82vw)] lg:rounded-[30px]'
      : 'lg:h-[min(728px,74vh)] lg:w-[min(1264px,86vw)] lg:rounded-[34px]';

    return `relative w-full shrink-0 overflow-hidden bg-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.20)] lg:shadow-[0_35px_120px_rgba(0,0,0,0.22)] ${mobileAspect} rounded-[28px] ${desktopSize}`;
  };

  return (
    <main ref={rootRef} className="min-h-screen overflow-x-hidden text-white lg:overflow-hidden" style={{ background: project.gradient }}>
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), transparent 34%)' }} />
      <div ref={trackRef} className="relative z-10 flex w-full flex-col gap-12 px-5 pb-16 pt-6 md:px-10 md:pb-20 lg:h-screen lg:w-max lg:flex-row lg:items-center lg:gap-[210px] lg:px-[clamp(2rem,7vw,6rem)] lg:py-10 lg:will-change-transform">
        <section className="grid w-full shrink-0 grid-cols-1 gap-8 pt-8 md:gap-10 lg:h-[calc(100vh-5rem)] lg:w-[min(960px,88vw)] lg:content-start lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-16 lg:pt-[18vh]">
          <div>
            <Link href="/projects" onClick={handleBackClick} data-detail-intro className={`mb-10 inline-flex h-11 items-center justify-center rounded-full px-6 text-xs font-bold uppercase tracking-[-0.02em] shadow-[0_18px_50px_rgba(0,0,0,0.13)] lg:hidden ${project.slug === 'qualitiktok' ? 'bg-white text-[#070e36]' : 'bg-white/86 text-[#111]'}`}>
              Regresar
            </Link>
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
            <Link href="/projects" onClick={handleBackClick} className={`mt-14 hidden h-12 items-center justify-center rounded-full px-7 text-sm font-bold uppercase tracking-[-0.02em] shadow-[0_20px_60px_rgba(0,0,0,0.13)] transition-transform duration-300 hover:scale-105 lg:inline-flex ${project.slug === 'qualitiktok' ? 'bg-white text-[#070e36]' : 'bg-white/86 text-[#111]'}`}>
              Atrás
            </Link>
          </aside>
        </section>

        {project.images.map((image, index) => (
          <figure
            key={image.src}
            data-project-frame
            className={getFrameClassName(image)}
          >
            <Image src={image.src} alt={image.alt} fill sizes={image.variant === 'tall' ? '(max-width: 1023px) 100vw, 560px' : '(max-width: 1023px) 100vw, 1264px'} className="object-contain lg:object-cover" priority={index === 0} />
          </figure>
        ))}
      </div>
    </main>
  );
}
