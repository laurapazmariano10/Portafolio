'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Navbar } from '@/components/navbar';
import { ContactAndFooter } from '@/components/ContactAndFooter';
import MathFluidParticles from '@/components/projects/MathFluidParticles';
import ProjectDepthCard from '@/components/projects/ProjectDepthCard';
import { PROJECTS } from '@/components/projects/projectsData';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectsPage() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const transitionRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter((node): node is HTMLElement => node !== null);
      const title = rootRef.current?.querySelector('[data-projects-title]');
      const intro = rootRef.current?.querySelector('[data-projects-intro]');

      if (title) {
        gsap.fromTo(title, { y: 80, autoAlpha: 0, letterSpacing: '-0.09em' }, {
          y: 0,
          autoAlpha: 1,
          letterSpacing: '-0.055em',
          duration: 1.05,
          ease: 'power4.out',
        });
      }

      if (intro) {
        gsap.fromTo(intro, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.18, ease: 'power3.out' });
      }

      cards.forEach((card, index) => {
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
          clipPath: 'inset(20% 8% 0% 8% round 56px)',
        });

        gsap.to(card, {
          autoAlpha: 1,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotate: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0% round 30px)',
          duration: 1.45,
          ease: 'elastic.out(1, 0.7)',
          scrollTrigger: {
            trigger: card,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },
    { scope: rootRef }
  );

  const handleProjectClick = (event: React.MouseEvent<HTMLAnchorElement>, project: (typeof PROJECTS)[number]) => {
    if (isTransitioningRef.current) {
      event.preventDefault();
      return;
    }
    const overlay = transitionRef.current;
    if (!overlay) return;

    event.preventDefault();
    const card = event.currentTarget.querySelector('.project-depth-card');
    const rect = card?.getBoundingClientRect();
    if (!rect) {
      router.push(`/projects/${project.slug}`);
      return;
    }

    isTransitioningRef.current = true;

    gsap.killTweensOf(overlay);
    gsap.set(overlay, {
      autoAlpha: 1,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      borderRadius: 30,
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.24)), url(${project.cover})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      filter: 'blur(0px)',
      scale: 1,
    });

    gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete: () => router.push(`/projects/${project.slug}`),
    })
      .to(overlay, {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.82,
      })
      .to(overlay, {
        scale: 1.08,
        filter: 'blur(10px)',
        duration: 0.32,
        ease: 'power2.in',
      }, '-=0.22')
      .to(overlay, {
        backgroundImage: project.gradient,
        duration: 0.32,
        ease: 'power2.inOut',
      }, '-=0.32');
  };

  return (
    <main ref={rootRef} className="min-h-screen bg-white text-[#111]">
      <div ref={transitionRef} className="pointer-events-none fixed left-0 top-0 z-[120] opacity-0 will-change-transform" />
      <Navbar />
      <section className="mx-auto max-w-[1180px] px-6 pb-24 pt-[18vh] md:px-10">
        <div className="mb-16">
          <h1 data-projects-title className="font-[family-name:var(--font-antonio)] text-[clamp(5rem,13vw,13rem)] font-bold uppercase leading-[0.78] tracking-[-0.055em] text-[#303030]">
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
              className="group project-card-reveal"
            >
              <Link href={`/projects/${project.slug}`} className="block outline-none" onClick={(event) => handleProjectClick(event, project)}>
                <ProjectDepthCard cover={project.cover} depthMap={project.depthMap} title={project.title} />
                <div className="mt-7 font-[family-name:var(--font-antonio)] text-[#111]">
                  <p className="text-[clamp(1rem,1.5vw,1.35rem)] font-normal uppercase leading-none tracking-[-0.015em] text-[#111]/85">
                    {project.tags.join(' · ')}
                  </p>
                  <h2 className="mt-4 pb-[0.18em] text-[clamp(3rem,6.5vw,5.9rem)] font-normal leading-[1.02] tracking-[-0.055em] transition-transform duration-500 group-hover:translate-x-2">
                    {project.shortTitle}
                  </h2>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <MathFluidParticles />
      <ContactAndFooter />
    </main>
  );
}
