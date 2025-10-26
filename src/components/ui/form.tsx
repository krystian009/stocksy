import * as React from "react";
import type { FieldValues, FormState } from "react-hook-form";

import { cn } from "@/lib/utils";

interface FormFieldContextValue<TFieldValues extends FieldValues> {
  id: string;
  descriptionId?: string;
  messageId?: string;
  formState: FormState<TFieldValues>;
}

const FormFieldContext = React.createContext<FormFieldContextValue<FieldValues> | null>(null);

function useFormFieldContext<TFieldValues extends FieldValues>() {
  const context = React.useContext(FormFieldContext as React.Context<FormFieldContextValue<TFieldValues> | null>);

  if (!context) {
    throw new Error("useFormFieldContext must be used within a FormField");
  }

  return context;
}

interface FormFieldProps<TFieldValues extends FieldValues> {
  formState: FormState<TFieldValues>;
  children: React.ReactNode;
  className?: string;
}

export function FormField<TFieldValues extends FieldValues>({
  formState,
  children,
  className,
}: FormFieldProps<TFieldValues>) {
  const id = React.useId();

  const contextValue = React.useMemo<FormFieldContextValue<TFieldValues>>(
    () => ({
      id,
      descriptionId: `${id}-description`,
      messageId: `${id}-message`,
      formState,
    }),
    [id, formState]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </FormFieldContext.Provider>
  );
}

export const FormLabel = React.forwardRef<HTMLLabelElement, React.ComponentPropsWithoutRef<"label">>(
  ({ className, ...props }, ref) => {
    const { id } = useFormFieldContext();
    return <label ref={ref} htmlFor={id} className={cn("text-sm font-medium", className)} {...props} />;
  }
);

FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  ({ className, ...props }, ref) => {
    const { id, descriptionId, messageId } = useFormFieldContext();

    return (
      <input
        ref={ref}
        id={id}
        aria-describedby={descriptionId}
        aria-errormessage={messageId}
        className={className}
        {...props}
      />
    );
  }
);

FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = useFormFieldContext();
    return <p ref={ref} id={descriptionId} className={cn("text-xs text-muted-foreground", className)} {...props} />;
  }
);

FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, children, ...props }, ref) => {
    const { messageId, formState } = useFormFieldContext();
    const body = children ?? formState.errors.root?.message;

    if (!body) {
      return null;
    }

    return (
      <p ref={ref} id={messageId} className={cn("text-xs font-medium text-destructive", className)} {...props}>
        {body}
      </p>
    );
  }
);

FormMessage.displayName = "FormMessage";
