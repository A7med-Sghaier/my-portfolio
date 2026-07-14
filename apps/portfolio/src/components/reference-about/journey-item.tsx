import { useI18n } from "@portfolio/i18n";
import { ArrowUpRight, Briefcase, ChevronDown, GraduationCap } from "lucide-react";
import { AnimatePresence, motion, type MotionValue, useReducedMotion } from "motion/react";
import { type RefObject, useRef } from "react";
import { Link } from "react-router";
import type { PortfolioEducation, PortfolioExperience } from "@/lib/content";
import { useLineOpen } from "./use-line-open";

interface JourneyItemProps {
  kind: "edu" | "role";
  education?: PortfolioEducation;
  experience?: PortfolioExperience;
  href?: string;
  isCurrent: boolean;
  index: number;
  containerRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  faded?: boolean;
  threadColors?: string[];
}

export function JourneyItem({
  kind,
  education,
  experience,
  href,
  isCurrent,
  index,
  containerRef,
  progress,
  faded = false,
  threadColors = [],
}: JourneyItemProps) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const itemRef = useRef<HTMLLIElement>(null);
  const isEducation = kind === "edu";
  const title = isEducation ? education?.degree : experience?.role;
  const organization = isEducation ? education?.school : experience?.company;
  const location = isEducation ? education?.location : experience?.location;
  const subtitle = [organization, location].filter(Boolean).join(" · ");
  const period = isEducation ? education?.period : experience?.period;
  const Icon = isEducation ? GraduationCap : Briefcase;
  const highlights = experience?.achievements.slice(0, 4) ?? [];
  const canExpand = !isEducation && (Boolean(experience?.summary) || highlights.length > 0);

  const [open, setOpen] = useLineOpen(itemRef, containerRef, progress, {
    enabled: canExpand && !reduce,
    initial: Boolean(reduce && canExpand),
  });

  if (!title || !organization) return null;

  const header = (
    <>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[0.6rem] uppercase tracking-wider text-signal-2">
          {isEducation ? t("about.journey.edu") : t("about.journey.role")}
        </span>
        <span className="font-mono text-xs text-muted-foreground">{period}</span>
        {isCurrent ? (
          <span className="rounded-full bg-signal/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-signal">
            {t("about.journey.now")}
          </span>
        ) : null}
      </div>
      <h3
        className="mt-1 flex items-center gap-1.5 font-display tracking-tight"
        style={{ fontSize: "1.05rem", fontWeight: 500 }}
      >
        {title}
        {canExpand ? (
          <ChevronDown
            aria-hidden
            className={`h-3.5 w-3.5 text-signal transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        ) : href ? (
          <ArrowUpRight
            aria-hidden
            className="h-3.5 w-3.5 text-signal opacity-0 transition-opacity group-hover:opacity-100"
          />
        ) : null}
      </h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
    </>
  );

  return (
    <motion.li
      ref={itemRef}
      className="relative mb-7 list-none transition-opacity duration-300 last:mb-0"
      style={{ opacity: faded ? 0.4 : 1 }}
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: faded ? 0.4 : 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.25),
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <span className="absolute top-0 -start-10 z-[1] grid h-6 w-6 place-items-center rounded-full border border-signal/40 bg-card text-signal">
        {isCurrent && !reduce ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full border border-signal motion-reduce:hidden"
          />
        ) : null}
        <Icon aria-hidden className="h-3 w-3" />
      </span>

      {threadColors.length > 0 ? (
        <span
          aria-hidden
          className="absolute top-0 -start-[3.25rem] z-[1] flex h-6 flex-col items-center justify-center gap-1"
        >
          {threadColors.map((color) => (
            <span
              key={color}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      ) : null}

      {canExpand ? (
        <div className="group">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="block w-full rounded-lg text-start transition-colors hover:text-foreground"
          >
            {header}
          </button>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.div
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-lg border border-border bg-card/60 p-4">
                  {experience?.summary ? (
                    <p className="text-sm text-muted-foreground" style={{ lineHeight: 1.55 }}>
                      {experience.summary}
                    </p>
                  ) : null}
                  {highlights.length > 0 ? (
                    <ul className="mt-3 space-y-1.5">
                      {highlights.map((achievement) => (
                        <li
                          key={achievement}
                          className="flex gap-2 text-sm text-muted-foreground"
                          style={{ lineHeight: 1.5 }}
                        >
                          <span
                            aria-hidden
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal"
                          />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {href ? (
                    <Link
                      to={href}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-signal transition-colors hover:text-foreground"
                    >
                      {t("about.focus.cta")}
                      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : href ? (
        <Link to={href} className="group block rounded-lg transition-colors hover:text-foreground">
          {header}
        </Link>
      ) : (
        <div>{header}</div>
      )}
    </motion.li>
  );
}
