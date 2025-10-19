import { z } from "zod";

/**
 * Schema used to validate payloads for the create product API endpoint.
 * Ensures that the required fields are provided and respect business rules
 * before passing data to the service layer.
 */
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(120, { message: "Name must be at most 120 characters" }),
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int({ message: "Quantity must be an integer" })
    .min(0, { message: "Quantity must be greater than or equal to 0" }),
  minimum_threshold: z
    .number({ required_error: "Minimum threshold is required" })
    .int({ message: "Minimum threshold must be an integer" })
    .min(1, { message: "Minimum threshold must be greater than 0" }),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
