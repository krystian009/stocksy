import type { FC } from "react";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold min-w-[120px]">Name</TableHead>
              <TableHead className="w-[180px] text-center font-bold">Quantity</TableHead>
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
        <nav className="flex items-center justify-center gap-2" role="navigation" aria-label="Pagination Navigation">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md px-3 py-1 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md px-3 py-1 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default ProductTable;
