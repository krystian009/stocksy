import { describe, it, expect } from "vitest";
import { updateShoppingListItemSchema } from "@/lib/schemas/shopping-list.schema";

describe("shopping-list.schema", () => {
  describe("updateShoppingListItemSchema", () => {
    describe("valid inputs", () => {
      it("should validate quantity_to_purchase of 1", () => {
        const input = {
          quantity_to_purchase: 1,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.quantity_to_purchase).toBe(1);
        }
      });

      it("should validate small positive integer values", () => {
        const input = {
          quantity_to_purchase: 5,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.quantity_to_purchase).toBe(5);
        }
      });

      it("should validate large positive integer values", () => {
        const input = {
          quantity_to_purchase: 10000,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.quantity_to_purchase).toBe(10000);
        }
      });

      it("should validate very large positive integer values", () => {
        const input = {
          quantity_to_purchase: 1000000,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept integer values", () => {
        const input = {
          quantity_to_purchase: 42,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data.quantity_to_purchase).toBe("number");
        }
      });
    });

    describe("invalid inputs", () => {
      it("should reject missing quantity_to_purchase", () => {
        const input = {};

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("required");
        }
      });

      it("should reject quantity_to_purchase of 0", () => {
        const input = {
          quantity_to_purchase: 0,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("positive");
        }
      });

      it("should reject negative quantity_to_purchase", () => {
        const input = {
          quantity_to_purchase: -1,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("positive");
        }
      });

      it("should reject large negative values", () => {
        const input = {
          quantity_to_purchase: -100,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-integer quantity_to_purchase", () => {
        const input = {
          quantity_to_purchase: 5.5,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("integer");
        }
      });

      it("should reject decimal values", () => {
        const decimalValues = [1.1, 2.5, 10.99, 0.1, -0.5];

        decimalValues.forEach((value) => {
          const result = updateShoppingListItemSchema.safeParse({
            quantity_to_purchase: value,
          });

          expect(result.success).toBe(false);
        });
      });

      it("should reject non-number quantity_to_purchase", () => {
        const invalidInputs = [
          { quantity_to_purchase: "5" },
          { quantity_to_purchase: "not-a-number" },
          { quantity_to_purchase: null },
          { quantity_to_purchase: undefined },
          { quantity_to_purchase: true },
          { quantity_to_purchase: false },
          { quantity_to_purchase: [] },
          { quantity_to_purchase: {} },
        ];

        invalidInputs.forEach((input) => {
          const result = updateShoppingListItemSchema.safeParse(input);

          expect(result.success).toBe(false);
          if (!result.success) {
            const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
            expect(error).toBeDefined();
          }
        });
      });

      it("should reject string representation of numbers", () => {
        const input = {
          quantity_to_purchase: "5",
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject empty string", () => {
        const input = {
          quantity_to_purchase: "",
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should provide clear error message for missing field", () => {
        const result = updateShoppingListItemSchema.safeParse({});

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("required");
        }
      });

      it("should provide clear error message for invalid type", () => {
        const result = updateShoppingListItemSchema.safeParse({
          quantity_to_purchase: "invalid",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("number");
        }
      });

      it("should provide clear error message for non-positive values", () => {
        const result = updateShoppingListItemSchema.safeParse({
          quantity_to_purchase: 0,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("positive");
        }
      });

      it("should provide clear error message for non-integer values", () => {
        const result = updateShoppingListItemSchema.safeParse({
          quantity_to_purchase: 5.5,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          const error = result.error.issues.find((issue) => issue.path.includes("quantity_to_purchase"));
          expect(error?.message).toContain("integer");
        }
      });
    });

    describe("edge cases", () => {
      it("should handle very large positive integers", () => {
        const input = {
          quantity_to_purchase: Number.MAX_SAFE_INTEGER,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should reject Infinity", () => {
        const input = {
          quantity_to_purchase: Infinity,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject -Infinity", () => {
        const input = {
          quantity_to_purchase: -Infinity,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject NaN", () => {
        const input = {
          quantity_to_purchase: NaN,
        };

        const result = updateShoppingListItemSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });
});
