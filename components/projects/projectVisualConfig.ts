import type { Project, ProjectImage } from '@/components/projects/projectsData';

type ProjectVisualConfig = {
  depthStrength: number;
  detailFrameClassName?: (image: ProjectImage) => string | null;
};

const DEFAULT_DEPTH_STRENGTH = 0.035;

const PROJECT_VISUAL_CONFIG: Partial<Record<Project['slug'], ProjectVisualConfig>> = {
  pms: {
    depthStrength: 0.014,
  },
  pisky: {
    depthStrength: 0.007,
  },
  'zygo-app': {
    depthStrength: 0.003,
  },
  'zygo-web': {
    depthStrength: DEFAULT_DEPTH_STRENGTH,
    detailFrameClassName: (image) => (
      image.src.includes('/1.1W.webp') ? 'aspect-[3/4]' : null
    ),
  },
};

export function getProjectDepthStrength(project: Project) {
  return PROJECT_VISUAL_CONFIG[project.slug]?.depthStrength ?? DEFAULT_DEPTH_STRENGTH;
}

export function getProjectDetailFrameClassName(project: Project, image: ProjectImage) {
  const configuredClassName = PROJECT_VISUAL_CONFIG[project.slug]?.detailFrameClassName?.(image);
  if (configuredClassName) return configuredClassName;

  return image.variant === 'tall' ? 'aspect-[9/16]' : 'aspect-video';
}
