import type { Project } from '@/components/projects/projectsData';

const PROJECT_DETAIL_RETURN_TARGET_KEY = 'project-detail-return-target';

export type ProjectDetailReturnTarget = {
  source: 'projects' | 'home';
  href: string;
  scrollY: number;
};

export function getProjectDetailHref(project: Pick<Project, 'slug'>) {
  return `/projects/${project.slug}/`;
}

export function setProjectDetailReturnTarget(target: ProjectDetailReturnTarget) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PROJECT_DETAIL_RETURN_TARGET_KEY, JSON.stringify(target));
}

export function clearProjectDetailReturnTarget() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PROJECT_DETAIL_RETURN_TARGET_KEY);
}

export function readProjectDetailReturnTarget(): ProjectDetailReturnTarget | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PROJECT_DETAIL_RETURN_TARGET_KEY);
    if (!raw) return null;

    const target = JSON.parse(raw) as Partial<ProjectDetailReturnTarget>;
    if (
      (target.source === 'projects' || target.source === 'home') &&
      typeof target.href === 'string' &&
      typeof target.scrollY === 'number'
    ) {
      return target as ProjectDetailReturnTarget;
    }
  } catch {
    window.sessionStorage.removeItem(PROJECT_DETAIL_RETURN_TARGET_KEY);
  }

  return null;
}
