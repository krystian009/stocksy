import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface AuthButtonProps {
  isAuthenticated: boolean;
}

const AuthButton = ({ isAuthenticated }: AuthButtonProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button size="sm" asChild>
        <a href="/login">Sign in</a>
      </Button>
    );
  }

  const handleLogout = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to sign out.");
      }

      toast.success("Signed out");
      window.location.assign("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} disabled={isSubmitting}>
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  );
};

export default AuthButton;
