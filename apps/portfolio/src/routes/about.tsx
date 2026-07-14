import { useI18n } from "@portfolio/i18n";
import {
  Activity,
  ArrowUpRight,
  Download,
  FileText,
  Globe2,
  Languages,
  MapPin,
  Plane,
  Quote,
} from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { downloadBioMarkdown, downloadBioPdf } from "@/components/reference-about/bio-download";
import { JourneyItem } from "@/components/reference-about/journey-item";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/reference-home/motion";
import { ActionButton, Eyebrow } from "@/components/reference-home/ui";
import { PageBackdrop } from "@/components/reference-about/page-backdrop";
import { type RailItem, SectionRail } from "@/components/reference-about/section-rail";
import { EmptyState } from "@/components/feedback";
import { careerYears, type PortfolioContent, type PortfolioExperience } from "@/lib/content";
import { localizedPath } from "@/lib/locale";
import { personStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

const THREAD_COLORS = [
  "var(--signal)",
  "var(--signal-2)",
  "oklch(0.66 0.16 285)",
  "oklch(0.70 0.13 235)",
];

interface JourneyMarker {
  id: string;
  kind: "edu" | "role";
  sort: number;
}

interface TechThread {
  name: string;
  color: string;
  roleIds: string[];
}

function monthKey(value: string): number {
  const iso = value.match(/(\d{4})-(\d{2})/);
  if (iso?.[1] && iso[2]) return Number(iso[1]) * 12 + Number(iso[2]) - 1;

  const named = value.match(/([A-Za-z]{3})[a-z]*\s+(\d{4})/);
  if (named?.[1] && named[2]) {
    return Number(named[2]) * 12 + Math.max(0, MONTHS.indexOf(named[1].toLowerCase()));
  }

  return Number(value.match(/\d{4}/)?.[0] ?? 0) * 12;
}

function buildJourney(content: PortfolioContent): JourneyMarker[] {
  return [
    ...content.education.map((education) => ({
      id: education.id,
      kind: "edu" as const,
      sort: monthKey(education.period),
    })),
    ...content.experiences.map((experience) => ({
      id: experience.id,
      kind: "role" as const,
      sort: monthKey(experience.start),
    })),
  ].sort((left, right) => left.sort - right.sort || left.id.localeCompare(right.id));
}

function buildThreads(experiences: PortfolioExperience[]): TechThread[] {
  const counts = new Map<string, number>();
  const firstSeen = new Map<string, number>();

  experiences.forEach((experience, order) => {
    experience.tech.forEach((technology) => {
      counts.set(technology, (counts.get(technology) ?? 0) + 1);
      if (!firstSeen.has(technology)) firstSeen.set(technology, order);
    });
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort(
      (left, right) =>
        right[1] - left[1] || (firstSeen.get(left[0]) ?? 0) - (firstSeen.get(right[0]) ?? 0),
    )
    .slice(0, 4)
    .map(([name], index) => ({
      name,
      color: THREAD_COLORS[index] ?? "var(--signal)",
      roleIds: experiences
        .filter((experience) => experience.tech.includes(name))
        .map((experience) => experience.id),
    }));
}

function currentExperience(experiences: PortfolioExperience[]): PortfolioExperience | undefined {
  return experiences.find(
    (experience) =>
      experience.end?.toLowerCase() === "present" ||
      /present|heute|gegenwart|présent|actuel|حتى الآن|الآن/i.test(experience.period),
  );
}

function workCityCount(experiences: PortfolioExperience[]): number {
  return new Set(
    experiences
      .map((experience) => experience.location)
      .filter((location): location is string => Boolean(location?.includes(","))),
  ).size;
}

function languageProgress(name: string): number {
  const normalized = name.toLocaleLowerCase();
  if (/arabic|arabisch|arabe|العربية/.test(normalized)) return 100;
  if (/german|deutsch|allemand|الألمانية/.test(normalized)) return 95;
  if (/french|französisch|français|الفرنسية/.test(normalized)) return 90;
  if (/english|englisch|anglais|الإنجليزية/.test(normalized)) return 75;
  return 80;
}

export function AboutPage() {
  const { content, locale } = usePortfolioData();
  const { t, lang, formatNumber } = useI18n();
  const reduce = useReducedMotion();
  const portraitRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLOListElement>(null);
  const [activeThreads, setActiveThreads] = useState<string[]>([]);
  const journey = useMemo(() => buildJourney(content), [content]);
  const threads = useMemo(() => buildThreads(content.experiences), [content.experiences]);
  const threadTechnologies = useMemo(
    () => new Map(content.experiences.map((experience) => [experience.id, experience.tech])),
    [content.experiences],
  );
  const groups = useMemo(() => {
    const grouped: Array<{ year: number; items: JourneyMarker[] }> = [];
    for (const item of journey) {
      const year = Math.floor(item.sort / 12);
      const previous = grouped[grouped.length - 1];
      if (previous?.year === year) previous.items.push(item);
      else grouped.push({ year, items: [item] });
    }
    return grouped;
  }, [journey]);
  const current = useMemo(() => currentExperience(content.experiences), [content.experiences]);
  const railItems = useMemo<RailItem[]>(
    () =>
      [
        { id: "intro", label: t("about.nav.intro"), visible: true },
        { id: "journey", label: t("about.nav.journey"), visible: journey.length > 0 },
        {
          id: "principles",
          label: t("about.nav.principles"),
          visible: content.principles.length > 0,
        },
        {
          id: "focus",
          label: t("about.nav.focus"),
          visible: content.expertise.length > 0,
        },
        { id: "contact", label: t("about.nav.contact"), visible: true },
      ]
        .filter((item) => item.visible)
        .map(({ id, label }) => ({ id, label })),
    [content.expertise.length, content.principles.length, journey.length, t],
  );

  const { scrollYProgress: portraitProgress } = useScroll({
    target: portraitRef,
    offset: ["start end", "end start"],
  });
  const rawPortraitY = useTransform(portraitProgress, [0, 1], [28, -28]);
  const portraitY = useSpring(rawPortraitY, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });
  const { scrollYProgress: journeyProgress } = useScroll({
    target: journeyRef,
    offset: ["start end", "end center"],
  });
  const journeyLine = useSpring(journeyProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  const profile = content.profile;
  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-5 pt-32">
        <Seo
          title={t("about.eyebrow")}
          description={t("portfolio.profileUnavailable.body")}
          path="/about"
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

  const years = careerYears(content.experiences);
  const nationality = profile.nationality.join(lang === "ar" ? " و" : " & ");
  const stats = [
    { value: years, suffix: "+", label: t("about.stats.years") },
    {
      value: content.experiences.length,
      suffix: "",
      label: t("about.stats.companies"),
    },
    {
      value: workCityCount(content.experiences),
      suffix: "",
      label: t("about.stats.cities"),
    },
    {
      value: profile.languages.length,
      suffix: "",
      label: t("about.languages"),
    },
  ];
  const activeSet = threads.filter((thread) => activeThreads.includes(thread.name));
  const threadsOn = activeSet.length > 0;
  const toggleThread = (name: string) => {
    setActiveThreads((active) =>
      active.includes(name) ? active.filter((item) => item !== name) : [...active, name],
    );
  };
  const roleThreadColors = (id: string): string[] => {
    const technologies = threadTechnologies.get(id);
    if (!technologies) return [];
    return activeSet
      .filter((thread) => technologies.includes(thread.name))
      .map((thread) => thread.color);
  };
  const roleHref = (id: string): string => {
    const experience = content.experiences.find((item) => item.id === id);
    const slug = experience?.relatedProjects.find((candidate) => {
      const project = content.projects.find((item) => item.slug === candidate);
      return project?.status === "published" && project.visibility === "public";
    });
    return localizedPath(slug ? `/projects/${slug}` : "/experience", lang);
  };

  return (
    <>
      <Seo
        title={t("about.eyebrow")}
        description={profile.statement}
        path="/about"
        locale={locale}
        type="profile"
        structuredData={personStructuredData(profile)}
      />
      <div className="relative isolate mx-auto max-w-4xl px-5 pb-10 pt-32">
        <PageBackdrop motif="neural" />
        <SectionRail items={railItems} ariaLabel={t("about.eyebrow")} />
        <Eyebrow>{t("about.eyebrow")}</Eyebrow>

        <div
          id="intro"
          className="mt-4 grid scroll-mt-28 items-start gap-10 lg:grid-cols-[1fr_300px]"
        >
          <div>
            <h1
              className="font-display tracking-tight"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                fontWeight: 500,
                lineHeight: 1.03,
              }}
            >
              {t("about.title")}
            </h1>
            <div
              className="mt-8 space-y-5 text-muted-foreground"
              style={{ fontSize: "1.08rem", lineHeight: 1.7 }}
            >
              <p>
                {t("about.p1", {
                  location: profile.location,
                  years: formatNumber(years),
                })}
              </p>
              <p>{t("about.p2")}</p>
            </div>

            {current ? (
              <Reveal className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-signal/30 bg-signal/5 px-4 py-2">
                <Activity aria-hidden className="h-3.5 w-3.5 shrink-0 text-signal" />
                <span className="text-sm text-muted-foreground">
                  <span className="font-mono text-xs uppercase tracking-wider text-signal">
                    {t("about.currently")}
                  </span>
                  {` · ${current.role} · ${current.company}`}
                </span>
              </Reveal>
            ) : null}
          </div>

          <Reveal className="relative order-first lg:order-none lg:sticky lg:top-28">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-br from-signal/20 to-signal-2/10 blur-2xl"
            />
            <div
              ref={portraitRef}
              className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card"
            >
              <motion.div className="h-full w-full" style={reduce ? undefined : { y: portraitY }}>
                <img
                  src="/images/profile/portrait.jpg"
                  alt={`Portrait of ${profile.name}`}
                  className="h-[112%] w-full object-cover"
                />
              </motion.div>
            </div>
          </Reveal>
        </div>

        <Reveal className="relative mt-16 ps-6 sm:ps-8">
          <span
            aria-hidden
            className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-gradient-to-b from-signal via-signal to-signal-2/40"
          />
          <Quote aria-hidden className="h-7 w-7 text-signal/50" />
          <p
            className="mt-3 font-display tracking-tight"
            style={{
              fontSize: "clamp(1.4rem, 3.2vw, 2rem)",
              fontWeight: 400,
              lineHeight: 1.3,
            }}
          >
            {profile.positioning}
          </p>
          <span
            aria-hidden
            className="mt-5 block h-px w-24 bg-gradient-to-r from-signal to-transparent"
          />
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-card p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.5 }}
            >
              <div
                className="font-display tracking-tight text-signal"
                style={{ fontSize: "2.2rem", fontWeight: 600, lineHeight: 1 }}
              >
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2.5 text-sm text-muted-foreground" style={{ lineHeight: 1.5 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
          {[
            { icon: MapPin, label: t("about.rowLocation"), value: profile.location },
            { icon: Plane, label: t("about.rowNationality"), value: nationality },
            {
              icon: Globe2,
              label: t("about.rowWorkAuth"),
              value: profile.workAuthorization,
            },
            {
              icon: Globe2,
              label: t("about.rowAvailability"),
              value: t("about.availabilityValue"),
            },
          ]
            .filter((fact): fact is typeof fact & { value: string } => Boolean(fact.value))
            .map((fact) => (
              <Reveal
                key={fact.label}
                className="group flex items-start gap-3 bg-card p-6 transition-colors duration-200 hover:bg-secondary/40"
              >
                <fact.icon className="mt-0.5 h-4 w-4 shrink-0 text-signal transition-transform duration-200 group-hover:scale-110" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {fact.label}
                  </p>
                  <p className="mt-1">{fact.value}</p>
                </div>
              </Reveal>
            ))}
        </div>

        {journey.length > 0 ? (
          <section id="journey" className="mt-20 scroll-mt-28">
            <Eyebrow>{t("about.journey.title")}</Eyebrow>
            <p className="mt-3 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.65 }}>
              {t("about.journey.intro")}
            </p>

            {threads.length > 0 ? (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {threads.map((thread) => {
                  const active = activeThreads.includes(thread.name);
                  return (
                    <button
                      key={thread.name}
                      type="button"
                      onClick={() => toggleThread(thread.name)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
                        active
                          ? "border-transparent text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: `color-mix(in oklch, ${thread.color} 18%, transparent)`,
                              borderColor: thread.color,
                            }
                          : undefined
                      }
                    >
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: thread.color }}
                      />
                      {thread.name}
                    </button>
                  );
                })}
                {threadsOn ? (
                  <button
                    type="button"
                    onClick={() => setActiveThreads([])}
                    className="font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {t("about.threads.clear")}
                  </button>
                ) : null}
              </div>
            ) : null}

            <ol ref={journeyRef} className="relative mt-8 ps-10">
              <span aria-hidden className="absolute inset-y-0 start-3 w-px bg-border" />
              <motion.span
                aria-hidden
                className="absolute inset-y-0 start-3 w-px origin-top bg-signal/70"
                style={reduce ? { scaleY: 1 } : { scaleY: journeyLine }}
              />
              {groups.map((group) => (
                <li key={`group-${group.year}`} className="mb-6 list-none">
                  <div className="sticky top-24 z-10 -ms-10 mb-5 flex items-center gap-3 bg-background py-2">
                    <span
                      className="ms-10 font-display tracking-tight text-signal-2"
                      style={{ fontSize: "1.15rem", fontWeight: 600, lineHeight: 1 }}
                    >
                      {formatNumber(group.year, { useGrouping: false })}
                    </span>
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-gradient-to-r from-border to-transparent"
                    />
                  </div>

                  <ol>
                    {group.items.map((item, index) => {
                      const isEducation = item.kind === "edu";
                      const education = isEducation
                        ? content.education.find((entry) => entry.id === item.id)
                        : undefined;
                      const experience = !isEducation
                        ? content.experiences.find((entry) => entry.id === item.id)
                        : undefined;
                      if (!education && !experience) return null;
                      const colors = isEducation ? [] : roleThreadColors(item.id);

                      return (
                        <JourneyItem
                          key={`${item.kind}-${item.id}`}
                          kind={item.kind}
                          education={education}
                          experience={experience}
                          href={isEducation ? undefined : roleHref(item.id)}
                          isCurrent={!isEducation && current?.id === item.id}
                          index={index}
                          containerRef={journeyRef}
                          progress={journeyLine}
                          faded={threadsOn && colors.length === 0}
                          threadColors={colors}
                        />
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {content.principles.length > 0 ? (
          <section id="principles" className="mt-20 scroll-mt-28">
            <Eyebrow>{t("about.values.title")}</Eyebrow>
            <p className="mt-3 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.65 }}>
              {t("about.values.intro")}
            </p>
            <Stagger
              className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3"
              gap={0.06}
            >
              {content.principles.slice(0, 3).map((principle, index) => (
                <StaggerItem key={principle.id} className="bg-card p-6">
                  <span className="font-mono text-xs text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-3 font-display tracking-tight"
                    style={{ fontSize: "1.02rem", fontWeight: 500 }}
                  >
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground" style={{ lineHeight: 1.55 }}>
                    {principle.body}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ) : null}

        {content.expertise.length > 0 ? (
          <section id="focus" className="mt-20 scroll-mt-28">
            <Eyebrow>{t("about.focus.title")}</Eyebrow>
            <p className="mt-3 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.65 }}>
              {t("about.focus.intro")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {content.expertise.slice(0, 6).map((group) => (
                <Link
                  key={group.id}
                  to={localizedPath("/expertise", lang)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
                >
                  {group.title}
                  <ArrowUpRight className="h-3.5 w-3.5 text-signal opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
            <Link
              to={localizedPath("/expertise", lang)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-signal"
            >
              {t("about.focus.cta")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        ) : null}

        {profile.languages.length > 0 ? (
          <div className="mt-16 rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Languages aria-hidden className="h-4 w-4 text-signal" />
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {t("about.languages")}
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {profile.languages.map((language) => (
                <div key={language.name}>
                  <div className="flex items-baseline justify-between">
                    <span>{language.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {language.level}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-signal"
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${language.value ?? languageProgress(language.name)}%`,
                      }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 1, ease: [0.2, 0, 0, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <section id="contact" className="mt-20 scroll-mt-28">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-signal/10 blur-3xl"
            />
            <div className="relative">
              <h2
                className="max-w-2xl font-display tracking-tight"
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                  fontWeight: 500,
                  lineHeight: 1.08,
                }}
              >
                {t("about.cta.title")}
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground" style={{ lineHeight: 1.6 }}>
                {t("about.cta.body")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ActionButton to="/contact">{t("cta.contactAhmed")}</ActionButton>
                <ActionButton onClick={() => void downloadBioPdf(content, lang)} variant="outline">
                  <FileText className="h-4 w-4" />
                  {t("about.downloadBio")}
                </ActionButton>
                <button
                  type="button"
                  onClick={() => downloadBioMarkdown(content)}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-signal"
                >
                  <Download className="h-4 w-4" />
                  {t("about.downloadBioMd")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
