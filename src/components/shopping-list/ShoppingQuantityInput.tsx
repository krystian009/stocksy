import { useCallback, useEffect, useRef, useState, type FC } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShoppingListItemViewModel } from "./types";

interface ShoppingQuantityInputProps {
  item: ShoppingListItemViewModel;
  onUpdate: (id: string, quantity: number) => Promise<void> | void;
}

const DEBOUNCE_MS = 500;

const ShoppingQuantityInput: FC<ShoppingQuantityInputProps> = ({ item, onUpdate }) => {
  const [value, setValue] = useState<string>(() => String(item.quantity_to_purchase));
  const debounceRef = useRef<number>();

  useEffect(() => {
    setValue(String(item.quantity_to_purchase));
  }, [item.quantity_to_purchase]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const commitUpdate = useCallback(
    async (nextValue: number) => {
      if (Number.isNaN(nextValue) || nextValue < 1) {
        return;
      }

      await onUpdate(item.id, nextValue);
    },
    [onUpdate, item.id]
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
      if (!Number.isNaN(parsed) && parsed >= 1) {
        void commitUpdate(parsed);
      }
    }, DEBOUNCE_MS);
  };

  const adjustQuantity = (delta: number) => {
    window.clearTimeout(debounceRef.current);
    const nextQuantity = Math.max(1, item.quantity_to_purchase + delta);
    setValue(String(nextQuantity));
    void commitUpdate(nextQuantity);
  };

  const isDisabled = item.isUpdating || item.isCheckingIn;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => adjustQuantity(-1)}
        disabled={isDisabled || item.quantity_to_purchase <= 1}
        aria-label="Decrease quantity"
      >
        -
      </Button>
      <Input
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        disabled={isDisabled}
        className="w-[60px] text-center"
        aria-label={`Quantity to purchase for ${item.product_name}`}
        min={1}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => adjustQuantity(1)}
        disabled={isDisabled}
        aria-label="Increase quantity"
      >
        +
      </Button>
    </div>
  );
};

export default ShoppingQuantityInput;
