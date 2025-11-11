import type { FC } from "react";

import type { ShoppingListItemViewModel } from "./types";
import ShoppingCard from "./ShoppingCard";

interface ShoppingCardListProps {
  items: ShoppingListItemViewModel[];
  onUpdateQuantity: (id: string, quantity: number) => Promise<void> | void;
  onCheckInItem: (id: string) => Promise<void> | void;
}

const ShoppingCardList: FC<ShoppingCardListProps> = ({ items, onUpdateQuantity, onCheckInItem }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden space-y-4">
      {items.map((item) => (
        <ShoppingCard key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onCheckInItem={onCheckInItem} />
      ))}
    </div>
  );
};

export default ShoppingCardList;
