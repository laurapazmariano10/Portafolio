import { notFound } from 'next/navigation';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';
import { PROJECTS, getProjectBySlug } from '@/components/projects/projectsData';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  return {
    title: project ? `${project.title} | Proyectos` : 'Proyecto',
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
