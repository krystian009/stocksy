import { useCallback, useReducer } from "react";

import type { ShoppingListItemDTO } from "@/types";
import type { ShoppingListItemViewModel, ShoppingListViewModel } from "@/components/shopping-list/types";
import {
  checkInAllShoppingListItems as checkInAllShoppingListItemsRequest,
  checkInShoppingListItem as checkInShoppingListItemRequest,
  updateShoppingListItem as updateShoppingListItemRequest,
} from "@/lib/api/shopping-list";
import { toast } from "sonner";

interface ShoppingListState {
  items: ShoppingListItemViewModel[];
  isCheckingInAll: boolean;
  error: string | null;
}

type ShoppingListAction =
  | { type: "SET_ITEMS"; payload: { items: ShoppingListItemViewModel[] } }
  | { type: "UPDATE_ITEM"; payload: { item: ShoppingListItemViewModel } }
  | { type: "REMOVE_ITEM"; payload: { id: string } }
  | { type: "SET_CHECKING_IN_ALL"; payload: { isCheckingInAll: boolean } }
  | { type: "SET_ERROR"; payload: { error: string | null } }
  | { type: "REMOVE_ALL_ITEMS" };

function reducer(state: ShoppingListState, action: ShoppingListAction): ShoppingListState {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload.items };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.item.id ? action.payload.item : item)),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.id),
      };
    case "SET_CHECKING_IN_ALL":
      return { ...state, isCheckingInAll: action.payload.isCheckingInAll };
    case "SET_ERROR":
      return { ...state, error: action.payload.error };
    case "REMOVE_ALL_ITEMS":
      return { ...state, items: [] };
    default:
      return state;
  }
}

function mapToViewModel(item: ShoppingListItemDTO): ShoppingListItemViewModel {
  return {
    ...item,
    isUpdating: false,
    isCheckingIn: false,
  };
}

export function useShoppingList(initialItems: ShoppingListItemDTO[]) {
  const [state, dispatch] = useReducer(reducer, {
    items: initialItems.map(mapToViewModel),
    isCheckingInAll: false,
    error: null,
  });

  const updateItemQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity < 1) {
        toast.error("Quantity must be at least 1");
        return;
      }

      const previousItem = state.items.find((item) => item.id === id);

      if (!previousItem) {
        toast.error("Item not found");
        return;
      }

      // Optimistic update: mark as updating
      const optimisticItem: ShoppingListItemViewModel = {
        ...previousItem,
        quantity_to_purchase: quantity,
        isUpdating: true,
      };

      dispatch({ type: "UPDATE_ITEM", payload: { item: optimisticItem } });

      try {
        const updatedItem = await updateShoppingListItemRequest(id, {
          quantity_to_purchase: quantity,
        });

        const viewModel: ShoppingListItemViewModel = {
          ...mapToViewModel(updatedItem),
          isUpdating: false,
        };

        dispatch({ type: "UPDATE_ITEM", payload: { item: viewModel } });
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to update quantity");
        toast.error(err.message);

        // Revert to previous state
        const revertedItem: ShoppingListItemViewModel = {
          ...previousItem,
          isUpdating: false,
        };

        dispatch({ type: "UPDATE_ITEM", payload: { item: revertedItem } });
      }
    },
    [state.items]
  );

  const checkInItem = useCallback(
    async (id: string) => {
      const previousItem = state.items.find((item) => item.id === id);

      if (!previousItem) {
        toast.error("Item not found");
        return;
      }

      // Optimistic update: mark as checking in
      const optimisticItem: ShoppingListItemViewModel = {
        ...previousItem,
        isCheckingIn: true,
      };

      dispatch({ type: "UPDATE_ITEM", payload: { item: optimisticItem } });

      try {
        await checkInShoppingListItemRequest(id);

        // Optimistically remove the item
        dispatch({ type: "REMOVE_ITEM", payload: { id } });
        toast.success(`${previousItem.product_name} checked in successfully`);
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to check in item");
        toast.error(err.message);

        // Revert to previous state
        const revertedItem: ShoppingListItemViewModel = {
          ...previousItem,
          isCheckingIn: false,
        };

        dispatch({ type: "UPDATE_ITEM", payload: { item: revertedItem } });
      }
    },
    [state.items]
  );

  const checkInAllItems = useCallback(async () => {
    if (state.items.length === 0) {
      toast.error("Shopping list is empty");
      return;
    }

    const previousItems = [...state.items];

    // Optimistic update: remove all items and set checking in all flag
    dispatch({ type: "SET_CHECKING_IN_ALL", payload: { isCheckingInAll: true } });
    dispatch({ type: "REMOVE_ALL_ITEMS" });

    try {
      await checkInAllShoppingListItemsRequest();
      toast.success("All items checked in successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to check in all items");
      toast.error(err.message);

      // Revert to previous state
      dispatch({ type: "SET_ITEMS", payload: { items: previousItems } });
      dispatch({ type: "SET_CHECKING_IN_ALL", payload: { isCheckingInAll: false } });
    } finally {
      dispatch({ type: "SET_CHECKING_IN_ALL", payload: { isCheckingInAll: false } });
    }
  }, [state.items]);

  const viewModel: ShoppingListViewModel = {
    items: state.items,
    isLoading: false, // Initial load is done server-side
    isCheckingInAll: state.isCheckingInAll,
    error: state.error,
  };

  // Check if any item is currently being updated or checked in
  const isInteractive = !state.isCheckingInAll && !state.items.some((item) => item.isUpdating || item.isCheckingIn);

  return {
    state: viewModel,
    actions: {
      updateItemQuantity,
      checkInItem,
      checkInAllItems,
    },
    isInteractive,
  };
}
