import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  totalCount: number;
}

/**
 * SummaryCard Component
 *
 * Displays a summary banner showing the total count of low-stock items
 * that need restocking. Uses an alert-style design with amber/orange colors
 * to draw attention to the notification.
 */
export function SummaryCard({ totalCount }: SummaryCardProps) {
  return (
    <Card
      className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
      aria-live="polite"
      aria-atomic="true"
    >
      <CardContent className="pt-6">
        <p className="text-base text-amber-900 dark:text-amber-100">
          You have <span className="font-semibold">{totalCount}</span> {totalCount === 1 ? "item" : "items"} that need
          restocking
        </p>
      </CardContent>
    </Card>
  );
}
