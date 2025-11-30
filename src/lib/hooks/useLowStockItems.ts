import { useEffect, useState } from "react";

import type { LowStockItemViewModel } from "@/components/home/types";
import { getShoppingList } from "@/lib/api/shopping-list";
import { getProducts } from "@/lib/api/products";

interface UseLowStockItemsState {
  items: LowStockItemViewModel[] | null;
  totalInventoryCount: number | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for fetching and managing low-stock items.
 *
 * Fetches the shopping list on component mount and manages loading, data, and error states.
 * Also fetches total inventory count to determine if the "First Run" experience should be shown.
 *
 * @returns An object containing items, totalInventoryCount, isLoading, and error states
 */
export function useLowStockItems() {
  const [state, setState] = useState<UseLowStockItemsState>({
    items: null,
    totalInventoryCount: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch both low stock items and a minimal product list to get total count
        const [shoppingListResponse, productsResponse] = await Promise.all([
          getShoppingList(),
          getProducts({ limit: 1 }), // We only need the meta.total_items
        ]);

        if (isMounted) {
          setState({
            items: shoppingListResponse.data,
            totalInventoryCount: productsResponse.meta.total_items,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          const err = error instanceof Error ? error : new Error("Failed to load dashboard data");

          // Check for 401 Unauthorized and redirect to login
          if (error instanceof Error && error.message.includes("401")) {
            window.location.href = "/login";
            return;
          }

          setState({
            items: null,
            totalInventoryCount: null,
            isLoading: false,
            error: err,
          });
        }
      }
    }

    fetchData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
