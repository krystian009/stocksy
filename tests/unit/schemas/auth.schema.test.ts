import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema, passwordResetSchema } from "@/lib/schemas/auth.schema";

describe("auth.schema", () => {
  describe("loginSchema", () => {
    describe("valid inputs", () => {
      it("should validate a valid email and password", () => {
        const validInput = {
          email: "user@example.com",
          password: "password123",
        };

        const result = loginSchema.safeParse(validInput);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("user@example.com");
          expect(result.data.password).toBe("password123");
        }
      });

      it("should trim whitespace from email", () => {
        const input = {
          email: "  user@example.com  ",
          password: "password123",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("user@example.com");
        }
      });

      it("should accept password with exactly 8 characters", () => {
        const input = {
          email: "user@example.com",
          password: "12345678",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept password with exactly 128 characters", () => {
        const input = {
          email: "user@example.com",
          password: "a".repeat(128),
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept various valid email formats", () => {
        const validEmails = [
          "test@example.com",
          "user.name@example.co.uk",
          "user+tag@example.com",
          "user123@example-domain.com",
        ];

        validEmails.forEach((email) => {
          const result = loginSchema.safeParse({
            email,
            password: "password123",
          });

          expect(result.success).toBe(true);
        });
      });
    });

    describe("invalid inputs", () => {
      it("should reject missing email", () => {
        const input = {
          password: "password123",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((issue) => issue.path.includes("email"))).toBe(true);
        }
      });

      it("should reject missing password", () => {
        const input = {
          email: "user@example.com",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.some((issue) => issue.path.includes("password"))).toBe(true);
        }
      });

      it("should reject empty email string", () => {
        const input = {
          email: "",
          password: "password123",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const emailError = result.error.issues.find((issue) => issue.path.includes("email"));
          expect(emailError).toBeDefined();
        }
      });

      it("should reject email with only whitespace", () => {
        const input = {
          email: "   ",
          password: "password123",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject invalid email format", () => {
        const invalidEmails = [
          "notanemail",
          "@example.com",
          "user@",
          "user@example",
          "user name@example.com",
          "user@exam ple.com",
        ];

        invalidEmails.forEach((email) => {
          const result = loginSchema.safeParse({
            email,
            password: "password123",
          });

          expect(result.success).toBe(false);
          if (!result.success) {
            const emailError = result.error.issues.find((issue) => issue.path.includes("email"));
            expect(emailError?.message).toContain("valid email");
          }
        });
      });

      it("should reject password shorter than 8 characters", () => {
        const input = {
          email: "user@example.com",
          password: "1234567",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find((issue) => issue.path.includes("password"));
          expect(passwordError?.message).toContain("at least 8 characters");
        }
      });

      it("should reject password longer than 128 characters", () => {
        const input = {
          email: "user@example.com",
          password: "a".repeat(129),
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find((issue) => issue.path.includes("password"));
          expect(passwordError?.message).toContain("shorter than 128 characters");
        }
      });

      it("should reject non-string email", () => {
        const input = {
          email: 123,
          password: "password123",
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject non-string password", () => {
        const input = {
          email: "user@example.com",
          password: 12345678,
        };

        const result = loginSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });

  describe("registerSchema", () => {
    describe("valid inputs", () => {
      it("should validate when password and confirmPassword match", () => {
        const input = {
          email: "user@example.com",
          password: "password123",
          confirmPassword: "password123",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.password).toBe("password123");
          expect(result.data.confirmPassword).toBe("password123");
        }
      });

      it("should trim email whitespace", () => {
        const input = {
          email: "  user@example.com  ",
          password: "password123",
          confirmPassword: "password123",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("user@example.com");
        }
      });
    });

    describe("invalid inputs", () => {
      it("should reject when password and confirmPassword do not match", () => {
        const input = {
          email: "user@example.com",
          password: "password123",
          confirmPassword: "password456",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmPasswordError = result.error.issues.find((issue) => issue.path.includes("confirmPassword"));
          expect(confirmPasswordError?.message).toContain("Passwords do not match");
        }
      });

      it("should reject missing confirmPassword", () => {
        const input = {
          email: "user@example.com",
          password: "password123",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should inherit email validation from loginSchema", () => {
        const input = {
          email: "invalid-email",
          password: "password123",
          confirmPassword: "password123",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should inherit password validation from loginSchema", () => {
        const input = {
          email: "user@example.com",
          password: "short",
          confirmPassword: "short",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject when confirmPassword is too short even if passwords match", () => {
        const input = {
          email: "user@example.com",
          password: "short",
          confirmPassword: "short",
        };

        const result = registerSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });

  describe("forgotPasswordSchema", () => {
    describe("valid inputs", () => {
      it("should validate a valid email", () => {
        const input = {
          email: "user@example.com",
        };

        const result = forgotPasswordSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("user@example.com");
        }
      });

      it("should trim email whitespace", () => {
        const input = {
          email: "  user@example.com  ",
        };

        const result = forgotPasswordSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe("user@example.com");
        }
      });
    });

    describe("invalid inputs", () => {
      it("should reject missing email", () => {
        const input = {};

        const result = forgotPasswordSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject invalid email format", () => {
        const input = {
          email: "notanemail",
        };

        const result = forgotPasswordSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject empty email", () => {
        const input = {
          email: "",
        };

        const result = forgotPasswordSchema.safeParse(input);

        expect(result.success).toBe(false);
      });
    });
  });

  describe("passwordResetSchema", () => {
    describe("valid inputs", () => {
      it("should validate when password and confirmPassword match", () => {
        const input = {
          password: "newpassword123",
          confirmPassword: "newpassword123",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.password).toBe("newpassword123");
          expect(result.data.confirmPassword).toBe("newpassword123");
        }
      });

      it("should accept password with exactly 8 characters", () => {
        const input = {
          password: "12345678",
          confirmPassword: "12345678",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(true);
      });

      it("should accept password with exactly 128 characters", () => {
        const longPassword = "a".repeat(128);
        const input = {
          password: longPassword,
          confirmPassword: longPassword,
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(true);
      });
    });

    describe("invalid inputs", () => {
      it("should reject when password and confirmPassword do not match", () => {
        const input = {
          password: "newpassword123",
          confirmPassword: "differentpassword",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmPasswordError = result.error.issues.find((issue) => issue.path.includes("confirmPassword"));
          expect(confirmPasswordError?.message).toContain("Passwords do not match");
        }
      });

      it("should reject missing password", () => {
        const input = {
          confirmPassword: "password123",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject missing confirmPassword", () => {
        const input = {
          password: "password123",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject password shorter than 8 characters", () => {
        const input = {
          password: "1234567",
          confirmPassword: "1234567",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject password longer than 128 characters", () => {
        const longPassword = "a".repeat(129);
        const input = {
          password: longPassword,
          confirmPassword: longPassword,
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(false);
      });

      it("should reject when passwords match but are too short", () => {
        const input = {
          password: "short",
          confirmPassword: "short",
        };

        const result = passwordResetSchema.safeParse(input);

        expect(result.success).toBe(false);
        if (!result.success) {
          // Should have password length errors, not password mismatch error
          const hasMismatchError = result.error.issues.some((issue) => issue.message === "Passwords do not match");
          expect(hasMismatchError).toBe(false);
        }
      });
    });
  });
});
