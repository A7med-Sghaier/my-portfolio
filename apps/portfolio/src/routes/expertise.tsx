import { useI18n } from "@portfolio/i18n";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { EmptyState } from "@/components/feedback";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { Eyebrow, TechTag } from "@/components/reference-home/ui";
import type { PortfolioExperience } from "@/lib/content";
import { localizedPath } from "@/lib/locale";
import { Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

const CAREER_START_YEAR = 2015;

function experienceYearRange(experience: PortfolioExperience): [number, number] {
  const now = new Date().getFullYear();
  const start = Number(experience.start.match(/\d{4}/)?.[0] ?? CAREER_START_YEAR);
  const explicitEnd = experience.end?.match(/\d{4}/)?.[0];
  const periodEnd = experience.period.split(/[—–-]/).pop()?.match(/\d{4}/)?.[0];
  const end = Number(explicitEnd ?? periodEnd ?? now);
  return [Math.min(start, end), Math.max(start, end)];
}

function ExpertiseEvidence({
  relatedExperience,
  projectCount,
}: {
  relatedExperience: PortfolioExperience[];
  projectCount: number;
}) {
  const { t, formatNumber } = useI18n();
  const reduced = useReducedMotion();
  const now = new Date().getFullYear();
  const evidence = useMemo(() => {
    const activeYears = new Set<number>();
    const companiesByYear = new Map<number, string[]>();

    for (const experience of relatedExperience) {
      const [start, end] = experienceYearRange(experience);
      for (let year = start; year <= end; year += 1) {
        activeYears.add(year);
        const companies = companiesByYear.get(year) ?? [];
        if (!companies.includes(experience.company)) companies.push(experience.company);
        companiesByYear.set(year, companies);
      }
    }

    const years = Array.from(
      { length: now - CAREER_START_YEAR + 1 },
      (_, index) => CAREER_START_YEAR + index,
    );
    const lastYear = activeYears.size > 0 ? Math.max(...activeYears) : 0;
    const firstYear = activeYears.size > 0 ? Math.min(...activeYears) : 0;
    return {
      activeYears,
      companiesByYear,
      years,
      lastYear,
      spanYears: activeYears.size > 0 ? lastYear - firstYear + 1 : 0,
      isCurrent: lastYear >= now,
    };
  }, [now, relatedExperience]);

  if (relatedExperience.length === 0) return null;

  const stats = [
    { value: formatNumber(evidence.spanYears), label: t("expt.ev.yearsActive") },
    { value: formatNumber(relatedExperience.length), label: t("expt.ev.roles") },
    { value: formatNumber(projectCount), label: t("expt.ev.projects") },
  ];

  return (
    <div className="mt-8 rounded-xl border border-border bg-secondary/20 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
          {t("expt.ev.title")}
        </h3>
        <span className="font-mono text-xs text-muted-foreground">
          {evidence.isCurrent
            ? t("expt.ev.current")
            : t("expt.ev.lastUsed", { year: formatNumber(evidence.lastYear) })}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-1.5">
            <span
              className="font-display text-signal"
              style={{ fontSize: "1.35rem", fontWeight: 600, lineHeight: 1 }}
            >
              {stat.value}
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex gap-1" role="img" aria-label={t("expt.ev.trackLabel")}>
          {evidence.years.map((year, index) => {
            const active = evidence.activeYears.has(year);
            const companies = evidence.companiesByYear.get(year) ?? [];
            return (
              <div key={year} className="group relative flex flex-1 flex-col items-center gap-1.5">
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-center shadow-md group-hover:block">
                  <span className="font-mono text-[0.65rem] tabular-nums text-foreground">
                    {formatNumber(year, { useGrouping: false })}
                  </span>
                  {companies.length > 0 ? (
                    <ul className="mt-0.5">
                      {companies.map((company) => (
                        <li key={company} className="text-[0.7rem] text-muted-foreground">
                          {company}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                      {t("expt.ev.notUsed")}
                    </p>
                  )}
                </div>
                <motion.div
                  className={`h-8 w-full rounded-sm transition-colors ${
                    active
                      ? "bg-signal group-hover:bg-signal"
                      : "bg-border group-hover:bg-muted-foreground/40"
                  }`}
                  initial={reduced ? false : { scaleY: 0.3, opacity: 0.4 }}
                  whileInView={{ scaleY: 1, opacity: active ? 1 : 0.5 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: reduced ? 0 : Math.min(index * 0.03, 0.4),
                    ease: [0.2, 0, 0, 1],
                  }}
                  style={{ originY: 1 }}
                />
                <span
                  className={`font-mono text-[0.55rem] tabular-nums ${
                    active ? "text-muted-foreground" : "text-muted-foreground/40"
                  }`}
                >
                  {index % 2 === 0 ? `'${String(year).slice(2)}` : " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ExpertisePage() {
  const { content, locale } = usePortfolioData();
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState(content.expertise[0]?.id ?? "");

  useEffect(() => {
    if (!content.expertise.some((group) => group.id === activeId)) {
      setActiveId(content.expertise[0]?.id ?? "");
    }
  }, [activeId, content.expertise]);

  const active = content.expertise.find((group) => group.id === activeId) ?? content.expertise[0];
  const relatedExperience = active
    ? content.experiences.filter((experience) => active.relatedExperience.includes(experience.id))
    : [];
  const relatedProjects = active
    ? content.projects.filter(
        (project) =>
          active.relatedProjects.includes(project.slug) &&
          project.status === "published" &&
          project.visibility === "public",
      )
    : [];

  return (
    <>
      <Seo
        title={t("expt.eyebrow")}
        description={t("expt.intro")}
        path="/expertise"
        locale={locale}
      />
      <div className="relative isolate mx-auto max-w-6xl px-5 pb-10 pt-32">
        <PageBackdrop motif="neural" />
        <Eyebrow>{t("expt.eyebrow")}</Eyebrow>
        <h1
          className="mt-4 max-w-3xl font-display tracking-tight"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", fontWeight: 500, lineHeight: 1.03 }}
        >
          {t("expt.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.6 }}>
          {t("expt.intro")}
        </p>

        {active ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-[300px_1fr]">
            <div role="tablist" aria-label={t("expt.eyebrow")} className="flex flex-col gap-1.5">
              {content.expertise.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={active.id === group.id}
                  aria-controls="expertise-panel"
                  onClick={() => setActiveId(group.id)}
                  className={`relative rounded-lg border px-4 py-3 text-start transition-colors ${
                    active.id === group.id
                      ? "border-signal/50 bg-card"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active.id === group.id ? (
                    <motion.span
                      layoutId="exp-active"
                      className="absolute start-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-signal"
                    />
                  ) : null}
                  <span className="font-display" style={{ fontSize: "1rem", fontWeight: 500 }}>
                    {group.title}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                id="expertise-panel"
                role="tabpanel"
                key={active.id}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -12 }}
                transition={{ duration: reduced ? 0 : 0.28 }}
                className="rounded-2xl border border-border bg-card p-7 md:p-9"
              >
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "1.05rem", lineHeight: 1.6 }}
                >
                  {active.blurb}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {active.skills.map((skill) => (
                    <TechTag key={skill}>{skill}</TechTag>
                  ))}
                </div>

                <ExpertiseEvidence
                  relatedExperience={relatedExperience}
                  projectCount={relatedProjects.length}
                />

                {relatedExperience.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
                      {t("expt.appliedAt")}
                    </h3>
                    <div className="mt-3 space-y-2">
                      {relatedExperience.map((experience) => (
                        <div
                          key={experience.id}
                          className="flex items-baseline justify-between gap-4 border-b border-border pb-2"
                        >
                          <span className="text-sm">{experience.company}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {experience.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {relatedProjects.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
                      {t("expt.shownIn")}
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {relatedProjects.map((project) => (
                        <Link
                          key={project.slug}
                          to={localizedPath(`/projects/${project.slug}`, lang)}
                          className="group flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:border-signal/40"
                        >
                          {project.title}
                          <ArrowUpRight
                            aria-hidden
                            className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-signal"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState title={t("expt.empty.title")} description={t("expt.empty.body")} />
          </div>
        )}
      </div>
    </>
  );
}
