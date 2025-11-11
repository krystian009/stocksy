import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShoppingListItemViewModel } from "./types";
import ShoppingQuantityInput from "./ShoppingQuantityInput";

interface ShoppingCardProps {
  item: ShoppingListItemViewModel;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void> | void;
  onCheckInItem: (id: string) => Promise<void> | void;
}

const ShoppingCard: FC<ShoppingCardProps> = ({ item, onUpdateQuantity, onCheckInItem }) => {
  const isDisabled = item.isUpdating || item.isCheckingIn;

  return (
    <div className={cn("rounded-lg border p-4 space-y-4", isDisabled && "opacity-50")}>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{item.product_name}</h3>
        {item.isUpdating && <p className="text-xs text-muted-foreground">Updating...</p>}
        {item.isCheckingIn && <p className="text-xs text-muted-foreground">Checking in...</p>}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Quantity to Purchase</span>
          <ShoppingQuantityInput item={item} onUpdate={onUpdateQuantity} />
        </div>
        <Button
          type="button"
          variant="default"
          className="w-full"
          onClick={() => onCheckInItem(item.id)}
          disabled={isDisabled}
          aria-label={`Check in ${item.product_name}`}
        >
          Check-in
        </Button>
      </div>
    </div>
  );
};

export default ShoppingCard;
