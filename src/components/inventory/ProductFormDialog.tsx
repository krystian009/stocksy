import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFormValues, ProductViewModel } from "./types";
import { createProductSchema } from "@/lib/schemas/product.schema";

const formSchema = z.object({
  name: createProductSchema.shape.name,
  quantity: createProductSchema.shape.quantity,
  minimum_threshold: createProductSchema.shape.minimum_threshold,
});

interface ProductFormDialogProps {
  isOpen: boolean;
  product?: ProductViewModel;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
}

const ProductFormDialog: FC<ProductFormDialogProps> = ({ isOpen, product, onClose, onSubmit }) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      minimum_threshold: 1,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        quantity: product.quantity,
        minimum_threshold: product.minimum_threshold,
      });
      return;
    }

    if (isOpen) {
      form.reset({ name: "", quantity: 0, minimum_threshold: 1 });
    }
  }, [form, product, isOpen]);

  const submitForm = async (values: ProductFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details and quantities." : "Create a new product in your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(submitForm)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Pasta sauce"
              {...form.register("name")}
              data-invalid={Boolean(form.formState.errors.name)}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                {...form.register("quantity", { valueAsNumber: true })}
                data-invalid={Boolean(form.formState.errors.quantity)}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimum_threshold">Minimum threshold</Label>
              <Input
                id="minimum_threshold"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                {...form.register("minimum_threshold", { valueAsNumber: true })}
                data-invalid={Boolean(form.formState.errors.minimum_threshold)}
              />
              {form.formState.errors.minimum_threshold && (
                <p className="text-sm text-destructive">{form.formState.errors.minimum_threshold.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {product ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
