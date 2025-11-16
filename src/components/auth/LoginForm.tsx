"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthCard from "./AuthCard";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth.schema";

const mockSubmit = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async () => {
    try {
      await mockSubmit();
      toast.success("Login UI ready", {
        description: "Form submission will be wired to Supabase in the next step.",
      });
    } catch {
      toast.error("Unable to sign in right now.");
    }
  });

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your inventory and shopping lists."
      footer={
        <p>
          Need an account?{" "}
          <a className="font-medium text-primary hover:underline" href="/register">
            Create one
          </a>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <a className="text-sm font-medium text-primary hover:underline" href="/forgot-password">
              Forgot password?
            </a>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default LoginForm;
