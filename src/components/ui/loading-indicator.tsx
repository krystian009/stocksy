import { memo } from "react";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

/**
 * LoadingIndicator Component
 *
 * A minimal, generic loading indicator that displays a spinner and optional message.
 * Can be used across the application for consistent loading states.
 */
export const LoadingIndicator = memo(function LoadingIndicator({
  message = "Loading...",
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      className={`flex min-h-[400px] items-center justify-center ${className || ""}`}
      aria-label="Loading content"
      aria-live="polite"
    >
      <div className="text-center space-y-4">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-neutral-300 border-r-transparent dark:border-neutral-700 dark:border-r-transparent"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
});
