import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
  onToggle: (isOpen: boolean) => void;
}

/**
 * MobileMenuButton Component
 *
 * A React component that manages the mobile menu toggle button.
 * Uses shadcn/ui Button component and lucide-react icons.
 * Follows accessibility best practices with proper ARIA attributes.
 */
export function MobileMenuButton({ onToggle }: MobileMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle(newState);
  };

  // Reset state on navigation (when component remounts)
  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label="Toggle navigation menu"
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );
}
