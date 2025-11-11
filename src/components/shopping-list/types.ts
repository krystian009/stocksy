import type { ShoppingListItemDTO } from "@/types";

/**
 * Shopping List Item ViewModel
 *
 * Extends the API's ShoppingListItemDTO to include flags for managing UI state
 * during asynchronous operations. This is essential for providing real-time
 * feedback to the user.
 */
export interface ShoppingListItemViewModel extends ShoppingListItemDTO {
  /** True if the item's quantity is being updated via an API call. */
  isUpdating?: boolean;
  /** True if the item is being checked-in via an API call. */
  isCheckingIn?: boolean;
}

/**
 * Shopping List ViewModel
 *
 * Represents the complete state of the shopping list view, including the list
 * of items and global loading/error states.
 */
export interface ShoppingListViewModel {
  /** The list of all shopping list items. */
  items: ShoppingListItemViewModel[];
  /** True during the initial fetch of the shopping list. */
  isLoading: boolean;
  /** True when the "Check-in All" action is in progress. */
  isCheckingInAll: boolean;
  /** Holds a global error message if an operation fails. */
  error?: string | null;
}
