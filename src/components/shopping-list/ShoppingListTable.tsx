import type { FC } from "react";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ShoppingListItemViewModel } from "./types";
import ShoppingListTableRow from "./ShoppingListTableRow";

interface ShoppingListTableProps {
  items: ShoppingListItemViewModel[];
  onUpdateQuantity: (id: string, quantity: number) => Promise<void> | void;
  onCheckInItem: (id: string) => Promise<void> | void;
}

const ShoppingListTable: FC<ShoppingListTableProps> = ({ items, onUpdateQuantity, onCheckInItem }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold min-w-[200px]">Product</TableHead>
            <TableHead className="w-[200px] text-center font-bold">Quantity to Purchase</TableHead>
            <TableHead className="w-[140px] text-center font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <ShoppingListTableRow
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onCheckInItem={onCheckInItem}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShoppingListTable;
