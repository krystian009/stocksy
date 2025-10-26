import type { FC } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductViewModel } from "./types";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  product?: ProductViewModel;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const DeleteConfirmationDialog: FC<DeleteConfirmationDialogProps> = ({ isOpen, product, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            {product
              ? `Are you sure you want to delete ${product.name}? This action cannot be undone.`
              : "Are you sure you want to delete this product?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
