import { useI18n, type TKey } from "@portfolio/i18n";
import { AnimatePresence, motion } from "motion/react";
import { startTransition } from "react";
import { useSearchParams } from "react-router";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { ProjectCard } from "@/components/reference-home/project-card";
import { Eyebrow } from "@/components/reference-home/ui";
import { breadcrumbStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

const filters = ["All", "Full-stack", "Data & AI", "CMS"] as const;
type Filter = (typeof filters)[number];

const filterKey: Record<Filter, TKey> = {
  All: "proj.filter.all",
  "Full-stack": "proj.filter.fullstack",
  "Data & AI": "proj.filter.dataai",
  CMS: "proj.filter.cms",
};

const filterSlug: Record<Filter, string> = {
  All: "all",
  "Full-stack": "fullstack",
  "Data & AI": "dataai",
  CMS: "cms",
};

function slugToFilter(slug: string | null): Filter {
  return filters.find((filter) => filterSlug[filter] === slug) ?? "All";
}

function matches(stack: string[], filter: Filter): boolean {
  if (filter === "All") return true;
  const signature = stack.join(" ").toLowerCase();
  if (filter === "Data & AI") return /python|machine|falcon|elastic|mongo/.test(signature);
  if (filter === "CMS") return /strapi|jsonb|cms/.test(signature);
  if (filter === "Full-stack") return /nest|express|node|react/.test(signature);
  return true;
}

export function ProjectsPage() {
  const { content, locale } = usePortfolioData();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const filter = slugToFilter(params.get("filter"));
  const published = content.projects.filter(
    (project) => project.status === "published" && project.visibility === "public",
  );
  const visible = published.filter((project) => matches(project.stack, filter));
  const pending = content.projects.filter((project) => project.visibility === "private");
  const countFor = (candidate: Filter) =>
    published.filter((project) => matches(project.stack, candidate)).length;

  const setFilter = (nextFilter: Filter) => {
    const next = new URLSearchParams(params);
    if (nextFilter === "All") next.delete("filter");
    else next.set("filter", filterSlug[nextFilter]);
    startTransition(() => setParams(next, { replace: true }));
  };

  return (
    <>
      <Seo
        title={t("proj.eyebrow")}
        description={t("proj.intro")}
        path="/projects"
        locale={locale}
        structuredData={breadcrumbStructuredData([
          { name: t("nav.home"), path: "/" },
          { name: t("nav.projects"), path: "/projects" },
        ])}
      />

      <div className="relative isolate mx-auto max-w-6xl px-5 pb-10 pt-32">
        <PageBackdrop motif="grid" />
        <Eyebrow>{t("proj.eyebrow")}</Eyebrow>
        <h1
          className="mt-4 max-w-3xl font-display tracking-tight"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 500,
            lineHeight: 1.03,
          }}
        >
          {t("proj.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.6 }}>
          {t("proj.intro")}
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={t("proj.filter.label")}>
          {filters.map((candidate) => {
            const count = countFor(candidate);
            const active = filter === candidate;
            const disabled = count === 0 && !active;

            return (
              <button
                key={candidate}
                type="button"
                onClick={() => setFilter(candidate)}
                disabled={disabled}
                aria-pressed={active}
                className={`relative inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-signal/50 text-foreground"
                    : disabled
                      ? "cursor-not-allowed border-border/60 text-muted-foreground/40"
                      : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-signal/10"
                  />
                ) : null}
                {t(filterKey[candidate])}
                <span
                  className={`font-mono text-[0.7rem] ${
                    active ? "text-signal" : "text-muted-foreground/70"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">{t("proj.empty")}</p>
            <button
              type="button"
              onClick={() => setFilter("All")}
              className="mt-4 inline-flex items-center rounded-full border border-signal/40 px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-signal/10"
            >
              {t("proj.empty.reset")}
            </button>
          </div>
        ) : (
          <motion.div layout className="mt-10 grid gap-6 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((project, index) => (
                <motion.div
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProjectCard project={project} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {pending.length > 0 ? (
          <div className="mt-16">
            <Eyebrow>{t("proj.pending")}</Eyebrow>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{t("proj.pendingBody")}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {pending.map((project) => (
                <div
                  key={project.slug}
                  className="rounded-xl border border-dashed border-border p-5"
                >
                  <h3 className="font-display" style={{ fontSize: "1.05rem", fontWeight: 500 }}>
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{project.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
