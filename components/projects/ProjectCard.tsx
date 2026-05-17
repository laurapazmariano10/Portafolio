'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProjectDepthStrength } from '@/components/projects/projectVisualConfig';
import type { Project } from '@/components/projects/projectsData';

const ProjectDepthCard = dynamic(() => import('@/components/projects/ProjectDepthCard'), { ssr: false });

type ProjectCardProps = {
  project: Project;
  cardRef: (node: HTMLElement | null) => void;
  onProjectClick: (event: React.MouseEvent<HTMLAnchorElement>, project: Project) => void;
};

export function ProjectCard({ project, cardRef, onProjectClick }: ProjectCardProps) {
  return (
    <article
      ref={cardRef}
      data-project-slug={project.slug}
      className="group project-card-reveal"
    >
      <Link href={`/projects/${project.slug}/`} className="block outline-none" onClick={(event) => onProjectClick(event, project)}>
        <div data-project-card-frame className="relative aspect-[1120/746] overflow-hidden rounded-[28px]">
          <ProjectDepthCard
            cover={project.cover}
            depthMap={project.depthMap}
            title={project.title}
            invertDepth={project.invertDepth}
            strength={getProjectDepthStrength(project)}
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
  );
}
