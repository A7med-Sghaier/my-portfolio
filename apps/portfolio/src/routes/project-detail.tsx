import { useI18n } from "@portfolio/i18n";
import { AlertTriangle, ArrowLeft, Github } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useLoaderData } from "react-router";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { EmptyState } from "@/components/feedback";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/reference-home/motion";
import { ActionButton, Eyebrow, TechTag } from "@/components/reference-home/ui";
import type { ProjectLoaderData } from "@/lib/loaders";
import { localizedPath } from "@/lib/locale";
import { breadcrumbStructuredData, projectStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

function Block({ label, body }: { label: string; body?: ReactNode }) {
  if (!body) return null;

  return (
    <Reveal className="grid gap-3 border-t border-border py-8 md:grid-cols-[200px_1fr]">
      <h3 className="font-mono text-xs uppercase tracking-wider text-signal">{label}</h3>
      <div className="max-w-2xl text-muted-foreground" style={{ lineHeight: 1.65 }}>
        {body}
      </div>
    </Reveal>
  );
}

export function ProjectDetailPage() {
  const { project, locale } = useLoaderData<ProjectLoaderData>();
  const { content } = usePortfolioData();
  const { t, lang } = useI18n();

  if (!project || project.status !== "published" || project.visibility !== "public") {
    return (
      <div className="mx-auto max-w-4xl px-5 pt-32">
        <Seo
          title={t("pd.notPublic.title")}
          description={t("pd.notPublic.body")}
          path="/projects/not-found"
          locale={locale}
          noIndex
        />
        <EmptyState title={t("pd.notPublic.title")} description={t("pd.notPublic.body")} />
        <Link
          to={localizedPath("/projects", lang)}
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm text-signal"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          {t("cta.allProjects")}
        </Link>
      </div>
    );
  }

  const related = content.projects
    .filter(
      (candidate) =>
        candidate.slug !== project.slug &&
        candidate.status === "published" &&
        candidate.visibility === "public",
    )
    .slice(0, 2);
  const profile = content.profile;
  const shareImage = project.media[0]?.src;
  const eyebrow = [project.role, project.year ?? project.timeframe].filter(Boolean).join(" · ");

  return (
    <>
      <Seo
        title={project.title}
        description={project.tagline}
        siteName={profile?.name}
        path={`/projects/${project.slug}`}
        locale={locale}
        type="article"
        image={shareImage}
        imageAlt={project.media[0]?.alt ?? `${project.title} — ${t("nav.projects")}`}
        structuredData={[
          breadcrumbStructuredData([
            { name: t("nav.home"), path: "/" },
            { name: t("nav.projects"), path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
          projectStructuredData(project, profile),
        ]}
      />

      <article className="relative isolate mx-auto max-w-5xl px-5 pb-10 pt-28">
        <PageBackdrop motif="grid" />
        <Link
          to={localizedPath("/projects", lang)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          {t("cta.allProjects")}
        </Link>

        <div className="mt-8">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1
            className="mt-4 font-display tracking-tight"
            style={{
              fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
              fontWeight: 500,
              lineHeight: 1.02,
            }}
          >
            {project.title}
          </h1>
          <p
            className="mt-4 max-w-3xl text-muted-foreground"
            style={{ fontSize: "1.1rem", lineHeight: 1.6 }}
          >
            {project.tagline}
          </p>
        </div>

        {project.metrics.length > 0 ? (
          <Stagger className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
            {project.metrics.map((metric) => {
              const numericValue = Number.parseInt(metric.value, 10);
              return (
                <StaggerItem key={metric.label} className="bg-card p-6">
                  <div
                    className="font-display tracking-tight text-signal"
                    style={{ fontSize: "2rem", fontWeight: 600 }}
                  >
                    {Number.isNaN(numericValue) ? (
                      metric.value
                    ) : (
                      <CountUp
                        value={numericValue}
                        suffix={metric.value.replace(String(numericValue), "")}
                      />
                    )}
                  </div>
                  <p className="mt-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {metric.label}
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {project.repo ? (
            <ActionButton href={project.repo} variant="outline">
              <Github aria-hidden className="mr-1 h-4 w-4" />
              {t("cta.viewRepo")}
            </ActionButton>
          ) : null}
          {project.liveUrl ? (
            <ActionButton href={project.liveUrl} variant="outline">
              {t("cta.viewLive")}
            </ActionButton>
          ) : null}
          {project.stack.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((technology) => (
                <TechTag key={technology}>{technology}</TechTag>
              ))}
            </div>
          ) : null}
        </div>

        {project.note ? (
          <div className="mt-8 flex gap-3 rounded-lg border border-signal/30 bg-signal/5 p-4 text-sm text-muted-foreground">
            <AlertTriangle aria-hidden className="h-4 w-4 shrink-0 text-signal" />
            <span>{project.note}</span>
          </div>
        ) : null}

        <div className="mt-12">
          <Block label={t("pd.overview")} body={project.overview} />
          <Block label={t("pd.problem")} body={project.problem} />
          {project.userGroups.length > 0 ? (
            <Block
              label={t("pd.userGroups")}
              body={
                <ul className="flex flex-wrap gap-2">
                  {project.userGroups.map((group) => (
                    <li key={group}>
                      <TechTag>{group}</TechTag>
                    </li>
                  ))}
                </ul>
              }
            />
          ) : null}
          <Block label={t("pd.role")} body={project.roleDetail} />
          {project.architecture.length > 0 ? (
            <Reveal className="grid gap-3 border-t border-border py-8 md:grid-cols-[200px_1fr]">
              <h3 className="font-mono text-xs uppercase tracking-wider text-signal">
                {t("pd.architecture")}
              </h3>
              <div className="max-w-2xl">
                <ArchitectureDiagram project={project} />
              </div>
            </Reveal>
          ) : null}
          <Block label={t("pd.frontend")} body={project.frontend} />
          <Block label={t("pd.backend")} body={project.backend} />
          <Block label={t("pd.database")} body={project.database} />
          <Block label={t("pd.security")} body={project.security} />
          <Block label={t("pd.performance")} body={project.performance} />
          <Block label={t("pd.testing")} body={project.testing} />
          <Block label={t("pd.cicd")} body={project.cicd} />
          {project.sections.map((section) => (
            <Block
              key={section.heading}
              label={section.heading}
              body={
                <div className="space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              }
            />
          ))}
          {project.results.length > 0 ? (
            <Block
              label={t("pd.results")}
              body={
                <ul className="space-y-2">
                  {project.results.map((result) => (
                    <li key={result} className="flex gap-2.5">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                      {result}
                    </li>
                  ))}
                </ul>
              }
            />
          ) : null}
        </div>

        {related.length > 0 ? (
          <div className="mt-12 border-t border-border pt-10">
            <Eyebrow>{t("label.relatedWork")}</Eyebrow>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {related.map((candidate) => (
                <Link
                  key={candidate.slug}
                  to={localizedPath(`/projects/${candidate.slug}`, lang)}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-signal/40"
                >
                  <h3
                    className="font-display transition-colors group-hover:text-signal"
                    style={{ fontSize: "1.05rem", fontWeight: 500 }}
                  >
                    {candidate.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{candidate.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </article>
    </>
  );
}
