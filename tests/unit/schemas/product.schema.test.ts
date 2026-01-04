import { describe, it, expect } from "vitest";
import { createProductSchema, updateProductSchema, getProductsQuerySchema } from "@/lib/schemas/product.schema";

describe("product.schema", () => {
  describe("createProductSchema", () => {
    describe("valid inputs", () => {
      it("should validate a complete valid product", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Test Product");
          expect(result.data.quantity).toBe(10);
          expect(result.data.minimum_threshold).toBe(5);
        }
      });

      it("should trim whitespace from product name", () => {
        const input = {
          name: "  Test Product  ",
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Test Product");
        }
      });

      it("should accept name with exactly 3 characters", () => {
        const input = {
          name: "ABC",
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept name with exactly 120 characters", () => {
        const input = {
          name: "A".repeat(120),
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept quantity of 0", () => {
        const input = {
          name: "Test Product",
          quantity: 0,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.quantity).toBe(0);
        }
      });

      it("should accept large quantity values", () => {
        const input = {
          name: "Test Product",
          quantity: 1000000,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept minimum_threshold of exactly 1", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
          minimum_threshold: 1,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.minimum_threshold).toBe(1);
        }
      });

      it("should accept large minimum_threshold values", () => {
        const input = {
          name: "Test Product",
          quantity: 1000000,
          minimum_threshold: 500000,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept integer values for quantity and minimum_threshold", () => {
        const input = {
          name: "Test Product",
          quantity: 42,
          minimum_threshold: 10,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("should reject missing name", () => {
        const input = {
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.issues.find((issue) => issue.path.includes("name"));
          expect(nameError).toBeDefined();
        }
      });

      it("should reject missing quantity", () => {
        const input = {
          name: "Test Product",
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const quantityError = result.error.issues.find((issue) => issue.path.includes("quantity"));
          expect(quantityError?.message).toContain("required");
        }
      });

      it("should reject missing minimum_threshold", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const thresholdError = result.error.issues.find((issue) => issue.path.includes("minimum_threshold"));
          expect(thresholdError?.message).toContain("required");
        }
      });

      it("should reject name shorter than 3 characters", () => {
        const input = {
          name: "AB",
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.issues.find((issue) => issue.path.includes("name"));
          expect(nameError?.message).toContain("at least 3 characters");
        }
      });

      it("should reject name longer than 120 characters", () => {
        const input = {
          name: "A".repeat(121),
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const nameError = result.error.issues.find((issue) => issue.path.includes("name"));
          expect(nameError?.message).toContain("at most 120 characters");
        }
      });

      it("should reject name with only whitespace after trimming", () => {
        const input = {
          name: "  ",
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject empty name string", () => {
        const input = {
          name: "",
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject negative quantity", () => {
        const input = {
          name: "Test Product",
          quantity: -1,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const quantityError = result.error.issues.find((issue) => issue.path.includes("quantity"));
          expect(quantityError?.message).toContain("greater than or equal to 0");
        }
      });

      it("should reject non-integer quantity", () => {
        const input = {
          name: "Test Product",
          quantity: 10.5,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const quantityError = result.error.issues.find((issue) => issue.path.includes("quantity"));
          expect(quantityError?.message).toContain("integer");
        }
      });

      it("should reject minimum_threshold of 0", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
          minimum_threshold: 0,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const thresholdError = result.error.issues.find((issue) => issue.path.includes("minimum_threshold"));
          expect(thresholdError?.message).toContain("greater than 0");
        }
      });

      it("should reject negative minimum_threshold", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
          minimum_threshold: -1,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-integer minimum_threshold", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
          minimum_threshold: 5.5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const thresholdError = result.error.issues.find((issue) => issue.path.includes("minimum_threshold"));
          expect(thresholdError?.message).toContain("integer");
        }
      });

      it("should reject non-string name", () => {
        const input = {
          name: 123,
          quantity: 10,
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-number quantity", () => {
        const input = {
          name: "Test Product",
          quantity: "10",
          minimum_threshold: 5,
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-number minimum_threshold", () => {
        const input = {
          name: "Test Product",
          quantity: 10,
          minimum_threshold: "5",
        };

        const result = createProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateProductSchema", () => {
    describe("valid inputs", () => {
      it("should validate update with only name", () => {
        const input = {
          name: "Updated Product Name",
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Updated Product Name");
        }
      });

      it("should validate update with only quantity", () => {
        const input = {
          quantity: 20,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.quantity).toBe(20);
        }
      });

      it("should validate update with only minimum_threshold", () => {
        const input = {
          minimum_threshold: 10,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.minimum_threshold).toBe(10);
        }
      });

      it("should validate update with all fields", () => {
        const input = {
          name: "Updated Product",
          quantity: 25,
          minimum_threshold: 12,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Updated Product");
          expect(result.data.quantity).toBe(25);
          expect(result.data.minimum_threshold).toBe(12);
        }
      });

      it("should validate update with name and quantity", () => {
        const input = {
          name: "Updated Product",
          quantity: 15,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should trim whitespace from name", () => {
        const input = {
          name: "  Updated Product  ",
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Updated Product");
        }
      });

      it("should accept quantity of 0", () => {
        const input = {
          quantity: 0,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("should reject empty object", () => {
        const input = {};

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((issue) => issue.message.includes("At least one field"))).toBe(true);
        }
      });

      it("should inherit name validation rules from createProductSchema", () => {
        const input = {
          name: "AB", // Too short
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should inherit quantity validation rules from createProductSchema", () => {
        const input = {
          quantity: -1, // Negative
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should inherit minimum_threshold validation rules from createProductSchema", () => {
        const input = {
          minimum_threshold: 0, // Must be > 0
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject name with only whitespace", () => {
        const input = {
          name: "   ",
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-integer quantity", () => {
        const input = {
          quantity: 10.5,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-integer minimum_threshold", () => {
        const input = {
          minimum_threshold: 5.5,
        };

        const result = updateProductSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });

  describe("getProductsQuerySchema", () => {
    describe("valid inputs", () => {
      it("should validate with all query parameters", () => {
        const input = {
          page: "2",
          limit: "10",
          sort: "quantity",
          order: "desc",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(2);
          expect(result.data.limit).toBe(10);
          expect(result.data.sort).toBe("quantity");
          expect(result.data.order).toBe("desc");
        }
      });

      it("should use default values when parameters are missing", () => {
        const input = {};

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(1);
          expect(result.data.limit).toBe(20);
          expect(result.data.sort).toBe("name");
          expect(result.data.order).toBe("asc");
        }
      });

      it("should coerce string numbers to integers", () => {
        const input = {
          page: "5",
          limit: "15",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data.page).toBe("number");
          expect(typeof result.data.limit).toBe("number");
          expect(result.data.page).toBe(5);
          expect(result.data.limit).toBe(15);
        }
      });

      it("should accept numeric values directly", () => {
        const input = {
          page: 3,
          limit: 25,
          sort: "name",
          order: "asc",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept page value of 1", () => {
        const input = {
          page: "1",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.page).toBe(1);
        }
      });

      it("should accept large page values", () => {
        const input = {
          page: "999",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept limit value of 1", () => {
        const input = {
          limit: "1",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(1);
        }
      });

      it("should accept limit value of 100", () => {
        const input = {
          limit: "100",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.limit).toBe(100);
        }
      });

      it("should accept sort value 'name'", () => {
        const input = {
          sort: "name",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sort).toBe("name");
        }
      });

      it("should accept sort value 'quantity'", () => {
        const input = {
          sort: "quantity",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.sort).toBe("quantity");
        }
      });

      it("should accept order value 'asc'", () => {
        const input = {
          order: "asc",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.order).toBe("asc");
        }
      });

      it("should accept order value 'desc'", () => {
        const input = {
          order: "desc",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.order).toBe("desc");
        }
      });
    });

    describe("invalid inputs", () => {
      it("should reject page value less than 1", () => {
        const input = {
          page: "0",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject negative page value", () => {
        const input = {
          page: "-1",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-integer page value", () => {
        const input = {
          page: "1.5",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject limit value less than 1", () => {
        const input = {
          limit: "0",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject negative limit value", () => {
        const input = {
          limit: "-1",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject limit value greater than 100", () => {
        const input = {
          limit: "101",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-integer limit value", () => {
        const input = {
          limit: "10.5",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject invalid sort value", () => {
        const invalidSorts = ["id", "price", "created_at", "", "NAME"];

        invalidSorts.forEach((sort) => {
          const result = getProductsQuerySchema.safeParse({ sort });

          expect(result.success).toBe(false);
        });
      });

      it("should reject invalid order value", () => {
        const invalidOrders = ["up", "down", "", "ASC", "DESC"];

        invalidOrders.forEach((order) => {
          const result = getProductsQuerySchema.safeParse({ order });

          expect(result.success).toBe(false);
        });
      });

      it("should reject non-numeric page string", () => {
        const input = {
          page: "not-a-number",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-numeric limit string", () => {
        const input = {
          limit: "not-a-number",
        };

        const result = getProductsQuerySchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });
});
