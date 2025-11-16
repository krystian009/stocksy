import { z } from "zod";

const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be shorter than 128 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const passwordResetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
