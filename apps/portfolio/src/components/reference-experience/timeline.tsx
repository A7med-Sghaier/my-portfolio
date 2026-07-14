import { useI18n } from "@portfolio/i18n";
import { MapPin } from "lucide-react";
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import { type RefObject, useRef, useState } from "react";
import { useLineOpen } from "@/components/reference-about/use-line-open";
import { TechTag } from "@/components/reference-home/ui";
import type { PortfolioExperience } from "@/lib/content";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function monthIndex(value: string): number | null {
  const iso = value.match(/(\d{4})-(\d{2})/);
  if (iso?.[1] && iso[2]) return Number(iso[1]) * 12 + Number(iso[2]) - 1;

  const named = value.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (!named?.[1] || !named[2]) return null;
  return Number(named[2]) * 12 + Math.max(0, MONTHS.indexOf(named[1].toLowerCase()));
}

function isExplicitlyCurrent(experience: PortfolioExperience): boolean {
  return (
    experience.end?.toLowerCase() === "present" ||
    /present|heute|gegenwart|présent|actuel|حتى الآن|الآن/i.test(experience.period)
  );
}

function tenure(experience: PortfolioExperience, current: boolean): string {
  const startMonth = monthIndex(experience.start);
  if (startMonth === null) return "";

  let endMonth: number | null = null;
  if (current) {
    const now = new Date();
    endMonth = now.getFullYear() * 12 + now.getMonth();
  } else if (experience.end) {
    endMonth = monthIndex(experience.end);
  }

  if (endMonth === null) {
    const tail = experience.period.split(/[—–-]/).pop()?.trim() ?? "";
    endMonth = monthIndex(tail);
  }
  if (endMonth === null) return "";

  const total = Math.max(1, endMonth - startMonth + 1);
  const years = Math.floor(total / 12);
  const months = total % 12;
  return [years ? `${years}y` : "", months ? `${months}m` : ""].filter(Boolean).join(" ") || "1m";
}

function TimelineItem({
  experience,
  current,
  containerRef,
  progress,
}: {
  experience: PortfolioExperience;
  current: boolean;
  containerRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const itemRef = useRef<HTMLDivElement>(null);
  const hasDetail = experience.achievements.length > 0 || Boolean(experience.summary);
  const duration = tenure(experience, current);
  const [reached] = useLineOpen(itemRef, containerRef, progress, {
    iconOffset: 12,
    enabled: !reduce,
    initial: Boolean(reduce),
  });
  const active = reached || current;
  const open = reached && hasDetail;

  return (
    <div ref={itemRef} id={`tl-${experience.id}`} data-node className="relative scroll-mt-28 ps-10">
      <span className="absolute start-[3px] top-1 z-10 grid h-4 w-4 place-items-center">
        {current && !reduce ? (
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-signal/30 motion-reduce:hidden"
          />
        ) : null}
        <motion.span
          aria-hidden
          className={`h-3 w-3 rounded-full border-2 transition-colors duration-300 ${
            active ? "border-signal bg-signal" : "border-border bg-background"
          }`}
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
          className={`relative rounded-lg ps-4 transition-all duration-300 ${
            active ? "bg-signal/[0.045]" : "bg-transparent"
          } ${open ? "pb-4 pt-3" : "py-1"}`}
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
                  className={`font-display tracking-tight transition-colors duration-300 ${
                    active ? "text-foreground" : "text-foreground/85"
                  }`}
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
                    <MapPin aria-hidden className="h-3 w-3" />
                    {experience.location}
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
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              ) : null}
              {experience.tech.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {experience.tech.map((technology) => (
                    <TechTag key={technology}>{technology}</TechTag>
                  ))}
                </div>
              ) : null}
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

function TimelineScrubber({
  containerRef,
  progress,
  items,
}: {
  containerRef: RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  items: PortfolioExperience[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, "change", (value) => {
    const container = containerRef.current;
    if (!container) return;
    const line = value * container.clientHeight;
    const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-node]"));
    let nextActive = 0;
    nodes.forEach((node, index) => {
      if (line >= node.offsetTop + 12) nextActive = index;
    });
    setActive(nextActive);
  });

  const go = (index: number) => {
    const item = items[index];
    if (!item) return;
    document.getElementById(`tl-${item.id}`)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <nav
      aria-label="Timeline navigation"
      className="fixed end-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 xl:flex"
    >
      {items.map((experience, index) => {
        const isActive = index === active;
        return (
          <button
            key={experience.id}
            type="button"
            onClick={() => go(index)}
            aria-current={isActive ? "true" : undefined}
            aria-label={`${experience.role} — ${experience.company}`}
            className="group flex items-center gap-2"
          >
            <span
              className={`whitespace-nowrap rounded-md bg-card/90 px-2 py-0.5 text-xs text-muted-foreground opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100 ${
                isActive ? "opacity-100 text-foreground" : ""
              }`}
            >
              {experience.company}
            </span>
            <span
              className={`h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
                isActive
                  ? "scale-125 bg-signal shadow-[0_0_0_3px_color-mix(in_oklch,var(--signal)_20%,transparent)]"
                  : "bg-border group-hover:bg-signal/50"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}

function currentExperienceId(experiences: PortfolioExperience[]): string | undefined {
  return experiences.find(isExplicitlyCurrent)?.id;
}

export function ReferenceTimeline({ experiences }: { experiences: PortfolioExperience[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 30%", "end 70%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const currentId = currentExperienceId(experiences);
  const groups: Array<{ year: string; items: PortfolioExperience[] }> = [];

  for (const experience of experiences) {
    const year = yearOf(experience);
    const previous = groups[groups.length - 1];
    if (previous?.year === year) previous.items.push(experience);
    else groups.push({ year, items: [experience] });
  }

  return (
    <div ref={containerRef} className="relative">
      <div aria-hidden className="absolute start-[11px] top-0 h-full w-px bg-border" />
      <motion.div
        aria-hidden
        className="absolute start-[11px] top-0 w-px origin-top bg-signal"
        style={{ scaleY: progress, height: "100%" }}
      />

      {experiences.length > 1 ? (
        <TimelineScrubber containerRef={containerRef} progress={progress} items={experiences} />
      ) : null}

      <div>
        {groups.map((group) => (
          <div key={`${group.year}-${group.items[0]?.id ?? "empty"}`}>
            <div className="sticky top-24 z-20 mb-4 flex items-center gap-3 bg-background py-2">
              <span className="ps-10 font-mono text-xs uppercase tracking-widest text-signal-2">
                {group.year}
              </span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            {group.items.map((experience) => (
              <TimelineItem
                key={experience.id}
                experience={experience}
                current={experience.id === currentId}
                containerRef={containerRef}
                progress={progress}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
