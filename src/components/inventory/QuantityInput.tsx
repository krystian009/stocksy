import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { Plus, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UpdateProductCommand } from "@/types";
import type { ProductViewModel } from "./types";

interface QuantityInputProps {
  product: ProductViewModel;
  onUpdate: (id: string, payload: UpdateProductCommand) => Promise<void> | void;
}

const DEBOUNCE_MS = 500;

const QuantityInput: FC<QuantityInputProps> = ({ product, onUpdate }) => {
  const [value, setValue] = useState<string>(() => String(product.quantity));
  const debounceRef = useRef<number>();

  useEffect(() => {
    setValue(String(product.quantity));
  }, [product.quantity]);

  const commitUpdate = useCallback(
    async (nextValue: number) => {
      if (Number.isNaN(nextValue) || nextValue < 0) {
        return;
      }

      await onUpdate(product.id, { quantity: nextValue });
    },
    [onUpdate, product.id]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    if (!/^\d*$/.test(raw)) {
      return;
    }

    setValue(raw);

    window.clearTimeout(debounceRef.current);

    const parsed = Number.parseInt(raw, 10);

    debounceRef.current = window.setTimeout(() => {
      if (!Number.isNaN(parsed)) {
        void commitUpdate(parsed);
      }
    }, DEBOUNCE_MS);
  };

  const adjustQuantity = (delta: number) => {
    window.clearTimeout(debounceRef.current);
    const nextQuantity = Math.max(0, product.quantity + delta);
    setValue(String(nextQuantity));
    void commitUpdate(nextQuantity);
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => adjustQuantity(-1)}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        className="mx-1 w-[60px] text-center h-8"
        aria-label={`Quantity for ${product.name}`}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => adjustQuantity(1)}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default QuantityInput;
