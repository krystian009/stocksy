import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductsListQueryParams } from "@/types";

interface InventoryHeaderProps {
  sort: ProductsListQueryParams["sort"];
  order: ProductsListQueryParams["order"];
  onSortChange: (sort: ProductsListQueryParams["sort"], order: ProductsListQueryParams["order"]) => void;
  onAddProduct: () => void;
  onRefresh: () => void;
}

const sortOptions: {
  label: string;
  value: ProductsListQueryParams["sort"];
  orders: { label: string; value: ProductsListQueryParams["order"] }[];
}[] = [
  {
    label: "Name",
    value: "name",
    orders: [
      { label: "A to Z", value: "asc" },
      { label: "Z to A", value: "desc" },
    ],
  },
  {
    label: "Quantity",
    value: "quantity",
    orders: [
      { label: "Low to High", value: "asc" },
      { label: "High to Low", value: "desc" },
    ],
  },
];

const InventoryHeader: FC<InventoryHeaderProps> = ({ sort, order, onSortChange, onAddProduct, onRefresh }) => {
  const handleSortFieldChange = (value: string) => {
    const nextSort = value as ProductsListQueryParams["sort"];
    if (!nextSort) return;

    const isSameField = nextSort === sort;
    const nextOrder = isSameField ? (order === "asc" ? "desc" : "asc") : "asc";
    onSortChange(nextSort, nextOrder);
  };

  const handleOrderChange = (value: string) => {
    const nextOrder = value as ProductsListQueryParams["order"];
    if (!nextOrder || !sort) return;
    onSortChange(sort, nextOrder);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <Button variant="ghost" size="sm" onClick={onRefresh} aria-label="Refresh inventory">
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage quantities, thresholds, and availability for your products.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-nowrap sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by</span>
          <Select value={sort ?? ""} onValueChange={handleSortFieldChange}>
            <SelectTrigger className="w-full min-w-[140px] sm:w-[160px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value ?? ""}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={order ?? ""} onValueChange={handleOrderChange}>
            <SelectTrigger className="w-full min-w-[120px] sm:w-[140px]">
              <SelectValue placeholder="Select order" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions
                .find((option) => option.value === sort)
                ?.orders.map((orderOption) => (
                  <SelectItem key={orderOption.value} value={orderOption.value ?? ""}>
                    {orderOption.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddProduct} className="whitespace-nowrap self-end sm:ml-4 sm:self-auto">
          Add Product
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
