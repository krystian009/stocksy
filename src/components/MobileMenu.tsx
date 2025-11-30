import { useState, useEffect } from "react";
import { MobileMenuButton } from "./MobileMenuButton";

interface NavItem {
  name: string;
  href: string;
  isActive: boolean;
}

interface MobileMenuProps {
  items: NavItem[];
}

/**
 * MobileMenu Component
 *
 * A React component that manages the mobile navigation menu state.
 * Handles menu visibility and coordinates with the MobileMenuButton.
 * Closes menu automatically on navigation using Astro's page lifecycle events.
 */
export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on navigation
  useEffect(() => {
    const handleNavigation = () => {
      setIsOpen(false);
    };

    document.addEventListener("astro:page-load", handleNavigation);

    return () => {
      document.removeEventListener("astro:page-load", handleNavigation);
    };
  }, []);

  return (
    <div className="md:hidden">
      <MobileMenuButton onToggle={setIsOpen} />

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-16 border-b border-border bg-background pb-4 shadow-lg animate-in slide-in-from-top-2"
          role="menu"
        >
          <div className="container mx-auto px-4">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href} role="none">
                  <a
                    href={item.href}
                    className={`block rounded-md px-4 py-2 text-base font-medium transition-colors ${
                      item.isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    role="menuitem"
                    aria-current={item.isActive ? "page" : undefined}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
