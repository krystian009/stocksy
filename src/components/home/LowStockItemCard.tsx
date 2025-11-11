import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LowStockItemViewModel } from "./types";

interface LowStockItemCardProps {
  item: LowStockItemViewModel;
}

/**
 * LowStockItemCard Component
 *
 * Displays the details of a single low-stock item within a card.
 * Shows the product name and the quantity that needs to be purchased.
 */
export function LowStockItemCard({ item }: LowStockItemCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{item.product_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Quantity to purchase:</span>
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {item.quantity_to_purchase}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
