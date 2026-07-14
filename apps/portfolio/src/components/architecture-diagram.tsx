import { useI18n, type TKey } from "@portfolio/i18n";
import {
  Activity,
  Boxes,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Layout,
  Loader2,
  Network,
  Play,
  Server,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PortfolioProject } from "@/lib/content";

function classify(line: string): { icon: typeof Layout; kind: TKey } {
  const value = line.toLowerCase();
  if (/(react|angular|frontend|vite|storybook|marketing|ui)/.test(value)) {
    return { icon: Layout, kind: "arch.kind.client" };
  }
  if (/(falcon|nest|express|node|api|backend|services|strapi)/.test(value)) {
    return { icon: Server, kind: "arch.kind.service" };
  }
  if (/(mongodb|postgres|sql|jsonb|datastore|storage|database|persistence)/.test(value)) {
    return { icon: Database, kind: "arch.kind.data" };
  }
  if (/(ml|model|prediction|seed|pipeline|deterministic)/.test(value)) {
    return { icon: Cpu, kind: "arch.kind.intelligence" };
  }
  if (/(jwt|auth|bcrypt|security|health)/.test(value)) {
    return { icon: ShieldCheck, kind: "arch.kind.security" };
  }
  if (/(docker|compose|environment|container)/.test(value)) {
    return { icon: Boxes, kind: "arch.kind.runtime" };
  }
  if (/(ci|actions|jenkins|gitlab|deploy|workflow)/.test(value)) {
    return { icon: GitBranch, kind: "arch.kind.delivery" };
  }
  if (/(websocket|real-time|event|mailpit)/.test(value)) {
    return { icon: Activity, kind: "arch.kind.realtime" };
  }
  if (/(rest|network|matching)/.test(value)) {
    return { icon: Network, kind: "arch.kind.interface" };
  }
  return { icon: Layers, kind: "arch.kind.layer" };
}

export function ArchitectureDiagram({ project }: { project: PortfolioProject }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const layers = project.architecture;
  const canObserve = typeof IntersectionObserver !== "undefined";
  const [running, setRunning] = useState(false);
  const [activeNode, setActiveNode] = useState(-1);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    },
    [],
  );

  const run = () => {
    if (running || layers.length === 0) return;
    clearTimers();
    setRunning(true);
    setActiveNode(0);

    const step = reduce ? 260 : 520;
    layers.slice(1).forEach((_, index) => {
      timers.current.push(window.setTimeout(() => setActiveNode(index + 1), (index + 1) * step));
    });
    timers.current.push(
      window.setTimeout(
        () => {
          setActiveNode(-1);
          setRunning(false);
        },
        layers.length * step + 400,
      ),
    );
  };

  if (layers.length === 0) return null;

  return (
    <figure
      className="relative overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8"
      aria-label={`${t("arch.caption")} — ${project.title}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line, var(--mk-grid-line)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mb-6 flex items-center justify-between gap-3">
        <figcaption className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-signal">
          <Network aria-hidden className="h-3.5 w-3.5" />
          {t("arch.caption")}
        </figcaption>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg border border-signal/30 bg-signal/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-wider text-signal transition-colors hover:bg-signal/20 disabled:opacity-70"
        >
          {running ? (
            <>
              <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
              {t("arch.tracing")}
            </>
          ) : (
            <>
              <Play aria-hidden className="h-3.5 w-3.5" />
              {t("arch.run")}
            </>
          )}
        </button>
      </div>

      <div
        role="region"
        aria-label={t("arch.caption")}
        tabIndex={0}
        className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal"
      >
        <p className="sr-only" role="status" aria-live="polite">
          {activeNode >= 0 ? layers[activeNode] : ""}
        </p>
        <ol className="relative flex flex-col gap-3">
          {layers.map((line, index) => {
            const { icon: Icon, kind } = classify(line);
            const active = index === activeNode;
            const past = running && activeNode > index;

            return (
              <motion.li
                key={`${index}-${line}`}
                className="relative flex items-start gap-4"
                initial={reduce || !canObserve ? false : { opacity: 0, x: -12 }}
                animate={canObserve ? undefined : { opacity: 1, x: 0 }}
                whileInView={canObserve ? { opacity: 1, x: 0 } : undefined}
                viewport={canObserve ? { once: true, margin: "-40px" } : undefined}
                transition={{
                  duration: 0.4,
                  delay: reduce ? 0 : index * 0.07,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <div className="relative flex flex-col items-center">
                  <motion.span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border text-signal transition-colors ${
                      active ? "border-signal bg-signal/25" : "border-signal/30 bg-signal/10"
                    }`}
                    animate={active && !reduce ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                    {active ? (
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-lg ring-2 ring-signal"
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        transition={{ duration: 0.6 }}
                      />
                    ) : null}
                  </motion.span>
                  {index < layers.length - 1 ? (
                    <span
                      aria-hidden
                      className="relative mt-1 h-[calc(100%-1.5rem)] w-px flex-1 overflow-hidden bg-gradient-to-b from-signal/50 to-signal-2/30"
                    >
                      {active && !reduce ? (
                        <motion.span
                          className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-signal shadow-[0_0_8px_var(--signal)]"
                          initial={{ top: "-8px", opacity: 0 }}
                          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                          transition={{ duration: 0.5, ease: "easeIn" }}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </div>

                <div
                  className={`flex-1 rounded-lg border px-4 py-3 transition-colors ${
                    active
                      ? "border-signal/50 bg-signal/[0.06]"
                      : past
                        ? "border-border bg-background/80"
                        : "border-border bg-background/60"
                  }`}
                >
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-signal-2">
                    {t(kind)}
                  </span>
                  <p className="mt-0.5 text-sm text-foreground" style={{ lineHeight: 1.5 }}>
                    {line}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
