import { useI18n } from "@portfolio/i18n";
import { MapPin } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { PortfolioExperience } from "@/lib/content";
import { TechTag } from "./ui";

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function tenure(startIso: string, period: string): string {
  const start = startIso.match(/(\d{4})-(\d{2})/);
  if (!start) return "";
  const startYear = Number(start[1]);
  const startMonth = Number(start[2]);
  if (!Number.isFinite(startYear) || !Number.isFinite(startMonth)) return "";
  const startValue = startYear * 12 + (startMonth - 1);
  let endValue: number;

  if (/present/i.test(period)) {
    const now = new Date();
    endValue = now.getFullYear() * 12 + now.getMonth();
  } else {
    const tail = period.split(/[—–-]/).pop()?.trim() ?? "";
    const end = tail.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/);
    if (!end) return "";
    const endMonth = end[1]?.toLowerCase() ?? "";
    endValue = Number(end[2]) * 12 + Math.max(0, months.indexOf(endMonth));
  }

  const monthCount = Math.max(1, endValue - startValue + 1);
  const years = Math.floor(monthCount / 12);
  const remainder = monthCount % 12;
  return (
    [years ? `${years}y` : "", remainder ? `${remainder}m` : ""].filter(Boolean).join(" ") || "1m"
  );
}

function useLineOpen(
  itemRef: RefObject<HTMLElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  progress: MotionValue<number>,
  {
    iconOffset = 12,
    enabled = true,
    initial = false,
  }: { iconOffset?: number; enabled?: boolean; initial?: boolean } = {},
) {
  const [open, setOpen] = useState(initial);

  const evaluate = useCallback(
    (value: number) => {
      if (!enabled) return;
      const item = itemRef.current;
      const container = containerRef.current;
      if (!item || !container) return;
      setOpen(value * container.clientHeight >= item.offsetTop + iconOffset);
    },
    [containerRef, enabled, iconOffset, itemRef],
  );

  useMotionValueEvent(progress, "change", evaluate);
  useEffect(() => {
    evaluate(progress.get());
  }, [evaluate, progress]);

  return open;
}

function TimelineItem({
  experience,
  containerRef,
  progress,
}: {
  experience: PortfolioExperience;
  containerRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const hasDetail = experience.achievements.length > 0 || Boolean(experience.summary);
  const current = /present/i.test(experience.period) || experience.end === "present";
  const duration = tenure(experience.start, experience.period);
  const reached = useLineOpen(ref, containerRef, progress, {
    iconOffset: 12,
    enabled: !reduce,
    initial: Boolean(reduce),
  });
  const active = reached || current;
  const open = reached && hasDetail;

  return (
    <div ref={ref} id={`tl-${experience.id}`} data-node className="relative ps-10 scroll-mt-28">
      <span className="absolute start-[3px] top-1 z-10 grid h-4 w-4 place-items-center">
        {current && !reduce ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-signal/30 motion-reduce:hidden"
          />
        ) : null}
        <motion.span
          aria-hidden
          className={`h-3 w-3 rounded-full border-2 transition-colors duration-300 ${active ? "border-signal bg-signal" : "border-border bg-background"}`}
          animate={{
            scale: active ? 1.18 : 1,
            boxShadow: active
              ? "0 0 0 4px color-mix(in oklch, var(--signal) 18%, transparent)"
              : "0 0 0 0 transparent",
          }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 20 }}
        />
      </span>

      <div className="pb-10">
        <div
          className={`relative rounded-lg ps-4 transition-all duration-300 ${active ? "bg-signal/[0.045]" : "bg-transparent"} ${open ? "pb-4 pt-3" : "py-1"}`}
        >
          <motion.span
            aria-hidden
            className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-gradient-to-b from-signal to-signal-2/50"
            initial={false}
            animate={{ opacity: active ? 1 : 0, scaleY: active ? 1 : 0.4 }}
            style={{ originY: 0.5 }}
            transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`font-display tracking-tight transition-colors duration-300 ${active ? "text-foreground" : "text-foreground/85"}`}
                  style={{ fontSize: "1.2rem", fontWeight: 500 }}
                >
                  {experience.role}
                </h3>
                {current ? (
                  <span className="rounded-full bg-signal/15 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wide text-signal">
                    {t("ui.current")}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-foreground/80">{experience.company}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                <span>{experience.period}</span>
                {duration ? <span className="text-signal-2">{duration}</span> : null}
                {experience.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {experience.location}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <motion.div
            initial={false}
            animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
            transition={{
              duration: reduce ? 0 : 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {experience.summary ? (
                <p className="max-w-2xl text-sm text-muted-foreground" style={{ lineHeight: 1.6 }}>
                  {experience.summary}
                </p>
              ) : null}
              {experience.achievements.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {experience.achievements.map((achievement) => (
                    <li
                      key={achievement}
                      className="flex gap-2.5 text-sm text-muted-foreground"
                      style={{ lineHeight: 1.55 }}
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {experience.tech.map((technology) => (
                  <TechTag key={technology}>{technology}</TechTag>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function yearOf(experience: PortfolioExperience): string {
  return experience.start.match(/\d{4}/)?.[0] ?? experience.period.match(/\d{4}/)?.[0] ?? "";
}

export function Timeline({ experiences }: { experiences: PortfolioExperience[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 30%", "end 70%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const groups: { year: string; items: PortfolioExperience[] }[] = [];

  for (const experience of experiences) {
    const year = yearOf(experience);
    const last = groups[groups.length - 1];
    if (last?.year === year) last.items.push(experience);
    else groups.push({ year, items: [experience] });
  }

  return (
    <div ref={ref} className="relative">
      <div className="absolute start-[11px] top-0 h-full w-px bg-border" aria-hidden />
      <motion.div
        className="absolute start-[11px] top-0 w-px origin-top bg-signal"
        style={{ scaleY, height: "100%" }}
        aria-hidden
      />

      <div>
        {groups.map((group) => (
          <div key={`${group.year}-${group.items[0]?.id ?? "experience"}`}>
            <div className="sticky top-24 z-20 mb-4 flex items-center gap-3 bg-background py-2">
              <span className="ps-10 font-mono text-xs uppercase tracking-widest text-signal-2">
                {group.year}
              </span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>
            {group.items.map((experience) => (
              <TimelineItem
                key={experience.id}
                experience={experience}
                containerRef={ref}
                progress={scaleY}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
