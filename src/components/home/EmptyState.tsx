import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

/**
 * EmptyState Component
 *
 * Displays a positive, reassuring message when the user has no low-stock items.
 * This indicates that all products in the inventory are adequately stocked.
 * Styled to match FirstRunWizard for consistency.
 */
export function EmptyState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center p-4">
      <Card className="max-w-md md:max-w-2xl w-full text-center border-2 border-dashed shadow-sm">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
          </div>
          <CardTitle className="text-2xl">All items are well-stocked!</CardTitle>
          <CardDescription className="text-base">
            Great job! You don&apos;t have any products running low. Your inventory is in good shape.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground text-left">
            <p className="font-medium text-foreground mb-1">What's next?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Review your current stock levels.</li>
              <li>Add any new staples you buy often.</li>
              <li>Relax knowing your essentials are covered.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href="/inventory" aria-label="Go to your full inventory list">
              View Inventory
            </a>
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="/inventory?intent=add" aria-label="Add a new product to your inventory">
              Add Product
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
