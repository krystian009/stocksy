import { useState, type FC } from "react";
import type { ProductsListQueryParams } from "@/types";
import { useInventory } from "@/lib/hooks/useInventory";
import InventoryHeader from "./InventoryHeader";
import ProductTable from "./ProductTable";
import ProductTableSkeleton from "./ProductTableSkeleton";
import ProductFormDialog from "./ProductFormDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import type { ProductFormValues, ProductViewModel } from "./types";

const InventoryView: FC = () => {
  const {
    state: { products, meta, isLoading, error, query },
    actions: { setPage, setSort, addProduct, updateProduct, deleteProduct, refetch },
  } = useInventory();

  const [dialogState, setDialogState] = useState<{
    mode: "create" | "edit" | null;
    product: ProductViewModel | null;
  }>({ mode: null, product: null });

  const [deleteState, setDeleteState] = useState<ProductViewModel | null>(null);

  const handleAddProductClick = () => {
    setDialogState({ mode: "create", product: null });
  };

  const handleEditProduct = (product: ProductViewModel) => {
    setDialogState({ mode: "edit", product });
  };

  const handleDialogClose = () => {
    setDialogState({ mode: null, product: null });
  };

  const handleDeleteRequest = (product: ProductViewModel) => {
    setDeleteState(product);
  };

  const handleDeleteCancel = () => {
    setDeleteState(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState) {
      return;
    }

    try {
      await deleteProduct(deleteState);
      setDeleteState(null);
    } catch {
      // errors are surfaced via useInventory toasts
    }
  };

  const handleSortChange = (sort: ProductsListQueryParams["sort"], order: ProductsListQueryParams["order"]) => {
    if (!sort || !order) {
      return;
    }

    setSort(sort, order);
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    try {
      if (dialogState.mode === "edit" && dialogState.product) {
        await updateProduct(dialogState.product.id, values);
      } else {
        await addProduct(values);
      }

      handleDialogClose();
    } catch {
      // errors are surfaced via useInventory toasts
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <InventoryHeader
        sort={query.sort}
        order={query.order}
        onSortChange={handleSortChange}
        onAddProduct={handleAddProductClick}
        onRefresh={refetch}
      />

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {isLoading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          products={products}
          meta={meta}
          onUpdateProduct={updateProduct}
          onDeleteProduct={handleDeleteRequest}
          onEditProduct={handleEditProduct}
          onPageChange={setPage}
          onAddProduct={handleAddProductClick}
        />
      )}

      <ProductFormDialog
        isOpen={dialogState.mode !== null}
        onClose={handleDialogClose}
        onSubmit={handleFormSubmit}
        product={dialogState.product ?? undefined}
      />

      <DeleteConfirmationDialog
        product={deleteState ?? undefined}
        isOpen={deleteState !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default InventoryView;
