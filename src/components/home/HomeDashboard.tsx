import { useLowStockItems } from "@/lib/hooks/useLowStockItems";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { HomeDashboardSkeleton } from "./HomeDashboardSkeleton";
import { LowStockList } from "./LowStockList";

/**
 * HomeDashboard Component
 *
 * The main React container for the home page dashboard.
 * Responsible for fetching low-stock items, managing loading, error, and empty states,
 * and conditionally rendering the appropriate child components based on the current state.
 *
 * State Management:
 * - Loading: Displays HomeDashboardSkeleton while data is being fetched
 * - Error: Displays ErrorState if the API call fails
 * - Empty: Displays EmptyState if no low-stock items exist
 * - Success: Displays LowStockList with the fetched items
 */
export function HomeDashboard() {
  const { items, isLoading, error } = useLowStockItems();

  // Loading state: show skeleton
  if (isLoading) {
    return <HomeDashboardSkeleton />;
  }

  // Error state: show error message
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state: no low-stock items
  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  // Success state: show list of low-stock items
  return <LowStockList items={items} />;
}
