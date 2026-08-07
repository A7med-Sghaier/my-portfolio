import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n, type TKey } from "@portfolio/i18n";
import type { IntakeDemoEvent, ProjectRegenerationFieldName } from "@portfolio/core";
import { StageActivity, StageGlyph, type PipelineStageId } from "./pipeline-stage-activity";

// ─────────────────────────────────────────────────────────────────────────
// The main panel while a repository-intake run is in flight. The API streams
// what the pipeline observes — the repository it resolved, the README size,
// the headings it found, every field it filled and how much copy each holds —
// and this renders that stream as a log. Nothing here is invented: a line
// exists because an event arrived carrying its numbers, which is the same
// claim the rest of the page makes about the draft itself.
//
// The rotating hint beside the log is the one piece of static copy. It states
// how the running stage works, never what it is currently finding.
// ─────────────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<PipelineStageId, TKey> = {
  fetch: "ailab.stage.fetch",
  extract: "ailab.stage.extract",
  generate: "ailab.stage.generate",
  review: "ailab.stage.review",
};

const FIELD_LABELS: Record<ProjectRegenerationFieldName, TKey> = {
  title: "ailab.field.title",
  tagline: "ailab.field.tagline",
  year: "ailab.field.year",
  stack: "ailab.field.stack",
  overview: "pd.overview",
  problem: "pd.problem",
  roleDetail: "ailab.field.role",
  architecture: "pd.architecture",
  frontend: "pd.frontend",
  backend: "pd.backend",
  database: "pd.database",
  security: "pd.security",
  performance: "pd.performance",
  testing: "pd.testing",
  cicd: "pd.cicd",
  results: "pd.results",
  metrics: "ailab.field.metrics",
  note: "ailab.field.note",
};

const HINTS: Record<PipelineStageId, TKey[]> = {
  fetch: ["ailab.hint.fetch.1", "ailab.hint.fetch.2"],
  extract: ["ailab.hint.extract.1", "ailab.hint.extract.2"],
  generate: ["ailab.hint.generate.1", "ailab.hint.generate.2", "ailab.hint.generate.3"],
  review: ["ailab.hint.generate.3"],
};

const HINT_INTERVAL_MS = 5_000;

type LogLine = {
  /** Stable across re-renders: events only ever append. */
  key: string;
  text: string;
  /** Drives the marker and colour — see {@link Marker}. */
  tone: "stage" | "done" | "note" | "generated" | "source" | "ready";
};

/** Turn the streamed events into localized log lines, in arrival order. */
function useLogLines(events: IntakeDemoEvent[]): LogLine[] {
  const { t, formatNumber } = useI18n();
  return useMemo(() => {
    const lines: LogLine[] = [];
    const push = (key: string, tone: LogLine["tone"], text: string) =>
      lines.push({ key: `${lines.length}-${key}`, tone, text });

    for (const event of events) {
      if (event.type === "stage") {
        push(event.id, "stage", t(STAGE_LABELS[event.id]));
        continue;
      }
      if (event.type === "stage-done") {
        push(
          `${event.stage.id}-done`,
          "done",
          `${t(STAGE_LABELS[event.stage.id])} · ${t("ailab.stage.ms", {
            n: formatNumber(event.stage.durationMs),
          })}`,
        );
        continue;
      }
      if (event.type === "result") {
        push("ready", "ready", t("ailab.log.ready"));
        continue;
      }
      if (event.type !== "note") continue;

      const note = event.note;
      switch (note.kind) {
        case "repo": {
          push("repo", "note", t("ailab.log.repo", { name: note.fullName }));
          // Language and topic count are only worth a line when GitHub reported
          // them — an empty "·" separator would be a line about nothing.
          const meta = [
            note.language ?? "",
            note.topics > 0 ? t("ailab.log.topics", { n: formatNumber(note.topics) }) : "",
          ].filter(Boolean);
          if (meta.length > 0) push("repo-meta", "note", meta.join(" · "));
          break;
        }
        case "readme":
          push("readme", "note", t("ailab.log.readme", { n: formatNumber(note.chars) }));
          break;
        case "section":
          push(`section-${note.heading}`, "source", note.heading);
          break;
        case "sections":
          push("sections", "note", t("ailab.log.sections", { n: formatNumber(note.count) }));
          break;
        case "field": {
          const field = t(FIELD_LABELS[note.field]);
          push(
            `${note.field}-${note.generated ? "gen" : "ext"}`,
            note.generated ? "generated" : "note",
            note.items === undefined
              ? t("ailab.log.field", { field, n: formatNumber(note.chars) })
              : t("ailab.log.fieldItems", { field, n: formatNumber(note.items) }),
          );
          break;
        }
        case "grounding":
          push("grounding", "note", t("ailab.log.grounding", { n: formatNumber(note.chars) }));
          break;
        case "fallback":
          push(
            "fallback",
            "note",
            t(
              note.reason === "unavailable"
                ? "ailab.log.fallback.unavailable"
                : "ailab.log.fallback.failed",
            ),
          );
          break;
        case "review":
          push("review", "note", t("ailab.log.review", { n: formatNumber(note.notes) }));
          break;
      }
    }
    return lines;
  }, [events, t, formatNumber]);
}

const TONE_CLASS: Record<LogLine["tone"], string> = {
  stage: "text-foreground",
  done: "text-muted-foreground/70",
  note: "text-muted-foreground",
  generated: "text-[color:var(--signal-2)]",
  source: "text-muted-foreground/80",
  ready: "text-signal",
};

/** Log markers, so a line's origin is readable without colour alone. */
const MARKER: Record<LogLine["tone"], string> = {
  stage: "▸",
  done: "✓",
  note: "·",
  generated: "✦",
  source: "#",
  ready: "✓",
};

/** The rotating explanation of how the running stage works. */
function StageHint({ stage }: { stage: PipelineStageId }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const hints = HINTS[stage];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (reduceMotion || hints.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % hints.length),
      HINT_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [stage, hints.length, reduceMotion]);

  const text = t(hints[index] ?? hints[0]!);
  if (reduceMotion) {
    return <p className="text-sm leading-6 text-muted-foreground">{text}</p>;
  }
  return (
    <div className="relative min-h-12">
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          className="text-sm leading-6 text-muted-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/**
 * The live panel: the running stage, what it does, and the run's own log.
 * `caption` is already-translated copy for the footer.
 */
export function IntakeRunConsole({
  stage,
  events,
  elapsedMs,
  caption,
}: {
  stage: PipelineStageId;
  events: IntakeDemoEvent[];
  /** Time since submit — the only thing that moves while the model is thinking. */
  elapsedMs: number;
  caption: string;
}) {
  const { t, formatNumber } = useI18n();
  const reduceMotion = useReducedMotion();
  const lines = useLogLines(events);
  const logRef = useRef<HTMLDivElement>(null);

  // The newest line is the interesting one, so the log stays pinned to the
  // bottom as it grows.
  useLayoutEffect(() => {
    const element = logRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [lines.length]);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-signal/30 bg-card/40">
      {/* A scan sweeping the whole panel: negative z keeps it above the card
          background and below every line of the log. */}
      {reduceMotion ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -z-10 h-24"
          style={{
            background:
              "linear-gradient(180deg, transparent, color-mix(in oklab, var(--signal) 9%, transparent), transparent)",
          }}
          animate={{ top: ["-6rem", "100%"] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="flex items-center gap-3 border-b border-signal/25 px-5 py-3.5">
        <StageGlyph stage={stage} />
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{t(STAGE_LABELS[stage])}</p>
        <p className="shrink-0 font-mono text-[0.7rem] tabular-nums text-muted-foreground">
          {t("ailab.log.elapsed", { n: formatNumber(Math.floor(elapsedMs / 1_000)) })}
        </p>
        <div className="hidden w-24 shrink-0 sm:block sm:w-32">
          <StageActivity stage={stage} />
        </div>
      </div>

      <div className="px-5 py-4">
        <StageHint stage={stage} />
      </div>

      <div className="border-t border-border/60 px-5 py-4">
        <h3 className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
          {t("ailab.log.title")}
        </h3>
        <div
          ref={logRef}
          className="mt-2 max-h-56 overflow-y-auto overscroll-contain"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <ol className="space-y-1 font-mono text-[0.7rem] leading-5">
            {lines.map((line, index) => {
              const last = index === lines.length - 1;
              const content = (
                <>
                  <span aria-hidden className="w-3 shrink-0 opacity-60">
                    {MARKER[line.tone]}
                  </span>
                  <span className="min-w-0 break-words">{line.text}</span>
                  {last ? (
                    <motion.span
                      aria-hidden
                      className="mt-1 block h-3 w-px shrink-0 bg-signal"
                      animate={reduceMotion ? undefined : { opacity: [1, 0.1, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                </>
              );
              const className = `flex gap-2 ${TONE_CLASS[line.tone]}`;
              return reduceMotion ? (
                <li key={line.key} className={className}>
                  {content}
                </li>
              ) : (
                <motion.li
                  key={line.key}
                  className={className}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {content}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>

      <p className="border-t border-border/60 px-5 py-4 text-xs leading-5 text-muted-foreground">
        {caption}
      </p>
    </div>
  );
}
