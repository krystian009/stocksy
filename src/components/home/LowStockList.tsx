import { LowStockItemCard } from "./LowStockItemCard";
import type { LowStockItemViewModel } from "./types";

interface LowStockListProps {
  items: LowStockItemViewModel[];
}

/**
 * LowStockList Component
 *
 * A presentational component that receives a list of low-stock items
 * and renders them using the LowStockItemCard component for each item.
 * Uses a responsive grid layout that adapts to different screen sizes.
 */
export function LowStockList({ items }: LowStockListProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Low Stock Items</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <LowStockItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
