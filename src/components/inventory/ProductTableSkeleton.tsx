import type { FC } from "react";

const skeletonRows = Array.from({ length: 5 });

const ProductTableSkeleton: FC = () => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2 p-4">
        <div className="grid grid-cols-[2fr,1fr,1fr,auto] gap-4 text-sm text-muted-foreground">
          <span>Name</span>
          <span>Quantity</span>
          <span>Minimum threshold</span>
          <span>Actions</span>
        </div>
        <div className="space-y-3">
          {skeletonRows.map((_, index) => (
            <div key={index} className="grid grid-cols-[2fr,1fr,1fr,auto] items-center gap-4 rounded-md border p-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                <div className="h-8 w-8 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductTableSkeleton;
