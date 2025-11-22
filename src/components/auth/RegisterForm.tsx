import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import AuthCard from "./AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth.schema";

type ServerErrorState = {
  message: string;
  showNextSteps?: boolean;
} | null;

const RegisterForm = () => {
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<ServerErrorState>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setServerError(null);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(values),
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        const rawMessage = typeof body?.error === "string" ? body.error : null;
        const alreadyRegistered = response.status === 400 && (rawMessage?.toLowerCase().includes("already") ?? false);
        const message = alreadyRegistered
          ? "Looks like this email already has an account."
          : (rawMessage ?? "Unable to create an account right now.");

        setServerError({ message, showNextSteps: alreadyRegistered });
        setConfirmationEmail(null);
        toast.error(alreadyRegistered ? "This email is already registered. Try signing in instead." : message);
        return;
      }

      setConfirmationEmail(values.email);
      setServerError(null);
      reset();
      toast.success("Check your inbox", {
        description: `We emailed a confirmation link to ${values.email}. You can sign in after confirming your account.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create an account right now.";
      setServerError({ message });
      setConfirmationEmail(null);
      toast.error(message);
    }
  });

  const hasConfirmation = Boolean(confirmationEmail);

  return (
    <AuthCard
      title={hasConfirmation ? "Confirm your email" : "Create your account"}
      description={
        hasConfirmation
          ? "Please finish activating your account before trying to sign in."
          : "Track inventory and shopping lists with Stocksy."
      }
      footer={
        hasConfirmation ? undefined : (
          <p>
            Already have an account?{" "}
            <a className="font-medium text-primary hover:underline" href="/login">
              Sign in
            </a>
            .
          </p>
        )
      }
    >
      {hasConfirmation ? (
        <div className="space-y-6 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-8 text-center">
          <p className="text-base font-medium text-green-400">
            We sent a confirmation link to <strong>{confirmationEmail}</strong>.
          </p>
          <p className="text-sm text-muted-foreground">Please verify your email before trying to sign in.</p>
          <a className="font-medium text-primary hover:underline" href="/login">
            Return to login
          </a>
        </div>
      ) : (
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

          {serverError && (
            <div
              role="alert"
              className="space-y-1 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <p>{serverError.message}</p>
              {serverError.showNextSteps && (
                <p className="text-xs text-foreground">
                  Try{" "}
                  <a className="font-medium text-primary hover:underline" href="/login">
                    signing in
                  </a>{" "}
                  and use{" "}
                  <a className="font-medium text-primary hover:underline" href="/forgot-password">
                    password reset
                  </a>{" "}
                  if you cannot remember your credentials.
                </p>
              )}
            </div>
          )}
        </form>
      )}
    </AuthCard>
  );
};

export default RegisterForm;
