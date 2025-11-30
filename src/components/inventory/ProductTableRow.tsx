import type { FC } from "react";
import type { ProductViewModel } from "./types";
import QuantityInput from "./QuantityInput";
import ProductActions from "./ProductActions";
import type { UpdateProductCommand } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProductTableRowProps {
  product: ProductViewModel;
  onUpdateProduct: (id: string, payload: UpdateProductCommand) => Promise<void> | void;
  onDeleteProduct: (product: ProductViewModel) => void;
  onEditProduct: (product: ProductViewModel) => void;
}

const getStockStatus = (quantity: number, threshold: number) => {
  if (quantity === 0) {
    return { label: "Out of Stock", variant: "destructive" as const };
  }
  if (quantity <= threshold) {
    return {
      label: "Low Stock",
      variant: "warning" as const,
      className: "bg-amber-500 hover:bg-amber-600 border-transparent text-white",
    };
  }
  return null;
};

const ProductTableRow: FC<ProductTableRowProps> = ({ product, onUpdateProduct, onDeleteProduct, onEditProduct }) => {
  const isDeleting = product.ui_state === "deleting";
  const hasError = product.ui_state === "error";
  const status = getStockStatus(product.quantity, product.minimum_threshold);

  return (
    <TableRow className={cn(hasError && "border-destructive/60 bg-destructive/10", isDeleting && "opacity-50")}>
      <TableCell className="font-medium min-w-[120px]">
        <div className="flex flex-col gap-1">
          <span>{product.name}</span>
          {status && (
            <div className="flex">
              <Badge variant={status.variant} className={status.className}>
                {status.label}
              </Badge>
            </div>
          )}
          {hasError && <span className="text-xs text-destructive">Last update failed</span>}
        </div>
      </TableCell>
      <TableCell className="w-[180px]">
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
