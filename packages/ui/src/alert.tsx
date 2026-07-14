import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[auto_1fr] items-start gap-x-3 rounded-xl border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground [&>svg]:text-signal",
        info: "border-signal/30 bg-signal/5 text-foreground [&>svg]:text-signal",
        warning: "border-signal-2/35 bg-signal-2/5 text-foreground [&>svg]:text-signal-2",
        success: "border-success/30 bg-success/5 text-foreground [&>svg]:text-success",
        danger: "border-destructive/30 bg-destructive/5 text-foreground [&>svg]:text-destructive",
        destructive:
          "border-destructive/30 bg-destructive/5 text-foreground [&>svg]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, "title"> &
  VariantProps<typeof alertVariants> & {
    /** Optional visible heading for the compact, direct-use form. */
    title?: React.ReactNode;
  };

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, children, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {title ? (
        <div className="col-span-2">
          <h5 className="font-medium leading-none tracking-tight">{title}</h5>
          {children ? (
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>
          ) : null}
        </div>
      ) : (
        children
      )}
    </div>
  ),
);
Alert.displayName = "Alert";

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("col-start-2 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "col-start-2 mt-1 text-sm leading-relaxed text-muted-foreground [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
