import type { FC } from "react";

import type { ProductViewModel } from "./types";
import QuantityInput from "./QuantityInput";
import ProductActions from "./ProductActions";
import type { UpdateProductCommand } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ProductTableRowProps {
  product: ProductViewModel;
  onUpdateProduct: (id: string, payload: UpdateProductCommand) => Promise<void> | void;
  onDeleteProduct: (product: ProductViewModel) => void;
  onEditProduct: (product: ProductViewModel) => void;
}

const ProductTableRow: FC<ProductTableRowProps> = ({ product, onUpdateProduct, onDeleteProduct, onEditProduct }) => {
  const isDeleting = product.ui_state === "deleting";
  const hasError = product.ui_state === "error";

  return (
    <TableRow className={cn(hasError && "border-destructive/60 bg-destructive/10", isDeleting && "opacity-50")}>
      <TableCell className="font-medium min-w-[120px]">
        <div className="flex flex-col">
          <span>{product.name}</span>
          {hasError && <span className="text-xs text-destructive">Last update failed</span>}
        </div>
      </TableCell>
      <TableCell className="w-[160px]">
        <QuantityInput product={product} onUpdate={onUpdateProduct} />
      </TableCell>
      <TableCell className="w-[140px] text-center">
        <span>{product.minimum_threshold}</span>
      </TableCell>
      <TableCell className="w-[120px] text-right">
        <ProductActions product={product} onEdit={onEditProduct} onDelete={onDeleteProduct} />
      </TableCell>
    </TableRow>
  );
};

export default ProductTableRow;
