import { Button } from "@/components/ui/button";

/**
 * EmptyState Component
 *
 * Displays a positive, reassuring message when the user has no low-stock items.
 * This indicates that all products in the inventory are adequately stocked.
 */
export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-green-600 dark:text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">All items are well-stocked!</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Great job! You don&apos;t have any products running low. Your inventory is in good shape.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Keep the momentum going by reviewing your inventory or adding the staples you buy most often.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" size="lg">
            <a href="/inventory" aria-label="Go to your full inventory list">
              View inventory
            </a>
          </Button>
          <Button asChild size="lg">
            <a href="/inventory?intent=add" aria-label="Add a new product to your inventory">
              Add product
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
