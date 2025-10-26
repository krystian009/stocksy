import type { FC } from "react";

import { Button } from "@/components/ui/button";
import type { ProductViewModel } from "./types";

interface ProductActionsProps {
  product: ProductViewModel;
  onEdit: (product: ProductViewModel) => void;
  onDelete: (product: ProductViewModel) => void;
}

const ProductActions: FC<ProductActionsProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
        Edit
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete(product)}>
        Delete
      </Button>
    </div>
  );
};

export default ProductActions;
