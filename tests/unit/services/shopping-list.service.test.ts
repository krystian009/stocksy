import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getShoppingListForUser,
  updateShoppingListItem,
  checkInShoppingListItem,
  checkInAllShoppingListItems,
} from "@/lib/services/shopping-list.service";
import type { SupabaseClient } from "@/db/supabase.client";
import { createMockSupabase, createMockQueryBuilder } from "../../helpers/supabase.mock";

describe("shopping-list.service", () => {
  let mockSupabase: SupabaseClient;

  const mockUserId = "test-user-id";
  const mockItemId = "test-item-id";

  beforeEach(() => {
    // Initialize with a fresh mock client for each test
    const mocks = createMockSupabase();
    mockSupabase = mocks.client;
  });

  describe("getShoppingListForUser", () => {
    it("should successfully return mapped shopping list items", async () => {
      const mockRawData = [
        {
          id: "1",
          product_id: "p1",
          quantity_to_purchase: 2,
          products: { name: "Milk" },
        },
        {
          id: "2",
          product_id: "p2",
          quantity_to_purchase: 1,
          products: { name: "Bread" },
        },
      ];

      // Setup the query builder to return our data
      const queryBuilder = createMockQueryBuilder(mockRawData);
      vi.mocked(mockSupabase.from).mockReturnValue(queryBuilder);

      const result = await getShoppingListForUser({
        supabase: mockSupabase,
        userId: mockUserId,
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        product_id: "p1",
        quantity_to_purchase: 2,
        product_name: "Milk",
      });
      expect(result[1]).toEqual({
        id: "2",
        product_id: "p2",
        quantity_to_purchase: 1,
        product_name: "Bread",
      });
    });

    it("should return empty array when no items found", async () => {
      const queryBuilder = createMockQueryBuilder([]);
      vi.mocked(mockSupabase.from).mockReturnValue(queryBuilder);

      const result = await getShoppingListForUser({
        supabase: mockSupabase,
        userId: mockUserId,
      });

      expect(result).toEqual([]);
    });

    it("should throw error when userId is missing", async () => {
      await expect(
        getShoppingListForUser({
          supabase: mockSupabase,
          userId: "",
        })
      ).rejects.toThrow("User ID is required");
    });

    it("should throw error when product data is missing or malformed", async () => {
      const mockRawData = [
        {
          id: "1",
          product_id: "p1",
          quantity_to_purchase: 2,
          products: null, // Malformed
        },
      ];
      const queryBuilder = createMockQueryBuilder(mockRawData);
      vi.mocked(mockSupabase.from).mockReturnValue(queryBuilder);

      await expect(
        getShoppingListForUser({
          supabase: mockSupabase,
          userId: mockUserId,
        })
      ).rejects.toThrow("Product not found for shopping list item");
    });

    it("should throw database error", async () => {
      const dbError = new Error("DB Error");
      const queryBuilder = createMockQueryBuilder(null, dbError);
      vi.mocked(mockSupabase.from).mockReturnValue(queryBuilder);

      await expect(
        getShoppingListForUser({
          supabase: mockSupabase,
          userId: mockUserId,
        })
      ).rejects.toThrow(dbError);
    });
  });

  describe("updateShoppingListItem", () => {
    const updateCommand = { quantity_to_purchase: 5 };

    it("should successfully update and return mapped item", async () => {
      // 1. Mock the update call (returns selected rows to confirm update)
      const updateBuilder = createMockQueryBuilder([{ id: mockItemId }]);

      // 2. Mock the fetch call (returns the updated item with product info)
      const fetchResponse = {
        id: mockItemId,
        product_id: "p1",
        quantity_to_purchase: 5,
        products: { name: "Milk" },
      };
      const fetchBuilder = createMockQueryBuilder(fetchResponse);

      // Setup sequence of calls
      vi.mocked(mockSupabase.from).mockReturnValueOnce(updateBuilder).mockReturnValueOnce(fetchBuilder);

      const result = await updateShoppingListItem({
        supabase: mockSupabase,
        userId: mockUserId,
        itemId: mockItemId,
        command: updateCommand,
      });

      expect(result.quantity_to_purchase).toBe(5);
      expect(result.product_name).toBe("Milk");

      // Verify correct methods were called
      expect(updateBuilder.update).toHaveBeenCalledWith({ quantity_to_purchase: 5 });
      expect(updateBuilder.match).toHaveBeenCalledWith({ id: mockItemId, user_id: mockUserId });
    });

    it("should throw 'Shopping list item not found' if update affects no rows", async () => {
      // Mock update returning empty array (no rows updated)
      const updateBuilder = createMockQueryBuilder([]);
      vi.mocked(mockSupabase.from).mockReturnValueOnce(updateBuilder);

      await expect(
        updateShoppingListItem({
          supabase: mockSupabase,
          userId: mockUserId,
          itemId: mockItemId,
          command: updateCommand,
        })
      ).rejects.toThrow("Shopping list item not found");
    });

    it("should throw error if fetch after update fails", async () => {
      // 1. Update succeeds
      const updateBuilder = createMockQueryBuilder([{ id: mockItemId }]);

      // 2. Fetch fails (returns null data)
      const fetchBuilder = createMockQueryBuilder(null, null);

      vi.mocked(mockSupabase.from).mockReturnValueOnce(updateBuilder).mockReturnValueOnce(fetchBuilder);

      await expect(
        updateShoppingListItem({
          supabase: mockSupabase,
          userId: mockUserId,
          itemId: mockItemId,
          command: updateCommand,
        })
      ).rejects.toThrow("Shopping list item not found");
    });

    it("should throw error if userId or itemId is missing", async () => {
      await expect(
        updateShoppingListItem({
          supabase: mockSupabase,
          userId: "",
          itemId: mockItemId,
          command: updateCommand,
        })
      ).rejects.toThrow("User ID is required");

      await expect(
        updateShoppingListItem({
          supabase: mockSupabase,
          userId: mockUserId,
          itemId: "",
          command: updateCommand,
        })
      ).rejects.toThrow("Item ID is required");
    });
  });

  describe("checkInShoppingListItem", () => {
    it("should call RPC successfully", async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({ data: null, error: null });

      await checkInShoppingListItem({
        supabase: mockSupabase,
        userId: mockUserId,
        itemId: mockItemId,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith("check_in_shopping_list_item", {
        item_id: mockItemId,
        requesting_user_id: mockUserId,
      });
    });

    it("should throw 'Shopping list item not found' if RPC returns specific not found error", async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: null,
        error: { message: "Item not found", hint: "", details: "", code: "" },
      });

      await expect(
        checkInShoppingListItem({
          supabase: mockSupabase,
          userId: mockUserId,
          itemId: mockItemId,
        })
      ).rejects.toThrow("Shopping list item not found");

      vi.mocked(mockSupabase.rpc).mockResolvedValue({
        data: null,
        error: { code: "P0002", message: "", hint: "", details: "" },
      });

      await expect(
        checkInShoppingListItem({
          supabase: mockSupabase,
          userId: mockUserId,
          itemId: mockItemId,
        })
      ).rejects.toThrow("Shopping list item not found");
    });

    it("should throw generic error for other RPC errors", async () => {
      const rpcError = { message: "Something went wrong", code: "P9999", hint: "", details: "" };
      vi.mocked(mockSupabase.rpc).mockResolvedValue({ data: null, error: rpcError });

      await expect(
        checkInShoppingListItem({
          supabase: mockSupabase,
          userId: mockUserId,
          itemId: mockItemId,
        })
      ).rejects.toThrow(expect.objectContaining({ message: "Something went wrong" }));
    });
  });

  describe("checkInAllShoppingListItems", () => {
    it("should call RPC successfully", async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({ data: 5, error: null }); // 5 items processed

      await checkInAllShoppingListItems({
        supabase: mockSupabase,
        userId: mockUserId,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith("check_in_all_shopping_list_items", {
        requesting_user_id: mockUserId,
      });
    });

    it("should throw 'Shopping list is empty' if RPC returns 0 items processed", async () => {
      vi.mocked(mockSupabase.rpc).mockResolvedValue({ data: 0, error: null });

      await expect(
        checkInAllShoppingListItems({
          supabase: mockSupabase,
          userId: mockUserId,
        })
      ).rejects.toThrow("Shopping list is empty");
    });

    it("should throw database error if RPC fails", async () => {
      const dbError = new Error("RPC failed");
      vi.mocked(mockSupabase.rpc).mockResolvedValue({ data: null, error: dbError });

      await expect(
        checkInAllShoppingListItems({
          supabase: mockSupabase,
          userId: mockUserId,
        })
      ).rejects.toThrow(dbError);
    });
  });
});
