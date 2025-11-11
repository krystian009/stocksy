import type { FC } from "react";

interface ShoppingListEmptyStateProps {
  title?: string;
  message?: string;
}

const ShoppingListEmptyState: FC<ShoppingListEmptyStateProps> = ({
  title = "Your shopping list is empty",
  message = "All your items are well-stocked!",
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default ShoppingListEmptyState;
