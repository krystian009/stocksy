import type { ShoppingListItemDTO, ShoppingListResponseDTO, UpdateShoppingListItemCommand } from "@/types";

const SHOPPING_LIST_BASE_PATH = "/api/v1/shopping-list";

async function parseError(response: Response): Promise<Error> {
  let message = `Request failed with status ${response.status}`;
  let details: string | undefined;

  try {
    const data = (await response.json()) as { message?: string; errors?: string[] };
    if (data.message) {
      message = data.message;
    }

    if (data.errors?.length) {
      details = data.errors.join(", ");
    }
  } catch (error) {
    if (error instanceof Error) {
      details = error.message;
    }
  }

  if (details) {
    message = `${message}: ${details}`;
  }

  return new Error(message);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json()) as T;
    return data;
  }

  throw await parseError(response);
}

/**
 * Fetches all shopping list items for the authenticated user.
 *
 * @returns Promise resolving to ShoppingListResponseDTO
 */
export async function getShoppingList(): Promise<ShoppingListResponseDTO> {
  const response = await fetch(SHOPPING_LIST_BASE_PATH, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse<ShoppingListResponseDTO>(response);
}

/**
 * Updates the quantity to purchase for a specific shopping list item.
 *
 * @param id - The UUID of the shopping list item to update
 * @param command - The update command containing the new quantity_to_purchase
 * @returns Promise resolving to the updated ShoppingListItemDTO
 */
export async function updateShoppingListItem(
  id: string,
  command: UpdateShoppingListItemCommand
): Promise<ShoppingListItemDTO> {
  if (!id) {
    throw new Error("Item ID is required to update a shopping list item");
  }

  const response = await fetch(`${SHOPPING_LIST_BASE_PATH}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(command),
  });

  return handleResponse<ShoppingListItemDTO>(response);
}

/**
 * Checks in a shopping list item by incrementing the associated product's quantity
 * and removing the item from the shopping list.
 *
 * @param id - The UUID of the shopping list item to check in
 * @returns Promise resolving to void (204 No Content)
 */
export async function checkInShoppingListItem(id: string): Promise<void> {
  if (!id) {
    throw new Error("Item ID is required to check in a shopping list item");
  }

  const response = await fetch(`${SHOPPING_LIST_BASE_PATH}/${id}/check-in`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  await handleResponse<undefined>(response);
}

/**
 * Checks in all shopping list items by incrementing the associated products' quantities
 * and clearing the shopping list.
 *
 * @returns Promise resolving to void (204 No Content)
 */
export async function checkInAllShoppingListItems(): Promise<void> {
  const response = await fetch(`${SHOPPING_LIST_BASE_PATH}/check-in`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  await handleResponse<undefined>(response);
}
