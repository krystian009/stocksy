import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  DuplicateProductError,
  ProductNotFoundError,
} from "@/lib/services/product.service";
import type { SupabaseClient } from "@/db/supabase.client";
import { createMockSupabase, createMockQueryBuilder } from "../../helpers/supabase.mock";

describe("product.service", () => {
  let mockSupabase: SupabaseClient;
  const mockUserId = "test-user-id";
  const mockProductId = "test-product-id";

  beforeEach(() => {
    const mocks = createMockSupabase();
    mockSupabase = mocks.client;
  });

  describe("createProduct", () => {
    const validPayload = {
      name: "Test Product",
      quantity: 10,
      minimum_threshold: 5,
    };

    it("should successfully create a product when data is valid and name is unique", async () => {
      // Mock unique name check: maybeSingle returns null (no existing product)
      const checkBuilder = createMockQueryBuilder(null);

      // Mock insert: returns created product
      const createdProduct = { id: mockProductId, ...validPayload, user_id: mockUserId };
      const insertBuilder = createMockQueryBuilder(createdProduct);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(insertBuilder);

      const result = await createProduct({
        supabase: mockSupabase,
        userId: mockUserId,
        payload: validPayload,
      });

      expect(result).toEqual(createdProduct);
      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(insertBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Product",
          user_id: mockUserId,
        })
      );
    });

    it("should throw DuplicateProductError when a product with the same name exists", async () => {
      // Mock unique name check: maybeSingle returns an existing product
      const checkBuilder = createMockQueryBuilder({ id: "existing-id" });
      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder);

      await expect(
        createProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          payload: validPayload,
        })
      ).rejects.toThrow(DuplicateProductError);
    });

    it("should throw error when userId is missing", async () => {
      await expect(
        createProduct({
          supabase: mockSupabase,
          userId: "",
          payload: validPayload,
        })
      ).rejects.toThrow("User ID is required");
    });

    it("should throw error when product name is empty after trim", async () => {
      await expect(
        createProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          payload: { ...validPayload, name: "   " },
        })
      ).rejects.toThrow("Product name is required");
    });

    it("should throw database error if unique check fails", async () => {
      const dbError = new Error("DB Error");
      const checkBuilder = createMockQueryBuilder(null, dbError);
      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder);

      await expect(
        createProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          payload: validPayload,
        })
      ).rejects.toThrow(dbError);
    });

    it("should throw database error if insert fails", async () => {
      const checkBuilder = createMockQueryBuilder(null);
      const dbError = new Error("DB Insert Error");
      const insertBuilder = createMockQueryBuilder(null, dbError);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(insertBuilder);

      await expect(
        createProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          payload: validPayload,
        })
      ).rejects.toThrow(dbError);
    });

    it("should throw error if insert returns no data", async () => {
      const checkBuilder = createMockQueryBuilder(null);
      const insertBuilder = createMockQueryBuilder(null); // No data returned

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(insertBuilder);

      await expect(
        createProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          payload: validPayload,
        })
      ).rejects.toThrow("Product could not be created");
    });
  });

  describe("deleteProduct", () => {
    it("should successfully delete a product", async () => {
      // Mock delete: returns count 1
      // Note: delete() returns a builder that has match(). match() returns the promise.

      // Checking service logic:
      // const { count, error } = await supabase.from(...).delete({...}).match(...)

      // Our helper resolves to { data, error }. It lacks 'count'.
      // We need to override the 'then' behavior or the builder for this specific case.

      const deleteBuilder = createMockQueryBuilder();
      // Override the promise resolution to include count
      deleteBuilder.then = vi.fn((resolve) => resolve({ count: 1, error: null }));

      vi.mocked(mockSupabase.from).mockReturnValue(deleteBuilder);

      await deleteProduct({
        supabase: mockSupabase,
        userId: mockUserId,
        productId: mockProductId,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("products");
      expect(deleteBuilder.delete).toHaveBeenCalledWith({ count: "exact" });
      expect(deleteBuilder.match).toHaveBeenCalledWith({ id: mockProductId, user_id: mockUserId });
    });

    it("should throw error when userId is missing", async () => {
      await expect(
        deleteProduct({
          supabase: mockSupabase,
          userId: "",
          productId: mockProductId,
        })
      ).rejects.toThrow("User ID is required");
    });

    it("should throw error when productId is missing", async () => {
      await expect(
        deleteProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: "",
        })
      ).rejects.toThrow("Product ID is required");
    });

    it("should throw ProductNotFoundError when no rows are deleted", async () => {
      const deleteBuilder = createMockQueryBuilder();
      deleteBuilder.then = vi.fn((resolve) => resolve({ count: 0, error: null }));
      vi.mocked(mockSupabase.from).mockReturnValue(deleteBuilder);

      await expect(
        deleteProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: mockProductId,
        })
      ).rejects.toThrow(ProductNotFoundError);
    });

    it("should throw database error if delete operation fails", async () => {
      const dbError = new Error("Delete failed");
      const deleteBuilder = createMockQueryBuilder();
      deleteBuilder.then = vi.fn((resolve) => resolve({ count: null, error: dbError }));
      vi.mocked(mockSupabase.from).mockReturnValue(deleteBuilder);

      await expect(
        deleteProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: mockProductId,
        })
      ).rejects.toThrow(dbError);
    });
  });

  describe("updateProduct", () => {
    const updatePayload = {
      name: "Updated Product Name",
      quantity: 20,
    };

    it("should successfully update a product", async () => {
      // Mock name check: maybeSingle returns null (no conflict)
      const checkBuilder = createMockQueryBuilder(null);

      // Mock update: returns updated data
      const updatedProduct = { id: mockProductId, ...updatePayload, user_id: mockUserId };
      const updateBuilder = createMockQueryBuilder(updatedProduct);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(updateBuilder);

      const result = await updateProduct({
        supabase: mockSupabase,
        userId: mockUserId,
        productId: mockProductId,
        payload: updatePayload,
      });

      expect(result).toEqual(updatedProduct);
      expect(updateBuilder.update).toHaveBeenCalledWith(expect.objectContaining(updatePayload));
    });

    it("should allow updating name to the same name (idempotency)", async () => {
      const checkBuilder = createMockQueryBuilder(null);

      const updatedProduct = { id: mockProductId, ...updatePayload, user_id: mockUserId };
      const updateBuilder = createMockQueryBuilder(updatedProduct);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(updateBuilder);

      await updateProduct({
        supabase: mockSupabase,
        userId: mockUserId,
        productId: mockProductId,
        payload: updatePayload,
      });

      expect(checkBuilder.neq).toHaveBeenCalledWith("id", mockProductId);
    });

    it("should throw DuplicateProductError when updating name to one that exists for another product", async () => {
      const checkBuilder = createMockQueryBuilder({ id: "other-id" });
      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder);

      await expect(
        updateProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: mockProductId,
          payload: updatePayload,
        })
      ).rejects.toThrow(DuplicateProductError);
    });

    it("should throw error when userId is missing", async () => {
      await expect(
        updateProduct({
          supabase: mockSupabase,
          userId: "",
          productId: mockProductId,
          payload: updatePayload,
        })
      ).rejects.toThrow("User ID is required");
    });

    it("should throw error when productId is missing", async () => {
      await expect(
        updateProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: "",
          payload: updatePayload,
        })
      ).rejects.toThrow("Product ID is required");
    });

    it("should throw error when updated name is empty", async () => {
      await expect(
        updateProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: mockProductId,
          payload: { name: "   " },
        })
      ).rejects.toThrow("Product name cannot be empty");
    });

    it("should throw ProductNotFoundError when update returns no matching row (PGRST116)", async () => {
      const checkBuilder = createMockQueryBuilder(null);

      const pgrstError = { code: "PGRST116", message: "Row not found" };
      const updateBuilder = createMockQueryBuilder(null, pgrstError);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(updateBuilder);

      await expect(
        updateProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: mockProductId,
          payload: updatePayload,
        })
      ).rejects.toThrow(ProductNotFoundError);
    });

    it("should throw database error if update fails", async () => {
      const checkBuilder = createMockQueryBuilder(null);

      const dbError = new Error("Update failed");
      const updateBuilder = createMockQueryBuilder(null, dbError);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(checkBuilder).mockReturnValueOnce(updateBuilder);

      await expect(
        updateProduct({
          supabase: mockSupabase,
          userId: mockUserId,
          productId: mockProductId,
          payload: updatePayload,
        })
      ).rejects.toThrow(dbError);
    });
  });

  describe("getProducts", () => {
    it("should return products list with default pagination and sorting", async () => {
      const mockData = [
        { id: "1", name: "P1" },
        { id: "2", name: "P2" },
      ];
      const mockCount = 10;

      // Chain 1: Count
      // Note: for count, .eq() resolves to { count, error }
      const countBuilder = createMockQueryBuilder();
      // We need to override resolution for this specific chain to return 'count' property
      // But wait, .eq() in the service is NOT awaited directly.
      // It is: const countPromise = supabase.from(...).select(..., { count: 'exact', head: true }).eq(...);
      // It awaits the chain.
      // So we need the chain to resolve to { count: 10, error: null }
      countBuilder.then = vi.fn((resolve) => resolve({ count: mockCount, error: null }));

      // Chain 2: Data
      const dataBuilder = createMockQueryBuilder(mockData);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(countBuilder).mockReturnValueOnce(dataBuilder);

      const result = await getProducts({
        supabase: mockSupabase,
        userId: mockUserId,
        query: {},
      });

      expect(result.data).toEqual(mockData);
      expect(result.meta.total_items).toBe(mockCount);
      expect(result.meta.current_page).toBe(1); // default
      expect(result.meta.per_page).toBe(20); // default
    });

    it("should handle custom pagination parameters", async () => {
      const countBuilder = createMockQueryBuilder();
      countBuilder.then = vi.fn((resolve) => resolve({ count: 50, error: null }));

      const dataBuilder = createMockQueryBuilder([]);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(countBuilder).mockReturnValueOnce(dataBuilder);

      await getProducts({
        supabase: mockSupabase,
        userId: mockUserId,
        query: { page: 2, limit: 10 },
      });

      // Page 2, limit 10 -> range(10, 19)
      expect(dataBuilder.range).toHaveBeenCalledWith(10, 19);
    });

    it("should throw error if count query fails", async () => {
      const dbError = new Error("Count failed");
      const countBuilder = createMockQueryBuilder();
      countBuilder.then = vi.fn((resolve) => resolve({ count: null, error: dbError }));

      const dataBuilder = createMockQueryBuilder([]);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(countBuilder).mockReturnValueOnce(dataBuilder);

      await expect(
        getProducts({
          supabase: mockSupabase,
          userId: mockUserId,
          query: {},
        })
      ).rejects.toThrow(dbError);
    });
  });
});
