import type { LucideIcon } from "lucide-react";
import { CircleAlert, Inbox, LoaderCircle } from "lucide-react";
import { createElement, isValidElement, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "./utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-secondary", className)}
      {...props}
    />
  );
}

export type PageStateKind = "loading" | "empty" | "error";

const DEFAULT_ICONS: Record<PageStateKind, LucideIcon> = {
  loading: LoaderCircle,
  empty: Inbox,
  error: CircleAlert,
};

export function PageState({
  kind = "empty",
  title,
  description,
  action,
  icon,
  className,
}: {
  kind?: PageStateKind;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon | ReactNode;
  className?: string;
}) {
  const loading = kind === "loading";
  const iconSource = icon ?? DEFAULT_ICONS[kind];
  const renderedIcon = isValidElement(iconSource)
    ? iconSource
    : createElement(iconSource as LucideIcon, {
        "aria-hidden": true,
        className: cn("size-5", loading && "animate-spin"),
      });

  return (
    <section
      aria-live="polite"
      aria-busy={loading || undefined}
      className={cn(
        "grid min-h-56 place-items-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center",
        className,
      )}
    >
      <div className="flex max-w-md flex-col items-center">
        <span
          className={cn(
            "grid size-11 place-items-center rounded-full border border-border bg-secondary/60 text-muted-foreground",
            kind === "error" && "border-destructive/30 bg-destructive/5 text-destructive",
            loading && "text-signal",
          )}
        >
          {renderedIcon}
        </span>
        <h2 className="mt-4 font-display text-xl font-medium tracking-tight">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    </section>
  );
}
