export const PROJECT_COVER_INTERNAL_ZOOM = 0.92;
export const PROJECT_CARD_IMAGE_SCALE = 1 / PROJECT_COVER_INTERNAL_ZOOM;
export const PROJECT_CARD_BORDER_RADIUS = 28;

export const PROJECT_ROUTE_TRANSITION_EVENT = 'project-route-transition';
export const PROJECT_RETURN_SCROLL_GUARD_KEY = 'project-return-scroll-guard';
export const PROJECT_TRANSITION_DEBUG = false;

export function projectTransitionLog(label: string, payload?: unknown) {
  if (!PROJECT_TRANSITION_DEBUG || typeof window === 'undefined') return;

  const timestamp = Math.round(performance.now());
  if (payload === undefined) {
    console.info(`[project-transition ${timestamp}ms] ${label}`);
    return;
  }

  console.info(`[project-transition ${timestamp}ms] ${label}`, payload);
}
