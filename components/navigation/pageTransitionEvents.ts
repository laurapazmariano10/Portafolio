export const PAGE_TRANSITION_NAVIGATION_EVENT = 'page-transition-navigation';

export type PageTransitionNavigationDetail = {
  href: string;
  replace?: boolean;
  scroll?: boolean;
};

export function dispatchPageTransitionNavigation(detail: PageTransitionNavigationDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<PageTransitionNavigationDetail>(PAGE_TRANSITION_NAVIGATION_EVENT, { detail }));
}
