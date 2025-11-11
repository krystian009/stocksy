import { type FC } from "react";

import type { ShoppingListItemDTO } from "@/types";
import { useShoppingList } from "@/lib/hooks/useShoppingList";
import ShoppingListHeader from "./ShoppingListHeader";
import ShoppingListTable from "./ShoppingListTable";
import ShoppingCardList from "./ShoppingCardList";
import ShoppingListEmptyState from "./ShoppingListEmptyState";

interface ShoppingListViewProps {
  initialItems: ShoppingListItemDTO[];
}

const ShoppingListView: FC<ShoppingListViewProps> = ({ initialItems }) => {
  const {
    state: { items, error },
    actions: { updateItemQuantity, checkInItem, checkInAllItems },
    isInteractive,
  } = useShoppingList(initialItems);

  return (
    <div className="flex flex-col gap-6">
      <ShoppingListHeader onCheckInAll={checkInAllItems} isInteractive={isInteractive} itemCount={items.length} />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <ShoppingListEmptyState />
      ) : (
        <>
          <ShoppingListTable items={items} onUpdateQuantity={updateItemQuantity} onCheckInItem={checkInItem} />
          <ShoppingCardList items={items} onUpdateQuantity={updateItemQuantity} onCheckInItem={checkInItem} />
        </>
      )}
    </div>
  );
};

export default ShoppingListView;
