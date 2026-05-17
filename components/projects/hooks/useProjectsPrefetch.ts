'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/components/projects/projectsData';

export function useProjectsPrefetch(projects: Project[]) {
  const router = useRouter();

  useEffect(() => {
    projects.forEach((project) => {
      router.prefetch(`/projects/${project.slug}/`);
    });

    import('@/components/projects/ProjectDetailClient').catch(() => undefined);
  }, [projects, router]);
}
