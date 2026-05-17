'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { Navbar } from '@/components/navbar';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useProjectEnterTransition } from '@/components/projects/hooks/useProjectEnterTransition';
import { useProjectsInitialScroll } from '@/components/projects/hooks/useProjectsInitialScroll';
import { useProjectsListReveal } from '@/components/projects/hooks/useProjectsListReveal';
import { useProjectsPrefetch } from '@/components/projects/hooks/useProjectsPrefetch';
import { projectTransitionLog } from '@/components/projects/projectAnimationConfig';
import { PROJECTS } from '@/components/projects/projectsData';

const MathFluidParticles = dynamic(() => import('@/components/projects/MathFluidParticles'), { ssr: false });

export default function ProjectsPage() {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const handleProjectClick = useProjectEnterTransition();

  useProjectsInitialScroll();
  useProjectsPrefetch(PROJECTS);
  useProjectsListReveal(rootRef, cardRefs);

  useEffect(() => {
    projectTransitionLog('projects page project order', {
      slugs: PROJECTS.map((project) => project.slug),
      total: PROJECTS.length,
    });
  }, []);

  return (
    <main ref={rootRef} className="min-h-screen bg-white text-[#111]">
      <Navbar />
      <section className="mx-auto max-w-[1180px] px-6 pb-2 pt-[12vh] md:px-10 md:pb-4 md:pt-[14vh] lg:pb-12 lg:pt-[18vh]">
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
            <ProjectCard
              key={project.slug}
              project={project}
              onProjectClick={handleProjectClick}
              cardRef={(node) => {
                cardRefs.current[index] = node;
              }}
            />
          ))}
        </div>
      </section>

      <MathFluidParticles />
    </main>
  );
}
