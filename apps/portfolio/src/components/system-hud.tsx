import { useI18n } from "@portfolio/i18n";
import { Activity, ChevronDown, Command } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import type { PortfolioContent } from "@/lib/content";

const nodes = [
  { path: "/", label: "root" },
  { path: "/about", label: "about" },
  { path: "/experience", label: "exp" },
  { path: "/projects", label: "work" },
  { path: "/expertise", label: "skills" },
  { path: "/resume", label: "cv" },
  { path: "/contact", label: "contact" },
] as const;

function makeSessionId() {
  return Math.random().toString(16).slice(2, 8);
}

function useUptime() {
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, []);
  const seconds = Math.floor((now - started) / 1_000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function matches(pathname: string, path: string) {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export function SystemHud({
  content,
  navigationState,
  onOpenCommand,
}: {
  content: PortfolioContent;
  navigationState: "idle" | "loading" | "submitting";
  onOpenCommand: () => void;
}) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const uptime = useUptime();
  const sessionId = useMemo(makeSessionId, []);
  const [open, setOpen] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("[data-portfolio-footer]");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  const activeIndex = nodes.findIndex((node) => matches(pathname, node.path));
  if (footerVisible) return null;
  const collapsed = !open;

  return (
    <aside
      className="pointer-events-none fixed bottom-5 left-5 z-[80] hidden select-none lg:block"
      aria-label={`${t("hud.operational")} · ${nodes[activeIndex]?.label ?? "route"}`}
    >
      <span className="sr-only">{t("hud.sessionElapsed")}</span>
      <span className="sr-only">
        {uptime}. {navigationState}. {content.projects.length}.
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {collapsed ? (
          <motion.button
            key="pill"
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 font-mono text-[0.65rem] text-muted-foreground shadow-lg shadow-black/20 backdrop-blur transition-colors hover:text-foreground disabled:opacity-0"
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            aria-label={t("hud.expand")}
          >
            <span className="relative flex h-2 w-2">
              {!reduced ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
              ) : null}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            <Activity aria-hidden className="h-3 w-3" />
          </motion.button>
        ) : (
          <motion.div
            key="panel"
            className="pointer-events-auto relative rounded-xl border border-border bg-card/80 px-3.5 py-3 pe-8 font-mono text-[0.65rem] leading-relaxed text-muted-foreground shadow-lg shadow-black/20 backdrop-blur"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded text-muted-foreground/70 outline-none transition-colors hover:text-foreground focus-visible:text-signal"
              aria-label={t("hud.collapse")}
            >
              <ChevronDown aria-hidden className="h-3 w-3" />
            </button>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {!reduced ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
                ) : null}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
              </span>
              <span
                className="font-medium uppercase text-foreground"
                style={{ fontSize: "0.72rem", letterSpacing: "0.02em" }}
              >
                {t("hud.operational")}
              </span>
              <span className="text-border">·</span>
              <span>Bavaria</span>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              {nodes.map((node, index) => {
                const active = index === activeIndex;
                return (
                  <span key={node.path} className="flex items-center gap-1.5">
                    <span
                      className={`relative grid place-items-center transition-colors ${
                        active ? "text-signal" : "text-border"
                      }`}
                      title={node.label}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-signal" : "bg-border"}`}
                      />
                      {active && !reduced ? (
                        <motion.span
                          layoutId="hud-node-glow"
                          className="absolute h-3.5 w-3.5 rounded-full bg-signal/25"
                        />
                      ) : null}
                    </span>
                    {index < nodes.length - 1 ? (
                      <span aria-hidden className="h-px w-2.5 bg-border" />
                    ) : null}
                  </span>
                );
              })}
            </div>
            <div className="mt-1.5 text-signal-2/80">{nodes[activeIndex]?.label ?? "route"}</div>

            <div className="mt-2.5 flex items-center gap-2 border-t border-border pt-2 text-[0.6rem]">
              <span>sid:{sessionId}</span>
              <span className="text-border">·</span>
              <span>up {uptime}</span>
            </div>

            <button
              type="button"
              onClick={onOpenCommand}
              className="mt-2 flex items-center gap-1.5 text-[0.6rem] text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("footer.command")}
            >
              <span className="inline-flex items-center gap-0.5 rounded border border-border px-1 py-0.5">
                <Command aria-hidden className="h-2.5 w-2.5" />K
              </span>
              <span>{t("hud.console")}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
