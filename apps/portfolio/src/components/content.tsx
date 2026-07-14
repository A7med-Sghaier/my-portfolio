import {
  Badge,
  Card,
  CountUp,
  Eyebrow,
  GridBackdrop,
  MetricCard,
  MetricGrid,
  PageContainer,
  SectionHeading,
  TechTag,
} from "@portfolio/ui";
import { useI18n } from "@portfolio/i18n";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Github,
  MapPin,
} from "lucide-react";
import { Link } from "react-router";
import type { PortfolioExperience, PortfolioMetric, PortfolioProject } from "@/lib/content";
import { localizedPath } from "@/lib/locale";
import { MotionReveal } from "./motion";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="relative isolate overflow-hidden border-b border-border pt-28">
      <GridBackdrop className="pointer-events-none absolute inset-0 -z-10 opacity-50" />
      <div
        aria-hidden
        className="absolute -start-32 top-0 -z-10 h-80 w-80 rounded-full bg-signal/10 blur-3xl"
      />
      <PageContainer className="pb-16 pt-12 md:pb-20 md:pt-16">
        <MotionReveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.7rem)] font-medium leading-[0.96] tracking-[-0.045em] text-balance">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            {description}
          </p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </MotionReveal>
      </PageContainer>
    </header>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return <SectionHeading eyebrow={eyebrow} title={title} intro={description} />;
}

export function Metrics({ metrics }: { metrics: PortfolioMetric[] }) {
  if (metrics.length === 0) return null;
  return (
    <MetricGrid>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          value={<CountUp value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />}
          label={metric.label}
          detail={metric.detail}
        />
      ))}
    </MetricGrid>
  );
}

export function ProjectCard({
  project,
  priority = false,
}: {
  project: PortfolioProject;
  priority?: boolean;
}) {
  const { lang } = useI18n();
  const media = project.media[0];
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-signal/45 hover:shadow-[0_24px_70px_-40px_var(--signal)]">
      <Link
        to={localizedPath(`/projects/${project.slug}`, lang)}
        aria-label={project.title}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-inset"
      />
      <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-[linear-gradient(135deg,rgba(54,211,153,.14),transparent_52%),radial-gradient(circle_at_80%_20%,rgba(97,156,255,.16),transparent_40%)]">
        {media ? (
          <img
            src={media.src}
            alt={media.alt}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="absolute inset-0 p-6" aria-hidden>
            <div className="h-full rounded-lg border border-signal/20 bg-background/35 p-4 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-signal/60" />
                <span className="h-1.5 w-1.5 rounded-full bg-signal/30" />
                <span className="h-1.5 w-1.5 rounded-full bg-signal/20" />
              </div>
              <div className="mt-8 grid grid-cols-[1fr_.55fr] gap-3">
                <span className="h-20 rounded-md bg-signal/10" />
                <span className="h-20 rounded-md border border-border" />
              </div>
            </div>
          </div>
        )}
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          {project.category ? <Badge>{project.category}</Badge> : null}
          {project.year ? <Badge variant="outline">{project.year}</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-signal">
            {project.title}
          </h3>
          <ArrowUpRight
            aria-hidden
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
          />
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {project.tagline}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {project.stack.slice(0, 5).map((technology) => (
            <TechTag key={technology}>{technology}</TechTag>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ExperienceTimeline({
  experiences,
  compact = false,
}: {
  experiences: PortfolioExperience[];
  compact?: boolean;
}) {
  return (
    <ol className="relative ms-2 border-s border-border">
      {experiences.map((experience, index) => (
        <li key={experience.id} className={`${compact ? "pb-9" : "pb-12"} relative ps-8 last:pb-0`}>
          <span className="absolute -start-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-signal shadow-[0_0_0_4px_color-mix(in_oklab,var(--signal)_14%,transparent)]" />
          <MotionReveal delay={Math.min(index * 0.04, 0.2)}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="font-display text-lg font-semibold tracking-tight">
                {experience.role}
              </h3>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <CalendarDays aria-hidden className="h-3.5 w-3.5" />
                {experience.period}
              </span>
            </div>
            <p className="mt-1 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-signal">
              <span className="inline-flex items-center gap-1.5">
                <BriefcaseBusiness aria-hidden className="h-3.5 w-3.5" />
                {experience.company}
              </span>
              {experience.location ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                  {experience.location}
                </span>
              ) : null}
            </p>
            {experience.summary ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {experience.summary}
              </p>
            ) : null}
            {!compact && experience.achievements.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                {experience.achievements.map((achievement) => (
                  <li key={achievement} className="flex gap-3">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-signal" />
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {!compact && experience.tech.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {experience.tech.map((technology) => (
                  <TechTag key={technology}>{technology}</TechTag>
                ))}
              </div>
            ) : null}
          </MotionReveal>
        </li>
      ))}
    </ol>
  );
}

export function ProjectLinks({ project }: { project: PortfolioProject }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-3">
      {project.repo ? (
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-signal/50 hover:text-signal"
        >
          <Github aria-hidden className="h-4 w-4" /> {t("cta.viewRepo")}
          <ExternalLink aria-hidden className="h-3 w-3" />
        </a>
      ) : null}
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background"
        >
          {t("cta.viewLive")} <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </div>
  );
}
