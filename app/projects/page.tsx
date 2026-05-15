'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Navbar } from '@/components/navbar';
import { PROJECTS } from '@/components/projects/projectsData';

const MathFluidParticles = dynamic(() => import('@/components/projects/MathFluidParticles'), { ssr: false });
const ProjectDepthCard = dynamic(() => import('@/components/projects/ProjectDepthCard'), { ssr: false });

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectsPage() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const isTransitioningRef = useRef(false);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter((node): node is HTMLElement => node !== null);
      const title = rootRef.current?.querySelector('[data-projects-title]');
      const intro = rootRef.current?.querySelector('[data-projects-intro]');
      let returnTransition: { slug: string; scrollY: number; cover: string; gradient: string } | null = null;

      try {
        const raw = window.sessionStorage.getItem('project-return-transition');
        returnTransition = raw ? JSON.parse(raw) : null;
        if (raw) window.sessionStorage.removeItem('project-return-transition');
      } catch {
        returnTransition = null;
      }

      if (returnTransition) {
        window.scrollTo(0, returnTransition.scrollY);
        gsap.set([title, intro, ...cards].filter(Boolean), {
          autoAlpha: 1,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          rotateX: 0,
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

      if (!returnTransition) cards.forEach((card, index) => {
        gsap.set(card, {
          autoAlpha: 0,
          y: 130,
          scaleX: 0.9,
          scaleY: 1.2,
          rotate: index % 2 === 0 ? -2 : 2,
          rotateX: -28,
          transformPerspective: 1100,
          transformOrigin: '50% 100%',
          filter: 'blur(14px)',
        });

        gsap.to(card, {
          autoAlpha: 1,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.45,
          ease: 'elastic.out(1, 0.7)',
          scrollTrigger: {
            trigger: card,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: rootRef }
  );

  const handleProjectClick = (event: React.MouseEvent<HTMLAnchorElement>, project: (typeof PROJECTS)[number]) => {
    if (isTransitioningRef.current) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    const card = event.currentTarget.querySelector('[data-project-card-frame]');
    const rect = card?.getBoundingClientRect();
    if (!rect) {
      router.push(`/projects/${project.slug}`, { scroll: false });
      return;
    }

    isTransitioningRef.current = true;
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

    window.sessionStorage.setItem('project-transition-context', JSON.stringify(context));
    window.dispatchEvent(new CustomEvent('project-route-transition', {
      detail: {
        type: 'enter',
        href: `/projects/${project.slug}`,
        context,
      },
    }));
  };

  return (
    <main ref={rootRef} className="min-h-screen bg-white text-[#111]">
      <Navbar />
      <section className="mx-auto max-w-[1180px] px-6 pb-24 pt-[18vh] md:px-10">
        <div className="mb-16">
          <h1 data-projects-title className="font-[family-name:var(--font-antonio)] text-[clamp(4.5rem,11vw,11rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-[#303030]">
            Proyectos Destacados
          </h1>
          <p data-projects-intro className="mt-7 max-w-[540px] font-[family-name:var(--font-sans)] text-[clamp(0.95rem,1.2vw,1.12rem)] font-light leading-[1.48] text-[#303030]/62">
            Una selección de productos digitales, interfaces y sistemas donde diseño, movimiento y desarrollo trabajan como una sola experiencia.
          </p>
        </div>

        <div className="space-y-32 md:space-y-40">
          {PROJECTS.map((project, index) => (
            <article
              key={project.slug}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-project-slug={project.slug}
              className="group project-card-reveal"
            >
              <Link prefetch={true} href={`/projects/${project.slug}`} className="block outline-none" onClick={(event) => handleProjectClick(event, project)}>
                <div data-project-card-frame className="relative aspect-[1120/746] overflow-hidden rounded-[28px]">
                  <ProjectDepthCard 
                    cover={project.cover} 
                    depthMap={project.depthMap} 
                    title={project.title}
                    invertDepth={project.invertDepth}
                    strength={project.slug === 'pisky' ? 0.007 : project.slug === 'zygo-app' ? 0.003 : 0.035}
                    className="h-full w-full"
                  />
                </div>
                <div className="mt-7 font-[family-name:var(--font-antonio)] text-[#111]">
                  <p className="text-[clamp(1rem,1.5vw,1.35rem)] font-normal uppercase leading-[1.18] tracking-[-0.015em] text-[#111]/85 lg:leading-none">
                    {project.tags.join(' · ')}
                  </p>
                  <h2 className="mt-4 pb-[0.26em] text-[clamp(3rem,6.5vw,5.9rem)] font-normal leading-[1.12] tracking-[-0.055em] transition-transform duration-500 group-hover:translate-x-2 lg:pb-[0.18em] lg:leading-[1.02]">
                    {project.shortTitle}
                  </h2>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <MathFluidParticles />
    </main>
  );
}
