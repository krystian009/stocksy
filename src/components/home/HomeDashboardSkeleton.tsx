/**
 * HomeDashboardSkeleton Component
 *
 * Displays a loading state for the home dashboard while data is being fetched.
 * Renders skeleton cards that visually mimic the final layout to prevent
 * layout shifts and provide a smooth loading experience.
 */
export function HomeDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="space-y-3">
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
