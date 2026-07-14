import { useI18n } from "@portfolio/i18n";
import { ArrowUpRight, Lock } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import type { PortfolioProject } from "@/lib/content";
import { localizedPath } from "@/lib/locale";
import { useSpotlight } from "./motion";
import { TechTag } from "./ui";

type Atmosphere = "aqi" | "rapid" | "cms" | "agency";

const atmosphere: Record<Atmosphere, string> = {
  aqi: "from-teal-500/12 via-cyan-500/6",
  rapid: "from-emerald-500/12 via-sky-500/6",
  cms: "from-violet-500/10 via-indigo-500/6",
  agency: "from-amber-500/10 via-orange-500/6",
};

function atmosphereFor(project: PortfolioProject): Atmosphere {
  const signature = `${project.slug} ${project.category} ${project.stack.join(" ")}`.toLowerCase();
  if (signature.includes("air-quality") || signature.includes("aqi")) return "aqi";
  if (signature.includes("rapid")) return "rapid";
  if (signature.includes("cms") || signature.includes("innolab") || signature.includes("strapi")) {
    return "cms";
  }
  return "agency";
}

function AtmosphereGlyph({ kind }: { kind: Atmosphere }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
      {kind === "aqi"
        ? Array.from({ length: 5 }).map((_, index) => (
            <motion.path
              key={index}
              d={`M0 ${30 + index * 16} Q 40 ${18 + index * 16}, 60 ${30 + index * 16} T 120 ${30 + index * 16}`}
              className="stroke-signal/50"
              fill="none"
              strokeWidth="1"
              initial={{ pathLength: 0.3, opacity: 0.4 }}
              whileInView={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 1.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            />
          ))
        : null}
      {kind === "rapid" ? (
        <g className="stroke-signal/50" fill="none" strokeWidth="1.2">
          {[20, 45, 70, 95].map((y) => (
            <g key={y}>
              <circle cx="22" cy={y} r="4" className="fill-signal/40 stroke-none" />
              <path d={`M28 ${y} H98`} strokeDasharray="4 4" />
            </g>
          ))}
        </g>
      ) : null}
      {kind === "cms"
        ? Array.from({ length: 3 }).flatMap((_, row) =>
            Array.from({ length: 3 }).map((__, column) => (
              <rect
                key={`${row}-${column}`}
                x={16 + column * 32}
                y={16 + row * 32}
                width="24"
                height="24"
                rx="3"
                className="stroke-signal/40"
                fill="none"
                strokeWidth="1"
              />
            )),
          )
        : null}
      {kind === "agency" ? (
        <g className="stroke-signal/50" fill="none" strokeWidth="1.2">
          <circle cx="60" cy="60" r="8" className="fill-signal/40 stroke-none" />
          {[0, 72, 144, 216, 288].map((angle) => {
            const x = 60 + 42 * Math.cos((angle * Math.PI) / 180);
            const y = 60 + 42 * Math.sin((angle * Math.PI) / 180);
            return (
              <g key={angle}>
                <line x1="60" y1="60" x2={x} y2={y} />
                <circle cx={x} cy={y} r="3" className="fill-signal/30 stroke-none" />
              </g>
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}

export function ProjectCard({ project, index = 0 }: { project: PortfolioProject; index?: number }) {
  const spotlight = useSpotlight();
  const { t, lang } = useI18n();
  const privateProject = project.visibility === "private";
  const projectAtmosphere = atmosphereFor(project);

  return (
    <motion.article
      onMouseMove={spotlight.onMove}
      onMouseLeave={spotlight.onLeave}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.2, 0, 0, 1],
      }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-signal/40"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: spotlight.background }}
      />
      <div
        className={`relative h-40 overflow-hidden border-b border-border bg-gradient-to-br ${atmosphere[projectAtmosphere]} to-transparent`}
      >
        <div className="absolute inset-0 p-6 opacity-70 transition-opacity duration-500 group-hover:opacity-100">
          <AtmosphereGlyph kind={projectAtmosphere} />
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-md border border-border bg-background/70 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground backdrop-blur">
            {project.year ?? project.timeframe}
          </span>
          {privateProject ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background/70 px-2 py-0.5 font-mono text-[0.65rem] text-muted-foreground backdrop-blur">
              <Lock className="h-3 w-3" /> Private
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative z-20 p-6">
        <h3 className="font-display tracking-tight" style={{ fontSize: "1.3rem", fontWeight: 500 }}>
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: 1.55 }}>
          {project.tagline}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="flex items-baseline gap-1.5">
              <span
                className="font-display text-signal"
                style={{ fontSize: "1.1rem", fontWeight: 600 }}
              >
                {metric.value}
              </span>
              <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 5).map((technology) => (
            <TechTag key={technology}>{technology}</TechTag>
          ))}
          {project.stack.length > 5 ? <TechTag>+{project.stack.length - 5}</TechTag> : null}
        </div>

        {privateProject ? (
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> {t("card.pending")}
          </span>
        ) : (
          <Link
            to={localizedPath(`/projects/${project.slug}`, lang)}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-foreground transition-colors group-hover:text-signal"
          >
            {t("card.readCase")}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>
    </motion.article>
  );
}
