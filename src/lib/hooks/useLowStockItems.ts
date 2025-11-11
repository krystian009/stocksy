import { useEffect, useState } from "react";

import type { LowStockItemViewModel } from "@/components/home/types";
import { getShoppingList } from "@/lib/api/shopping-list";

interface UseLowStockItemsState {
  items: LowStockItemViewModel[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for fetching and managing low-stock items.
 *
 * Fetches the shopping list on component mount and manages loading, data, and error states.
 * The shopping list endpoint returns items that are below their minimum threshold,
 * which are the low-stock items we want to display on the home dashboard.
 *
 * @returns An object containing items, isLoading, and error states
 */
export function useLowStockItems() {
  const [state, setState] = useState<UseLowStockItemsState>({
    items: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchLowStockItems() {
      try {
        const response = await getShoppingList();

        if (isMounted) {
          setState({
            items: response.data,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          const err = error instanceof Error ? error : new Error("Failed to load low-stock items");

          // Check for 401 Unauthorized and redirect to login
          if (error instanceof Error && error.message.includes("401")) {
            window.location.href = "/login";
            return;
          }

          setState({
            items: null,
            isLoading: false,
            error: err,
          });
        }
      }
    }

    fetchLowStockItems();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
