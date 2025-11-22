"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth.schema";

const ForgotPasswordForm = () => {
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
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
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to send reset instructions right now.");
      }

      setConfirmationEmail(values.email);
      toast.success("Check your inbox", {
        description: `We emailed a password reset link to ${values.email}. Follow it to choose a new password.`,
      });
      reset(values);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send reset instructions right now.";
      setConfirmationEmail(null);
      toast.error(message);
    }
  });

  return (
    <AuthCard
      title={confirmationEmail ? "Check your inbox" : "Reset your password"}
      description={
        confirmationEmail
          ? "We just sent you a password reset link. Follow it to choose a new password."
          : "Enter the email associated with your account. We'll send password reset instructions."
      }
      footer={
        confirmationEmail ? undefined : (
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
        )
      }
    >
      {confirmationEmail ? (
        <div className="space-y-6 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-8 text-center">
          <p className="text-base font-medium text-primary">
            We sent a password reset link to <strong>{confirmationEmail}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            System sends a secure link that expires shortly. Open it from the same device to finish resetting your
            password.
          </p>
          <div className="space-y-2 text-sm">
            <a className="font-medium text-primary hover:underline" href="/login">
              Return to sign in
            </a>
            <button
              type="button"
              className="font-medium text-primary/80 hover:text-primary"
              onClick={() => {
                setConfirmationEmail(null);
                reset();
              }}
            >
              &nbsp; Use a different email
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </AuthCard>
  );
};

export default ForgotPasswordForm;
