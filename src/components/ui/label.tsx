import * as React from "react";

import { cn } from "@/lib/utils";

type LabelProps = React.ComponentPropsWithoutRef<"label"> & {
  htmlFor?: string;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => {
  const { className, htmlFor, ...rest } = props;

  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...rest}
    />
  );
});

Label.displayName = "Label";

export { Label };
