import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import type {
  CreateProductCommand,
  PaginationMetaDTO,
  ProductDTO,
  ProductsListQueryParams,
  UpdateProductCommand,
} from "@/types";
import type { ProductViewModel } from "@/components/inventory/types";
import {
  createProduct as createProductRequest,
  deleteProduct as deleteProductRequest,
  getProducts as getProductsRequest,
  updateProduct as updateProductRequest,
} from "@/lib/api/products";
import { toast } from "sonner";

interface InventoryState {
  products: ProductViewModel[];
  meta: PaginationMetaDTO | null;
  isLoading: boolean;
  error: Error | null;
  query: Required<Pick<ProductsListQueryParams, "page" | "sort" | "order">> & Pick<ProductsListQueryParams, "limit">;
}

type InventoryAction =
  | { type: "REQUEST_START" }
  | { type: "REQUEST_SUCCESS"; payload: { products: ProductViewModel[]; meta: PaginationMetaDTO } }
  | { type: "REQUEST_FAILURE"; payload: { error: Error } }
  | { type: "SET_PAGE"; payload: { page: number } }
  | { type: "SET_SORT"; payload: { sort: "name" | "quantity"; order: "asc" | "desc" } }
  | { type: "SET_LIMIT"; payload: { limit: number } }
  | { type: "SET_PRODUCTS"; payload: { products: ProductViewModel[] } }
  | { type: "UPDATE_PRODUCT"; payload: { product: ProductViewModel } }
  | { type: "REMOVE_PRODUCT"; payload: { id: string } }
  | { type: "ADD_PRODUCT"; payload: { product: ProductViewModel } };

function reducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case "REQUEST_START":
      return { ...state, isLoading: true, error: null };
    case "REQUEST_SUCCESS":
      return {
        ...state,
        isLoading: false,
        error: null,
        products: action.payload.products,
        meta: action.payload.meta,
      };
    case "REQUEST_FAILURE":
      return { ...state, isLoading: false, error: action.payload.error };
    case "SET_PAGE":
      return { ...state, query: { ...state.query, page: action.payload.page } };
    case "SET_SORT":
      return { ...state, query: { ...state.query, sort: action.payload.sort, order: action.payload.order } };
    case "SET_LIMIT":
      return { ...state, query: { ...state.query, limit: action.payload.limit } };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload.products };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.product.id ? action.payload.product : product
        ),
      };
    case "REMOVE_PRODUCT":
      return { ...state, products: state.products.filter((product) => product.id !== action.payload.id) };
    case "ADD_PRODUCT":
      return { ...state, products: [action.payload.product, ...state.products] };
    default:
      return state;
  }
}

const initialState: InventoryState = {
  products: [],
  meta: null,
  isLoading: false,
  error: null,
  query: {
    page: 1,
    sort: "name",
    order: "asc",
    limit: 20,
  },
};

interface FetchOptions {
  suppressLoading?: boolean;
}

function mapToViewModel(product: ProductDTO): ProductViewModel {
  return { ...product };
}

export function useInventory() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const isFetchingRef = useRef(false);
  const queryRef = useRef(initialState.query);

  const fetchProducts = useCallback(async (options: FetchOptions = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    if (!options.suppressLoading) {
      dispatch({ type: "REQUEST_START" });
    }

    try {
      const response = await getProductsRequest(queryRef.current);
      const viewModels = response.data.map(mapToViewModel);

      dispatch({
        type: "REQUEST_SUCCESS",
        payload: {
          products: viewModels,
          meta: response.meta,
        },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to fetch products");
      dispatch({ type: "REQUEST_FAILURE", payload: { error: err } });
      toast.error(err.message);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    queryRef.current = state.query;
  }, [state.query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, state.query.page, state.query.sort, state.query.order, state.query.limit]);

  const setPage = useCallback(
    (page: number) => {
      dispatch({ type: "SET_PAGE", payload: { page } });
    },
    [dispatch]
  );

  const setSort = useCallback(
    (sort: "name" | "quantity", order: "asc" | "desc") => {
      dispatch({ type: "SET_SORT", payload: { sort, order } });
      dispatch({ type: "SET_PAGE", payload: { page: 1 } });
    },
    [dispatch]
  );

  const setLimit = useCallback(
    (limit: number) => {
      dispatch({ type: "SET_LIMIT", payload: { limit } });
      dispatch({ type: "SET_PAGE", payload: { page: 1 } });
    },
    [dispatch]
  );

  const addProduct = useCallback(
    async (payload: CreateProductCommand) => {
      try {
        const product = await createProductRequest(payload);
        const viewModel = mapToViewModel(product);

        dispatch({ type: "ADD_PRODUCT", payload: { product: viewModel } });
        toast.success("Product added successfully");

        await fetchProducts({ suppressLoading: true });
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to add product");
        toast.error(err.message);
        throw err;
      }
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (id: string, payload: UpdateProductCommand) => {
      const previousProduct = state.products.find((product) => product.id === id);

      if (!previousProduct) {
        toast.error("Product not found in state");
        return;
      }

      const optimisticProduct: ProductViewModel = {
        ...previousProduct,
        ...payload,
        ui_state: "updating",
      };

      dispatch({ type: "UPDATE_PRODUCT", payload: { product: optimisticProduct } });

      try {
        const updatedProduct = await updateProductRequest(id, payload);
        const viewModel = mapToViewModel(updatedProduct);
        dispatch({ type: "UPDATE_PRODUCT", payload: { product: viewModel } });
        toast.success("Product updated");
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to update product");
        toast.error(err.message);

        const revertedProduct: ProductViewModel = {
          ...previousProduct,
          ui_state: "error",
        };
        dispatch({ type: "UPDATE_PRODUCT", payload: { product: revertedProduct } });

        throw err;
      }
    },
    [state.products]
  );

  const deleteProduct = useCallback(
    async (product: ProductViewModel) => {
      const optimisticProduct: ProductViewModel = {
        ...product,
        ui_state: "deleting",
      };

      dispatch({ type: "UPDATE_PRODUCT", payload: { product: optimisticProduct } });

      try {
        await deleteProductRequest(product.id);
        dispatch({ type: "REMOVE_PRODUCT", payload: { id: product.id } });
        toast.success("Product deleted");

        if (state.products.length === 1 && state.meta && state.meta.current_page > 1) {
          setPage(state.meta.current_page - 1);
        } else {
          await fetchProducts({ suppressLoading: true });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to delete product");
        toast.error(err.message);

        const revertedProduct: ProductViewModel = {
          ...product,
          ui_state: "error",
        };
        dispatch({ type: "UPDATE_PRODUCT", payload: { product: revertedProduct } });

        throw err;
      }
    },
    [fetchProducts, setPage, state.meta, state.products.length]
  );

  const sortedProducts = useMemo(() => state.products, [state.products]);

  return {
    state: {
      products: sortedProducts,
      meta: state.meta,
      isLoading: state.isLoading,
      error: state.error,
      query: state.query,
    },
    actions: {
      setPage,
      setSort,
      setLimit,
      addProduct,
      updateProduct,
      deleteProduct,
      refetch: fetchProducts,
    },
  };
}
