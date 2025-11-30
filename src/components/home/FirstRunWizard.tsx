import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageOpen } from "lucide-react";

/**
 * FirstRunWizard Component
 *
 * Displayed when the user has no items in their inventory.
 * Guides the user to add their first product.
 */
export function FirstRunWizard() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center p-4">
      <Card className="max-w-md md:max-w-2xl w-full text-center border-2 border-dashed shadow-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PackageOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Stocksy!</CardTitle>
          <CardDescription className="text-base">
            Your inventory is currently empty. Let&apos;s get you started by adding your first product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground text-left">
            <p className="font-medium text-foreground mb-1">Why track inventory?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Never run out of essentials again.</li>
              <li>Auto-generate shopping lists.</li>
              <li>Track what you have and what you need.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="/inventory?intent=add">Add Your First Product</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
