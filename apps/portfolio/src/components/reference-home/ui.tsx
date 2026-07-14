import { useI18n } from "@portfolio/i18n";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router";
import { localizedPath } from "@/lib/locale";
import { Magnetic } from "./motion";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px w-6 bg-signal" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className="mt-4 font-display tracking-tight"
        style={{
          fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)",
          fontWeight: 500,
          lineHeight: 1.08,
        }}
      >
        {title}
      </h2>
      {intro ? (
        <p className="mt-4 text-muted-foreground" style={{ fontSize: "1.02rem", lineHeight: 1.6 }}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function TechTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md border border-border bg-secondary/50 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-signal/40 hover:bg-secondary hover:text-foreground">
      {children}
    </span>
  );
}

type ActionButtonProps = {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: "primary" | "outline";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function ActionButton({
  children,
  to,
  href,
  variant = "primary",
  className = "",
  onClick,
  type,
}: ActionButtonProps) {
  const { lang } = useI18n();
  const base =
    "group relative inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:shadow-[0_0_0_1px_var(--signal),0_8px_30px_-12px_var(--signal)] active:scale-[0.98]"
      : "border border-border text-foreground hover:border-signal/60 active:scale-[0.98]";
  const inner = (
    <>
      {children}
      {href ? (
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      ) : (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </>
  );
  const element = to ? (
    <Link to={localizedPath(to, lang)} className={`${base} ${styles} ${className}`}>
      {inner}
    </Link>
  ) : href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${base} ${styles} ${className}`}>
      {inner}
    </a>
  ) : (
    <button type={type ?? "button"} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {inner}
    </button>
  );

  return (
    <Magnetic strength={0.18} className="inline-block">
      {element}
    </Magnetic>
  );
}

export function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
      }}
    />
  );
}
