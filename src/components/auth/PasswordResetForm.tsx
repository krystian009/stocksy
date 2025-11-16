"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetSchema, type PasswordResetFormValues } from "@/lib/schemas/auth.schema";

const mockSubmit = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

const PasswordResetForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async () => {
    try {
      await mockSubmit();
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      reset();
    } catch {
      toast.error("Unable to update your password right now.");
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
      </form>
    </AuthCard>
  );
};

export default PasswordResetForm;
