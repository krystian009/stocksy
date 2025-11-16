"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth.schema";

const mockSubmit = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async () => {
    try {
      await mockSubmit();
      toast.success("Registration UI ready", {
        description: "Supabase integration will be connected soon.",
      });
    } catch {
      toast.error("Unable to create an account right now.");
    }
  });

  return (
    <AuthCard
      title="Create your account"
      description="Track inventory and shopping lists with Stocksy."
      footer={
        <p>
          Already have an account?{" "}
          <a className="font-medium text-primary hover:underline" href="/login">
            Sign in
          </a>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
          <p className="text-xs text-muted-foreground">Use at least 8 characters for your password.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-confirm-password">Confirm password</Label>
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;
