import { notFound } from 'next/navigation';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';
import { getProjectBySlug } from '@/components/projects/projectsData';

type ProjectModalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectModalPage({ params }: ProjectModalPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return <ProjectDetailClient project={project} mode="modal" />;
}
