import type { FC } from "react";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { PaginationMetaDTO, UpdateProductCommand } from "@/types";
import ProductTableRow from "./ProductTableRow";
import type { ProductViewModel } from "./types";
import EmptyState from "./EmptyState";

interface ProductTableProps {
  products: ProductViewModel[];
  meta: PaginationMetaDTO | null;
  onUpdateProduct: (id: string, payload: UpdateProductCommand) => Promise<void> | void;
  onDeleteProduct: (product: ProductViewModel) => void;
  onEditProduct: (product: ProductViewModel) => void;
  onPageChange: (page: number) => void;
  onAddProduct: () => void;
}

const ProductTable: FC<ProductTableProps> = ({
  products,
  meta,
  onUpdateProduct,
  onDeleteProduct,
  onEditProduct,
  onPageChange,
  onAddProduct,
}) => {
  if (!products.length) {
    return <EmptyState onAddProduct={onAddProduct} />;
  }

  const totalPages = meta?.total_pages ?? 1;
  const currentPage = meta?.current_page ?? 1;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center font-bold">Name</TableHead>
              <TableHead className="w-[160px] text-center font-bold">Quantity</TableHead>
              <TableHead className="w-[140px] text-center font-bold">Minimum threshold</TableHead>
              <TableHead className="w-[120px] text-center font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <ProductTableRow
                key={product.id}
                product={product}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
                onEditProduct={onEditProduct}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default ProductTable;
