import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const AuthCard: FC<AuthCardProps> = ({ title, description, children, footer, className }) => (
  <Card className={cn("w-full", className)}>
    <CardHeader className="space-y-2">
      <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="space-y-6">{children}</div>
    </CardContent>
    {footer && <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground">{footer}</CardFooter>}
  </Card>
);

export default AuthCard;
