import { useI18n } from "@portfolio/i18n";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDown, Download, Github, Linkedin } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { PortfolioProfile } from "@/lib/content";
import { localizedPath } from "@/lib/locale";
import { BackgroundNetwork } from "./background-network";
import { ActionButton, GridBackdrop } from "./ui";

const sequence = (index: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.6,
    delay: index * 0.12,
    ease: [0.2, 0, 0, 1] as const,
  },
});

export function Hero({ profile }: { profile: PortfolioProfile }) {
  const reduce = useReducedMotion();
  const { t, lang } = useI18n();
  const nameWords = profile.name.split(" ");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-80">
        <BackgroundNetwork />
      </div>
      <GridBackdrop />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-[8%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--signal) 26%, transparent), transparent 70%)",
        }}
        animate={
          reduce
            ? undefined
            : {
                x: [0, 40, -20, 0],
                y: [0, 30, 10, 0],
                scale: [1, 1.08, 0.96, 1],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-6rem] end-[6%] h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--signal-2) 22%, transparent), transparent 70%)",
        }}
        animate={
          reduce
            ? undefined
            : {
                x: [0, -30, 20, 0],
                y: [0, -20, 20, 0],
                scale: [1, 1.1, 0.95, 1],
              }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 45%, var(--background) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-5 pt-24 pb-16">
        <motion.div {...sequence(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            {profile.title} · {profile.location}
          </span>
        </motion.div>

        <h1
          className="mt-6 font-display tracking-tight"
          style={{
            fontSize: "clamp(2.8rem, 9vw, 6.5rem)",
            fontWeight: 500,
            lineHeight: 0.95,
          }}
        >
          {nameWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="mr-[0.2em] inline-block overflow-hidden align-bottom -mb-[0.32em]"
            >
              <motion.span
                className="inline-block pb-[0.32em]"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, var(--foreground), color-mix(in oklch, var(--foreground) 70%, transparent))",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
                initial={reduce ? { opacity: 0 } : { y: "110%" }}
                animate={reduce ? { opacity: 1 } : { y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.15 + index * 0.09,
                  ease: [0.2, 0, 0, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          {...sequence(3)}
          className="mt-5 max-w-2xl font-display text-muted-foreground"
          style={{ fontSize: "clamp(1.15rem, 2.4vw, 1.6rem)", lineHeight: 1.3 }}
        >
          {profile.positioning}
        </motion.p>

        <motion.div
          {...sequence(4)}
          className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
        >
          {profile.disciplines.map((discipline, index) => (
            <span key={discipline} className="flex items-center gap-3">
              {index > 0 ? <span className="text-signal">·</span> : null}
              {discipline}
            </span>
          ))}
        </motion.div>

        <motion.p
          {...sequence(5)}
          className="mt-6 max-w-xl text-sm text-muted-foreground"
          style={{ lineHeight: 1.6 }}
        >
          {t("hero.basedIn")} {profile.availability}
        </motion.p>

        <motion.div {...sequence(6)} className="mt-8 flex flex-wrap items-center gap-3">
          <ActionButton to="/projects">{t("cta.viewWork")}</ActionButton>
          <ActionButton to="/contact" variant="outline">
            {t("cta.contactAhmed")}
          </ActionButton>
          <div className="ml-1 flex items-center gap-2">
            <IconLink href={profile.links.github} label="GitHub">
              <Github className="h-4 w-4" />
            </IconLink>
            <IconLink href={profile.links.linkedin} label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </IconLink>
            <Link
              to={localizedPath("/resume", lang)}
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
              aria-label="Résumé"
            >
              <Download className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {profile.alternativeTitles.length > 0 ? (
          <motion.div
            {...sequence(7)}
            className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/60 pt-8"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t("hero.alsoRoles")}
            </span>
            <RotatingTitle titles={profile.alternativeTitles} reduce={Boolean(reduce)} />
          </motion.div>
        ) : null}
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function RotatingTitle({ titles, reduce }: { titles: string[]; reduce: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || titles.length <= 1) return;
    const interval = window.setInterval(
      () => setIndex((current) => (current + 1) % titles.length),
      2600,
    );
    return () => window.clearInterval(interval);
  }, [reduce, titles.length]);

  const title = titles[index] ?? titles[0] ?? "";
  return (
    <span className="relative inline-flex h-6 items-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={title}
          className="font-display tracking-tight text-signal"
          style={{ fontSize: "1rem", fontWeight: 500 }}
          initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0, 0, 1] }}
        >
          {title}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
      aria-label={label}
    >
      {children}
    </a>
  );
}
