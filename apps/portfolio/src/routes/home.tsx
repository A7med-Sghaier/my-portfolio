import { useI18n } from "@portfolio/i18n";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode } from "react";
import { Link } from "react-router";
import { AiEngineering } from "@/components/reference-home/ai-engineering";
import { BlueprintGrid, DataFlow } from "@/components/reference-home/backgrounds";
import { Hero } from "@/components/reference-home/hero";
import {
  BeforeAfter,
  CountUp,
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/reference-home/motion";
import { ProjectCard } from "@/components/reference-home/project-card";
import { Timeline } from "@/components/reference-home/timeline";
import { ActionButton, Eyebrow, SectionHeading, TechTag } from "@/components/reference-home/ui";
import { EmptyState } from "@/components/feedback";
import { careerYears } from "@/lib/content";
import { localizedPath } from "@/lib/locale";
import { personStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-6xl px-5 py-20 md:py-28 ${className}`}>{children}</section>
  );
}

export function HomePage() {
  const { content, locale } = usePortfolioData();
  const { t, lang, formatNumber } = useI18n();
  const profile = content.profile;
  const featured = content.projects.filter(
    (project) =>
      project.featured && project.status === "published" && project.visibility === "public",
  );
  const experiences = content.experiences.filter((experience) => experience.featured);
  const years = formatNumber(careerYears(content.experiences));

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-5 pt-32">
        <Seo
          title={t("portfolio.profileUnavailable.title")}
          description={t("portfolio.profileUnavailable.body")}
          path="/"
          locale={locale}
          noIndex
        />
        <EmptyState
          title={t("portfolio.profileUnavailable.title")}
          description={t("portfolio.profileUnavailable.body")}
        />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${profile.name} — ${profile.title}`}
        description={`${profile.positioning} ${profile.statement}`}
        siteName={profile.name}
        path="/"
        locale={locale}
        imageAlt={`${profile.name}, ${profile.title}`}
        structuredData={personStructuredData(profile)}
      />

      <Hero profile={profile} />

      <Section>
        <Reveal>
          <p
            className="max-w-4xl font-display tracking-tight"
            style={{
              fontSize: "clamp(1.4rem, 3.4vw, 2.4rem)",
              fontWeight: 400,
              lineHeight: 1.25,
            }}
          >
            {profile.statement}
          </p>
        </Reveal>
      </Section>

      <Section className="!py-0">
        {content.heroMetrics.length > 0 ? (
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {content.heroMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="bg-card p-7"
              >
                <div
                  className="font-display tracking-tight text-signal"
                  style={{ fontSize: "2.4rem", fontWeight: 600, lineHeight: 1 }}
                >
                  <CountUp value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground" style={{ lineHeight: 1.5 }}>
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </div>
        ) : null}

        {content.performanceMetric ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mt-6 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-xl border border-border bg-card p-7 sm:flex-row sm:items-center"
          >
            <div className="pointer-events-none absolute inset-0 opacity-50">
              <DataFlow lines={4} />
            </div>
            <div className="relative">
              <Eyebrow>{t("home.perf.eyebrow")}</Eyebrow>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {content.performanceMetric.label} {t("home.perf.body")}
              </p>
            </div>
            <BeforeAfter
              from={content.performanceMetric.from}
              to={content.performanceMetric.to}
              className="relative font-display tracking-tight"
            />
          </motion.div>
        ) : null}
      </Section>

      <div className="mt-24 md:mt-32">
        <AiEngineering monogram={profile.monogram} />
      </div>

      <Section>
        <div className="flex items-end justify-between gap-6">
          <SectionHeading
            eyebrow={t("home.work.eyebrow")}
            title={t("home.work.title")}
            intro={t("home.work.intro")}
          />
          <Link
            to={localizedPath("/projects", lang)}
            className="hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-signal md:inline-flex"
          >
            {t("cta.allProjects")} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featured.map((project, index) => (
              <ProjectCard key={project.slug} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title={t("home.work.empty.title")}
              description={t("home.work.empty.body")}
            />
          </div>
        )}
      </Section>

      <Section>
        <SectionHeading
          eyebrow={t("home.caps.eyebrow")}
          title={t("home.caps.title")}
          intro={t("home.caps.intro")}
        />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
          {content.expertise.slice(0, 6).map((group) => (
            <StaggerItem key={group.id}>
              <Link
                to={localizedPath("/expertise", lang)}
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-signal/40"
              >
                <h3
                  className="font-display tracking-tight"
                  style={{ fontSize: "1.15rem", fontWeight: 500 }}
                >
                  {group.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: 1.55 }}>
                  {group.blurb}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {group.skills.slice(0, 5).map((skill) => (
                    <TechTag key={skill}>{skill}</TechTag>
                  ))}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {experiences.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow={t("home.traj.eyebrow")}
            title={t("home.traj.title", { years })}
            intro={t("home.traj.intro", { years })}
          />
          <div className="mt-12 max-w-3xl">
            <Timeline experiences={experiences} />
            <ActionButton to="/experience" variant="outline">
              {t("cta.fullTimeline")}
            </ActionButton>
          </div>
        </Section>
      ) : null}

      <Section className="relative">
        <BlueprintGrid fade="center" className="opacity-70" />
        <div className="relative">
          <SectionHeading
            eyebrow={t("home.principles.eyebrow")}
            title={t("home.principles.title")}
          />
          <Stagger
            className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
            gap={0.05}
          >
            {content.principles.map((principle, index) => (
              <StaggerItem key={principle.id} className="bg-card p-7">
                <span className="font-mono text-xs text-signal">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  className="mt-3 font-display tracking-tight"
                  style={{ fontSize: "1.05rem", fontWeight: 500 }}
                >
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: 1.55 }}>
                  {principle.body}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow={t("home.eco.eyebrow")} title={t("home.eco.title")} />
        <div className="mt-8 flex flex-wrap gap-2">
          {content.technologyEcosystem.map((technology) => (
            <span
              key={technology}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-sm text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
            >
              {technology}
            </span>
          ))}
        </div>
      </Section>

      <Section>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 md:p-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-signal/10 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <Eyebrow>{t("home.cta.eyebrow")}</Eyebrow>
            <h2
              className="mt-4 max-w-2xl font-display tracking-tight"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 500,
                lineHeight: 1.05,
              }}
            >
              {t("home.cta.title")}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-muted-foreground">
              <Globe2 className="h-4 w-4 text-signal" /> {profile.availability}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton to="/contact">{t("cta.contactAhmed")}</ActionButton>
              {profile.links.github ? (
                <ActionButton href={profile.links.github} variant="outline">
                  {t("cta.openGithub")}
                </ActionButton>
              ) : null}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
