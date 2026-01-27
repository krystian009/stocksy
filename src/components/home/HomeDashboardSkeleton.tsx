import { memo } from "react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

/**
 * HomeDashboardSkeleton Component
 *
 * Displays a minimal, generic loading state for the home dashboard while data is being fetched.
 * Uses a simple spinner and loading message to indicate that content is loading.
 * This approach prioritizes simplicity and maintainability over exact layout matching.
 */
export const HomeDashboardSkeleton = memo(function HomeDashboardSkeleton() {
  return <LoadingIndicator message="Loading dashboard..." />;
});
