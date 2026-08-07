import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CircleCheck,
  CircleDashed,
  CircleSlash,
  FileSearch,
  FlaskConical,
  GitBranch,
  ListChecks,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useI18n, type TKey } from "@portfolio/i18n";
import type {
  IntakeDemo,
  IntakeDemoEvent,
  IntakeDemoScores,
  IntakeDemoStage,
} from "@portfolio/core";
import { ApiError } from "@portfolio/db/client";
import { IntakeRunConsole } from "@/components/intake-run-console";
import { StageActivity, StageGlyph } from "@/components/pipeline-stage-activity";
import { PageBackdrop } from "@/components/reference-about/page-backdrop";
import { CountUp, Reveal } from "@/components/reference-home/motion";
import { Eyebrow, TechTag } from "@/components/reference-home/ui";
import { getApiClient } from "@/lib/api";
import { personStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

// The public window into the studio's repository-intake pipeline: paste a
// public GitHub repository, watch the same fetch → extract → generate →
// review flow the admin uses produce a draft case study. Nothing is stored.

type StageId = IntakeDemoStage["id"] | "review";

const STAGES: Array<{ id: StageId; label: TKey; sub: TKey }> = [
  { id: "fetch", label: "ailab.stage.fetch", sub: "ailab.stage.fetch.sub" },
  { id: "extract", label: "ailab.stage.extract", sub: "ailab.stage.extract.sub" },
  { id: "generate", label: "ailab.stage.generate", sub: "ailab.stage.generate.sub" },
  { id: "review", label: "ailab.stage.review", sub: "ailab.stage.review.sub" },
];

// While the request is in flight the rail advances on elapsed time; fetch and
// extraction are fast, so past a few seconds the model is what's working.
const PENDING_THRESHOLDS: Array<{ id: StageId; afterMs: number }> = [
  { id: "fetch", afterMs: 0 },
  { id: "extract", afterMs: 2_500 },
  { id: "generate", afterMs: 4_000 },
];

// Shared by the rail and the main panel so both name the same running stage.
function pendingStageId(elapsedMs: number): StageId {
  return (
    [...PENDING_THRESHOLDS].reverse().find((entry) => elapsedMs >= entry.afterMs)?.id ?? "fetch"
  );
}

const TEXT_SECTIONS: Array<{ field: keyof IntakeDemo["draft"]; label: TKey }> = [
  { field: "overview", label: "pd.overview" },
  { field: "problem", label: "pd.problem" },
  { field: "roleDetail", label: "ailab.field.role" },
  { field: "frontend", label: "pd.frontend" },
  { field: "backend", label: "pd.backend" },
  { field: "database", label: "pd.database" },
  { field: "security", label: "pd.security" },
  { field: "performance", label: "pd.performance" },
  { field: "testing", label: "pd.testing" },
  { field: "cicd", label: "pd.cicd" },
  { field: "note", label: "ailab.field.note" },
];

const LIST_SECTIONS: Array<{ field: "architecture" | "results"; label: TKey }> = [
  { field: "architecture", label: "pd.architecture" },
  { field: "results", label: "pd.results" },
];

const ERROR_KEYS: Record<string, TKey> = {
  invalid_repository: "ailab.error.invalid",
  repository_not_public: "ailab.error.private",
  repository_unreachable: "ailab.error.unreachable",
  rate_limited: "ailab.error.rate",
};

function FieldBadge({ generated }: { generated: boolean }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-wide ${
        generated
          ? "bg-[color:var(--signal-2)]/12 text-[color:var(--signal-2)]"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {generated ? <Sparkles aria-hidden className="h-2.5 w-2.5" /> : null}
      {t(generated ? "ailab.badge.ai" : "ailab.badge.extracted")}
    </span>
  );
}

function StageRail({
  pending,
  currentPending,
  result,
}: {
  pending: boolean;
  /** The stage the run reports as running — the rail marks earlier ones done. */
  currentPending: StageId;
  result: IntakeDemo | null;
}) {
  const { t, formatNumber } = useI18n();
  const reduceMotion = useReducedMotion();

  return (
    <ol className="space-y-3">
      {STAGES.map((stage) => {
        const reported = result?.stages.find((entry) => entry.id === stage.id);
        const state: "idle" | "running" | "ok" | "skipped" | "failed" = pending
          ? currentPending === stage.id
            ? "running"
            : // Order by the full STAGES list, not PENDING_THRESHOLDS (which omits
              // "review"): otherwise findIndex returns -1 for review and it always
              // renders "ok" — showing a check before generation has finished.
              STAGES.findIndex((entry) => entry.id === stage.id) <
                STAGES.findIndex((entry) => entry.id === currentPending)
              ? "ok"
              : "idle"
          : result
            ? stage.id === "review"
              ? "ok"
              : (reported?.status ?? "skipped")
            : "idle";
        // A running stage animates what it is doing; with reduced motion it
        // falls back to the spinner and the plain description.
        const animated = state === "running" && !reduceMotion;
        return (
          <li
            key={stage.id}
            className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
              state === "running"
                ? "border-signal/50 bg-signal/5"
                : state === "ok"
                  ? "border-border bg-card"
                  : "border-border bg-card/50"
            }`}
          >
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                state === "ok"
                  ? "text-signal"
                  : state === "running"
                    ? "text-signal"
                    : state === "failed"
                      ? "text-destructive"
                      : "text-muted-foreground/60"
              }`}
            >
              {animated ? (
                <StageGlyph stage={stage.id} />
              ) : state === "running" ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : state === "ok" ? (
                <CircleCheck aria-hidden className="h-4 w-4" />
              ) : state === "skipped" ? (
                <CircleSlash aria-hidden className="h-4 w-4" />
              ) : (
                <CircleDashed aria-hidden className="h-4 w-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{t(stage.label)}</span>
                {reported && !pending ? (
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    {reported.status === "ok"
                      ? t("ailab.stage.ms", { n: formatNumber(reported.durationMs) })
                      : t(
                          reported.status === "skipped"
                            ? "ailab.stage.skipped"
                            : "ailab.stage.failed",
                        )}
                  </span>
                ) : null}
              </span>
              {animated ? (
                <span className="mt-1.5 flex min-h-9 flex-col justify-center">
                  <span className="sr-only">{t(stage.sub)}</span>
                  <StageActivity stage={stage.id} />
                </span>
              ) : (
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {t(stage.sub)}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// A score is only as good as the palette it is read through: teal reads
// "fine", amber "look at this", red "the repository did not give us enough".
// Anything finer-grained would imply a precision these counts do not have.
function scoreTone(value: number): string {
  if (value >= 70) return "var(--signal)";
  if (value >= 40) return "var(--signal-2)";
  return "var(--destructive)";
}

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ReadinessRing({ value }: { value: number }) {
  const { t } = useI18n();
  const tone = scoreTone(value);
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t("ailab.scores.readiness")}
      className="relative shrink-0"
      style={{ width: "7rem", height: "7rem" }}
    >
      <svg aria-hidden viewBox="0 0 112 112" className="h-full w-full -rotate-90">
        <circle
          cx="56"
          cy="56"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="7"
          className="stroke-border"
        />
        <circle
          cx="56"
          cy="56"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          stroke={tone}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
          className="motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <CountUp
            immediate
            value={value}
            className="font-display text-2xl font-semibold tracking-tight"
          />
          <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-wider text-muted-foreground">
            {t("ailab.scores.readiness")}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreMeter({ label, value, caption }: { label: string; value: number; caption: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium">{label}</span>
        <CountUp immediate value={value} className="font-mono text-xs text-muted-foreground" />
      </div>
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary"
      >
        <div
          className="h-full rounded-full motion-reduce:transition-none"
          style={{
            width: `${value}%`,
            background: scoreTone(value),
            transition: "width 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <p className="mt-1.5 text-[0.68rem] leading-4 text-muted-foreground">{caption}</p>
    </div>
  );
}

// The page claims the pipeline only writes what it can trace back to the
// repository. This measures that claim rather than restating it: every number
// below is a count taken from the run the visitor just watched.
function Scorecard({ scores, readmeChars }: { scores: IntakeDemoScores; readmeChars: number }) {
  const { t, formatNumber } = useI18n();
  const { detail } = scores;
  const meters = [
    {
      label: t("ailab.scores.grounding"),
      value: scores.grounding,
      caption:
        detail.wordsChecked > 0
          ? t("ailab.scores.grounding.sub", { n: formatNumber(detail.wordsChecked) })
          : t("ailab.scores.grounding.verbatim"),
    },
    {
      label: t("ailab.scores.coverage"),
      value: scores.coverage,
      caption: t("ailab.scores.coverage.sub", {
        n: formatNumber(detail.fieldsFilled),
        total: formatNumber(detail.fieldsTotal),
      }),
    },
    {
      label: t("ailab.scores.source"),
      value: scores.source,
      caption: t("ailab.scores.source.sub", {
        n: formatNumber(detail.readmeSections),
        chars: formatNumber(readmeChars),
      }),
    },
    {
      label: t("ailab.scores.lift"),
      value: scores.lift,
      caption: t("ailab.scores.lift.sub", { n: formatNumber(detail.fieldsGenerated) }),
    },
  ];

  return (
    <section className="mb-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
        {t("ailab.scores.title")}
      </h2>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <ReadinessRing value={scores.readiness} />
        <div className="grid w-full min-w-0 flex-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {meters.map((meter) => (
            <ScoreMeter key={meter.label} {...meter} />
          ))}
        </div>
      </div>
      <p className="mt-5 border-t border-border pt-3 text-[0.62rem] leading-4 text-muted-foreground">
        {t("ailab.scores.note", { n: formatNumber(detail.reviewNotes) })}
      </p>
    </section>
  );
}

// Below this, the draft is thin because the README was thin — not because the
// run underperformed. Presenting a near-empty card as a finished case study
// invites the wrong reading, so the page leads with which one it was and names
// the sections the repository never published.
const THIN_COVERAGE = 50;

function ThinSourceNotice({ result }: { result: IntakeDemo }) {
  const { t, formatNumber } = useI18n();
  const { detail } = result.scores;
  const missing = [...TEXT_SECTIONS, ...LIST_SECTIONS]
    .filter((section) => {
      const value = result.draft[section.field];
      return Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim();
    })
    .map((section) => t(section.label));

  return (
    <section className="mb-4 rounded-xl border border-[color:var(--signal-2)]/40 bg-[color:var(--signal-2)]/5 p-4">
      <div className="flex items-start gap-3">
        <FileSearch aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--signal-2)]" />
        <div className="min-w-0">
          <h2 className="text-sm font-medium">{t("ailab.thin.title")}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t("ailab.thin.body", {
              n: formatNumber(detail.fieldsFilled),
              total: formatNumber(detail.fieldsTotal),
            })}
          </p>
          {missing.length > 0 ? (
            <>
              <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                {t("ailab.thin.missing")}
              </p>
              {/* Chips, not a comma sentence: a thin README routinely leaves a
                  dozen fields empty, and that reads as a wall of prose. */}
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {missing.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-dashed border-border px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-wide text-muted-foreground"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DraftPreview({ result }: { result: IntakeDemo }) {
  const { t } = useI18n();
  const generated = new Set<string>(result.generatedFields);
  const textSections = TEXT_SECTIONS.map((section) => ({
    ...section,
    value: (result.draft[section.field] ?? "") as string,
  })).filter((section) => section.value.trim().length > 0);
  const listSections = LIST_SECTIONS.map((section) => ({
    ...section,
    items: result.draft[section.field],
  })).filter((section) => section.items.length > 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="border-b border-border p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground">
            {t("ailab.result.draft")}
          </span>
          <FieldBadge generated={generated.has("title")} />
          {result.draft.year ? (
            <span className="font-mono text-xs text-muted-foreground">{result.draft.year}</span>
          ) : null}
        </div>
        <h2
          className="mt-3 font-display tracking-tight"
          style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 500, lineHeight: 1.1 }}
        >
          {result.draft.title}
        </h2>
        {result.draft.tagline ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {result.draft.tagline}
          </p>
        ) : null}
        {result.draft.stack.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {result.draft.stack.map((item) => (
              <TechTag key={item}>{item}</TechTag>
            ))}
            <FieldBadge generated={generated.has("stack")} />
          </div>
        ) : null}
      </header>

      <div className="space-y-6 p-6">
        {result.draft.metrics.length > 0 ? (
          <section>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
                {t("ailab.field.metrics")}
              </h3>
              <FieldBadge generated={generated.has("metrics")} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {result.draft.metrics.map((metric) => (
                <div
                  key={`${metric.value}-${metric.label}`}
                  className="rounded-xl border border-border bg-secondary/20 p-4"
                >
                  <p className="font-display text-xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {textSections.map((section) => (
          <section key={section.field}>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
                {t(section.label)}
              </h3>
              <FieldBadge generated={generated.has(section.field)} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {section.value}
            </p>
          </section>
        ))}

        {listSections.map((section) => (
          <section key={section.field}>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
                {t(section.label)}
              </h3>
              <FieldBadge generated={generated.has(section.field)} />
            </div>
            <ul className="mt-2 space-y-1.5">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                  <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}

export function AiLabPage() {
  const { content, locale } = usePortfolioData();
  const { t, formatNumber } = useI18n();
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [result, setResult] = useState<IntakeDemo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<IntakeDemoEvent[]>([]);
  const runRef = useRef(0);
  // The stream reports which stage is actually running; the elapsed-time
  // heuristic only stands in until the first event arrives (or for an API that
  // answers the non-streaming route).
  const streamedStage = events.reduce<StageId | null>(
    (current, event) => (event.type === "stage" ? event.id : current),
    null,
  );
  const runningStage = streamedStage ?? pendingStageId(elapsedMs);

  useEffect(() => {
    if (!pending) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 500);
    return () => window.clearInterval(timer);
  }, [pending]);

  async function runDemo(value: string, run: number): Promise<IntakeDemo> {
    const client = getApiClient();
    // Grounded generation on a local model is slow by design; the signal
    // outlives the server-side generation timeout.
    const signal = AbortSignal.timeout(150_000);
    try {
      return await client.streamIntakeDemo(
        value,
        (event) => {
          if (runRef.current === run) setEvents((current) => [...current, event]);
        },
        signal,
      );
    } catch (caught) {
      // An API deployed without the streaming route still answers the plain
      // one — the run then arrives in a single piece, with no live log.
      if (caught instanceof ApiError && caught.code === "route_not_found") {
        return client.runIntakeDemo(value, signal);
      }
      throw caught;
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = url.trim();
    if (!value || pending) return;
    const run = ++runRef.current;
    setPending(true);
    setElapsedMs(0);
    setError(null);
    setResult(null);
    setEvents([]);
    void runDemo(value, run)
      .then((demo) => {
        if (runRef.current !== run) return;
        setResult(demo);
      })
      .catch((caught: unknown) => {
        if (runRef.current !== run) return;
        const key = caught instanceof ApiError ? ERROR_KEYS[caught.code] : undefined;
        setError(t(key ?? "ailab.error.failed"));
      })
      .finally(() => {
        if (runRef.current === run) setPending(false);
      });
  }

  return (
    <>
      <Seo
        title={t("ailab.eyebrow")}
        description={t("ailab.intro")}
        siteName={content.profile?.name}
        path="/ai-lab"
        locale={locale}
        structuredData={personStructuredData(content.profile)}
      />
      <div className="relative isolate mx-auto max-w-6xl px-5 pb-16 pt-32">
        <PageBackdrop motif="neural" />
        <Eyebrow>{t("ailab.eyebrow")}</Eyebrow>
        <h1
          className="mt-4 max-w-3xl font-display tracking-tight"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 500, lineHeight: 1.03 }}
        >
          {t("ailab.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.6 }}>
          {t("ailab.intro")}
        </p>

        <form onSubmit={onSubmit} className="mt-10 max-w-2xl">
          <label
            htmlFor="ailab-url"
            className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
          >
            {t("ailab.form.label")}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <GitBranch
                aria-hidden
                className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id="ailab-url"
                type="url"
                dir="ltr"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder={t("ailab.form.ph")}
                maxLength={2_048}
                required
                className="w-full rounded-xl border border-border bg-card py-3 pe-4 ps-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-signal/60"
              />
            </div>
            <button
              type="submit"
              disabled={pending || !url.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-medium text-signal-foreground transition-opacity disabled:opacity-50"
            >
              {pending ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : (
                <Play aria-hidden className="h-4 w-4 rtl:rotate-180" />
              )}
              {t(pending ? "ailab.running" : "ailab.run")}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("ailab.note.private")}</p>
          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </form>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0">
            {result ? (
              <Reveal>
                <div
                  className={`mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
                    result.mode === "generated"
                      ? "border-[color:var(--signal-2)]/40 bg-[color:var(--signal-2)]/5"
                      : "border-border bg-card"
                  }`}
                >
                  <Sparkles
                    aria-hidden
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      result.mode === "generated"
                        ? "text-[color:var(--signal-2)]"
                        : "text-muted-foreground"
                    }`}
                  />
                  <p className="text-muted-foreground">
                    {result.mode === "generated"
                      ? t("ailab.mode.generated", {
                          n: formatNumber(result.generatedFields.length),
                        })
                      : t("ailab.mode.extracted")}
                  </p>
                </div>
                {result.scores.coverage < THIN_COVERAGE ? (
                  <ThinSourceNotice result={result} />
                ) : null}
                <Scorecard scores={result.scores} readmeChars={result.repo.readmeChars} />
                <DraftPreview result={result} />
              </Reveal>
            ) : pending ? (
              // The wait is long enough (a local model, grounded) that an empty
              // box reads as a stall — so the panel narrates the run itself.
              <IntakeRunConsole
                stage={runningStage}
                events={events}
                elapsedMs={elapsedMs}
                caption={t("ailab.waiting")}
              />
            ) : (
              <div className="grid min-h-[20rem] place-items-center rounded-2xl border border-dashed border-border p-8 text-center">
                <div>
                  <FlaskConical aria-hidden className="mx-auto h-8 w-8 text-muted-foreground/60" />
                  <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                    {pending ? t("ailab.waiting") : t("ailab.placeholder")}
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <section>
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {t("ailab.pipeline")}
              </h2>
              <div className="mt-3">
                <StageRail pending={pending} currentPending={runningStage} result={result} />
              </div>
            </section>

            {result ? (
              <Reveal>
                <section className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <ListChecks aria-hidden className="h-4 w-4 text-signal" />
                    <h2 className="text-sm font-medium">{t("ailab.review.title")}</h2>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t("ailab.review.sub")}
                  </p>
                  {result.review.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {result.review.map((note) => (
                        <li
                          key={note}
                          className="flex gap-2 text-xs leading-5 text-muted-foreground"
                        >
                          <CircleDashed
                            aria-hidden
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal"
                          />
                          {note}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              </Reveal>
            ) : null}

            {result ? (
              <Reveal>
                <section className="rounded-xl border border-border bg-card p-4">
                  <h2 className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                    {t("ailab.repo.title")}
                  </h2>
                  <a
                    href={result.repo.url}
                    target="_blank"
                    rel="noreferrer"
                    dir="ltr"
                    className="mt-1.5 block truncate font-mono text-sm text-signal hover:underline"
                  >
                    {result.repo.fullName}
                  </a>
                  {result.repo.description ? (
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                      {result.repo.description}
                    </p>
                  ) : null}
                  <p className="mt-2 font-mono text-[0.62rem] text-muted-foreground">
                    {[
                      result.repo.language ?? "",
                      t("ailab.repo.readme", { n: formatNumber(result.repo.readmeChars) }),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </section>
              </Reveal>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
