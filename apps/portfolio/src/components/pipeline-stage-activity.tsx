import { ArrowDownToLine, ListChecks, ScanLine, Sparkles } from "lucide-react";
import { motion, type Transition } from "motion/react";
import { useI18n } from "@portfolio/i18n";

// While a repository-intake stage is running, the rail shows what that stage is
// actually doing instead of a generic spinner and its static description: bytes
// arriving, README sections being mapped, tokens being written. The same two
// pieces head the live console on the main panel. Every piece is decorative
// (aria-hidden) — the caller keeps the stage label visible and the description
// available to screen readers — and the global reduced-motion rule in
// styles.css freezes all of it, so the caller renders the static row instead.
//
// Everything here is a span: these render inside the rail's phrasing-content
// wrapper, so a div would be invalid nesting.

export type PipelineStageId = "fetch" | "extract" | "generate" | "review";

const loop = (duration: number, delay = 0): Transition => ({
  duration,
  delay,
  repeat: Infinity,
  ease: "easeInOut",
});

const SIGNAL = "color-mix(in oklab, var(--signal) 85%, transparent)";

/** Icon slot: the stage's own glyph, moving, inside a breathing halo. */
export function StageGlyph({ stage }: { stage: PipelineStageId }) {
  const Icon =
    stage === "fetch"
      ? ArrowDownToLine
      : stage === "extract"
        ? ScanLine
        : stage === "generate"
          ? Sparkles
          : ListChecks;

  return (
    <span aria-hidden className="relative grid h-4 w-4 place-items-center">
      <motion.span
        className="absolute inset-[-0.3rem] rounded-full border border-signal/50"
        animate={{ scale: [0.7, 1.15], opacity: [0.55, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.span
        className="grid place-items-center text-signal"
        animate={
          stage === "fetch"
            ? { y: [-1.5, 1.5, -1.5] }
            : stage === "generate"
              ? { scale: [1, 1.16, 1], rotate: [0, 8, 0] }
              : { opacity: [0.55, 1, 0.55] }
        }
        transition={loop(stage === "fetch" ? 1.2 : 1.6)}
      >
        <Icon className="h-4 w-4" />
      </motion.span>
    </span>
  );
}

/** Fetch: packets travelling from the repository to the pipeline. */
function FetchActivity() {
  return (
    <span className="relative block h-4">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      <span className="absolute start-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-sm border border-border bg-card" />
      <span className="absolute end-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full border border-signal/60" />
      {[0, 0.45, 0.9].map((delay) => (
        <motion.span
          key={delay}
          className="absolute top-1/2 block h-1 w-1 -translate-y-1/2 rounded-full"
          style={{ background: SIGNAL }}
          animate={{ left: ["4%", "94%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.35, delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </span>
  );
}

// Section widths of a plausible README, so the cascade reads as real structure
// being walked rather than as four identical loading bars.
const EXTRACT_ROWS = [0.92, 0.64, 0.8, 0.5];

/** Extraction: README sections filling in, one after another, no model. */
function ExtractActivity() {
  return (
    <span className="block space-y-1">
      {EXTRACT_ROWS.map((width, index) => (
        <span
          key={width}
          className="block h-[3px] overflow-hidden rounded-full bg-secondary"
          style={{ width: `${width * 100}%` }}
        >
          <motion.span
            className="block h-full rounded-full"
            style={{ background: SIGNAL, originX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0.4, 1, 1, 0.4] }}
            transition={{
              duration: 2.2,
              delay: index * 0.22,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.35, 0.75, 1],
            }}
          />
        </span>
      ))}
    </span>
  );
}

/** Grounded generation: copy being written a token at a time. */
function GenerateActivity() {
  return (
    <span className="block space-y-1.5">
      <span className="relative block h-[3px] overflow-hidden rounded-full bg-secondary">
        <motion.span
          className="absolute inset-y-0 block w-1/3 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${SIGNAL}, transparent)` }}
          animate={{ left: ["-33%", "100%"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      <span className="flex items-center gap-1">
        <motion.span
          className="block h-[3px] rounded-full"
          style={{ background: SIGNAL }}
          animate={{ width: ["12%", "58%", "34%", "76%"] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="block h-2.5 w-px bg-signal"
          animate={{ opacity: [1, 0.15, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </span>
    </span>
  );
}

/** Operator review: checklist items being ticked off by hand. */
function ReviewActivity() {
  return (
    <span className="block space-y-1">
      {[0, 1, 2].map((index) => (
        <span key={index} className="flex items-center gap-1.5">
          <motion.span
            className="block h-1.5 w-1.5 shrink-0 rounded-[2px] border border-signal/60"
            animate={{ background: ["transparent", SIGNAL, "transparent"] }}
            transition={loop(2.4, index * 0.3)}
          />
          <motion.span
            className="block h-[3px] rounded-full bg-secondary"
            style={{ width: `${72 - index * 14}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={loop(2.4, index * 0.3)}
          />
        </span>
      ))}
    </span>
  );
}

/**
 * The animated stand-in for a running stage's description. Horizontal motion is
 * mirrored under RTL so packets and the writing caret still travel with the
 * reading direction in Arabic.
 */
export function StageActivity({ stage }: { stage: PipelineStageId }) {
  const { direction } = useI18n();

  return (
    <span
      aria-hidden
      className="block"
      style={direction === "rtl" ? { transform: "scaleX(-1)" } : undefined}
    >
      {stage === "fetch" ? (
        <FetchActivity />
      ) : stage === "extract" ? (
        <ExtractActivity />
      ) : stage === "generate" ? (
        <GenerateActivity />
      ) : (
        <ReviewActivity />
      )}
    </span>
  );
}
