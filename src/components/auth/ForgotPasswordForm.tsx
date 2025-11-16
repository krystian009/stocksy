"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth.schema";

const mockSubmit = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mockSubmit();
      toast.success("Check your inbox", {
        description: "If the email exists, a reset link is on its way.",
      });
      reset(values);
    } catch {
      toast.error("Unable to send reset instructions right now.");
    }
  });

  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email associated with your account. We'll send password reset instructions."
      footer={
        <>
          <p>
            Remembered your password?{" "}
            <a className="font-medium text-primary hover:underline" href="/login">
              Return to sign in
            </a>
            .
          </p>
          <p>
            Need an account?{" "}
            <a className="font-medium text-primary hover:underline" href="/register">
              Create one
            </a>
            .
          </p>
        </>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email address</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordForm;
