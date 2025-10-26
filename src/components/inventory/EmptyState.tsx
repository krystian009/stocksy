import type { FC } from "react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddProduct: () => void;
}

const EmptyState: FC<EmptyStateProps> = ({ onAddProduct }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">No products yet</h2>
        <p className="text-sm text-muted-foreground">
          Start by adding your first product to keep track of what’s in your inventory.
        </p>
      </div>
      <Button onClick={onAddProduct}>Add your first product</Button>
    </div>
  );
};

export default EmptyState;
