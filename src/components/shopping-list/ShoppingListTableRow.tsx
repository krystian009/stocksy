import type { FC } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShoppingListItemViewModel } from "./types";
import ShoppingQuantityInput from "./ShoppingQuantityInput";

interface ShoppingListTableRowProps {
  item: ShoppingListItemViewModel;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void> | void;
  onCheckInItem: (id: string) => Promise<void> | void;
}

const ShoppingListTableRow: FC<ShoppingListTableRowProps> = ({ item, onUpdateQuantity, onCheckInItem }) => {
  const isDisabled = item.isUpdating || item.isCheckingIn;

  return (
    <TableRow className={cn(isDisabled && "opacity-50")}>
      <TableCell className="font-medium min-w-[200px]">
        <div className="flex flex-col">
          <span>{item.product_name}</span>
          {item.isUpdating && <span className="text-xs text-muted-foreground">Updating...</span>}
          {item.isCheckingIn && <span className="text-xs text-muted-foreground">Checking in...</span>}
        </div>
      </TableCell>
      <TableCell className="w-[200px]">
        <ShoppingQuantityInput item={item} onUpdate={onUpdateQuantity} />
      </TableCell>
      <TableCell className="w-[140px] text-center">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => onCheckInItem(item.id)}
          disabled={isDisabled}
          aria-label={`Check in ${item.product_name}`}
        >
          Check-in
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ShoppingListTableRow;
