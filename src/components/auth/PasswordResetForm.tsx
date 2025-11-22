"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetSchema, type PasswordResetFormValues } from "@/lib/schemas/auth.schema";

const PasswordResetForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to update your password right now.");
      }

      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      reset();
      window.location.assign("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update your password right now.";
      setError("root", { type: "server", message });
      toast.error(message);
    }
  });

  return (
    <AuthCard
      title="Choose a new password"
      description="Enter and confirm your new password to finish resetting your account."
      footer={
        <p>
          All set?{" "}
          <a className="font-medium text-primary hover:underline" href="/login">
            Return to sign in
          </a>
          .
        </p>
      }
    >
      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="reset-password">New password</Label>
          <Input
            id="reset-password"
            type="password"
            placeholder="Create a new password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reset-confirm-password">Confirm new password</Label>
          <Input
            id="reset-confirm-password"
            type="password"
            placeholder="Confirm your new password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save new password"}
        </Button>
        {errors.root && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errors.root.message}
          </p>
        )}
      </form>
    </AuthCard>
  );
};

export default PasswordResetForm;
