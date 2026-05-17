// PageTransitionLoader (z-950) handles all SPA transition visuals.
// LoadingScreen.tsx (z-9999) handles the initial hard-load overlay.
// This Suspense fallback must be null to avoid a z-900 black flash
// after PageTransitionLoader reveals when links are not prefetched.
export default function Loading() {
  return null;
}
