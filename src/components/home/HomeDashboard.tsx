import { useMemo } from "react";

import { useLowStockItems } from "@/lib/hooks/useLowStockItems";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { HomeDashboardSkeleton } from "./HomeDashboardSkeleton";
import { LowStockList } from "./LowStockList";
import { FirstRunWizard } from "./FirstRunWizard";

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
 * - First Run: Displays FirstRunWizard if total inventory is empty
 * - Empty Low Stock: Displays EmptyState if inventory exists but no items are low stock
 * - Success: Displays LowStockList with sorted and limited items (max 8)
 *
 * Business Logic:
 * - Items are sorted by quantity_to_purchase in descending order (most urgent first)
 * - Only the top 8 items are displayed on the home page
 * - Total count is passed to LowStockList for summary display
 */
export function HomeDashboard() {
  const { items, totalInventoryCount, isLoading, error } = useLowStockItems();

  // Sort items by quantity_to_purchase (descending) and limit to top 8
  // Use useMemo to avoid recomputation on every render
  const sortedAndLimitedItems = useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }

    // Sort by quantity_to_purchase in descending order (most urgent first)
    const sorted = [...items].sort((a, b) => b.quantity_to_purchase - a.quantity_to_purchase);

    // Limit to top 8 most urgent items
    return sorted.slice(0, 8);
  }, [items]);

  // Loading state: show skeleton
  if (isLoading) {
    return <HomeDashboardSkeleton />;
  }

  // Error state: show error message
  if (error) {
    return <ErrorState error={error} />;
  }

  // First Run state: Total inventory is empty
  if (totalInventoryCount === 0) {
    return <FirstRunWizard />;
  }

  // Empty Low Stock state: Inventory exists, but no low-stock items
  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  // Success state: show list of low-stock items with summary and CTA
  return <LowStockList items={sortedAndLimitedItems} totalCount={items.length} />;
}
