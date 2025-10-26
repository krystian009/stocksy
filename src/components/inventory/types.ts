import type { ProductDTO } from "@/types";

export type ProductViewModel = ProductDTO & {
  ui_state?: "updating" | "deleting" | "error";
};

export interface ProductFormValues {
  name: string;
  quantity: number;
  minimum_threshold: number;
}
