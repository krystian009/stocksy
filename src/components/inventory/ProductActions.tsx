import type { FC } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProductViewModel } from "./types";

interface ProductActionsProps {
  product: ProductViewModel;
  onEdit: (product: ProductViewModel) => void;
  onDelete: (product: ProductViewModel) => void;
}

const ProductActions: FC<ProductActionsProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" size="icon" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="destructive" size="icon" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductActions;
