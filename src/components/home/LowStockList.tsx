import { Button } from "@/components/ui/button";
import { LowStockItemCard } from "./LowStockItemCard";
import { SummaryCard } from "./SummaryCard";
import type { LowStockItemViewModel } from "./types";

interface LowStockListProps {
  items: LowStockItemViewModel[];
  totalCount: number;
}

/**
 * LowStockList Component
 *
 * A presentational component that receives a list of low-stock items
 * and renders them using the LowStockItemCard component for each item.
 * Displays a summary card, limited items (max 8), and a CTA button to view
 * the complete shopping list.
 * Uses a responsive grid layout that adapts to different screen sizes.
 */
export function LowStockList({ items, totalCount }: LowStockListProps) {
  const remainingCount = totalCount - items.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Low Stock Items</h1>

      {/* Summary card showing total count */}
      <SummaryCard totalCount={totalCount} />

      {/* Grid of low-stock item cards (limited to 8 items) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <LowStockItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Show remaining count if more than 8 items */}
      {remainingCount > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          and {remainingCount} more {remainingCount === 1 ? "item" : "items"} need restocking
        </p>
      )}

      {/* CTA buttons to view inventory and shopping list */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          asChild
          variant="outline"
          size="lg"
          aria-label="Go to your full inventory list"
          className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <a href="/inventory">View inventory</a>
        </Button>
        <Button
          asChild
          variant="default"
          size="lg"
          aria-label={`View complete shopping list with ${totalCount} ${totalCount === 1 ? "item" : "items"}`}
          className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <a href="/shopping-list">View Shopping List</a>
        </Button>
      </div>
    </div>
  );
}
