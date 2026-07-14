import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "./utils";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8", className)} {...props} />
  );
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-16 md:py-24", className)} {...props} />;
}

export function Eyebrow({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="h-px w-6 bg-signal" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  intro,
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Compatibility alias for `description`. */
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const supportingCopy = description ?? intro;

  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.7rem)] font-medium leading-[1.08] tracking-tight">
          {title}
        </h2>
        {supportingCopy && (
          <div className="mt-4 text-base leading-relaxed text-muted-foreground">
            {supportingCopy}
          </div>
        )}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-6 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function MetricGrid({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}

export function MetricCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  hint,
  detail,
  footer,
  tone = "default",
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  /** Supporting copy shown below the label. */
  detail?: ReactNode;
  /** Compatibility alias for `detail`. */
  footer?: ReactNode;
  tone?: "default" | "accent";
  className?: string;
}) {
  const supportingCopy = detail ?? footer;

  return (
    <article className={cn("bg-card p-6", tone === "accent" && "bg-signal/[0.045]", className)}>
      <div className="flex items-center justify-between">
        {Icon ? <Icon className="size-4 text-signal" aria-hidden /> : <span />}
        {hint && (
          <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1 font-display text-4xl font-semibold tracking-tight text-signal">
        {prefix}
        {value}
        {suffix && <span className="text-base text-muted-foreground">{suffix}</span>}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{label}</p>
      {supportingCopy && (
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{supportingCopy}</div>
      )}
    </article>
  );
}

export function ActionLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-signal hover:underline",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}

export function GridBackdrop({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "linear-gradient(var(--mk-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--mk-grid-line) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
        ...(style as CSSProperties),
      }}
      {...props}
    />
  );
}
