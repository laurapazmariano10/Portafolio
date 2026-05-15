export default function Loading() {
  return (
    <div
      suppressHydrationWarning
      className="premium-loader fixed inset-0 z-[900] grid place-items-center bg-black text-white"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div suppressHydrationWarning className="premium-loader__mark" data-label="ML" aria-hidden="true">ML</div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
