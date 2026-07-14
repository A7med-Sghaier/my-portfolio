import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

export const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.68rem] font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-muted-foreground",
        signal: "border-signal/30 bg-signal/10 text-signal",
        warning: "border-signal-2/35 bg-signal-2/10 text-signal-2",
        success: "border-success/30 bg-success/10 text-success",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function TechTag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border border-border bg-secondary/55 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
