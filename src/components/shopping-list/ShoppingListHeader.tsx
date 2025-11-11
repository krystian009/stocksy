import type { FC } from "react";

import { Button } from "@/components/ui/button";

interface ShoppingListHeaderProps {
  onCheckInAll: () => void;
  isInteractive: boolean;
  itemCount: number;
}

const ShoppingListHeader: FC<ShoppingListHeaderProps> = ({ onCheckInAll, isInteractive, itemCount }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Shopping List</h1>
        <p className="text-sm text-muted-foreground">
          {itemCount === 0
            ? "No items need restocking."
            : `${itemCount} ${itemCount === 1 ? "item" : "items"} ${itemCount === 1 ? "needs" : "need"} to be purchased.`}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          onClick={onCheckInAll}
          disabled={!isInteractive || itemCount === 0}
          className="whitespace-nowrap"
          aria-label="Check in all items"
        >
          Check-in All
        </Button>
      </div>
    </div>
  );
};

export default ShoppingListHeader;
