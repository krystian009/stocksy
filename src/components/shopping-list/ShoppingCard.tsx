import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className={cn(isDisabled && "opacity-50")}>
      <CardHeader>
        <CardTitle className="text-lg">{item.product_name}</CardTitle>
        {item.isUpdating && <p className="text-xs text-muted-foreground">Updating...</p>}
        {item.isCheckingIn && <p className="text-xs text-muted-foreground">Checking in...</p>}
      </CardHeader>
      <CardContent className="space-y-3">
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
      </CardContent>
    </Card>
  );
};

export default ShoppingCard;
