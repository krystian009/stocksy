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
    <Card className="gap-2" aria-label={`Low stock item: ${item.product_name}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">{item.product_name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Quantity to purchase:</span>
          <span className="text-lg font-semibold text-foreground">
            {item.quantity_to_purchase}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
