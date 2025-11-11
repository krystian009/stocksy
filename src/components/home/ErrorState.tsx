interface ErrorStateProps {
  error: Error;
}

/**
 * ErrorState Component
 *
 * Displays an error message when the dashboard fails to load data.
 * Provides a user-friendly error message with retry suggestion.
 */
export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex justify-center">
          <svg
            className="h-16 w-16 text-red-600 dark:text-red-500"
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-red-900 dark:text-red-100">Could not load low-stock items</h2>
        <p className="text-red-700 dark:text-red-300">
          {error.message || "An unexpected error occurred. Please try again later."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
