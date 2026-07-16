import { useI18n } from "@portfolio/i18n";
import { Download, FileText, Github, Linkedin, Mail, Printer } from "lucide-react";
import { startTransition } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { ActionButton, Eyebrow } from "@/components/reference-home/ui";
import { getApiClient } from "@/lib/api";
import { linkLabel, normalizeContent, type PortfolioContent } from "@/lib/content";
import {
  downloadResumeMarkdown,
  downloadResumePdf,
  printResumePdf,
  resumeFileName,
  type ResumeExportLabels,
  type ResumeFocus,
} from "@/lib/resume-export";
import { personStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

const ENGLISH_EXPORT_LABELS: ResumeExportLabels = {
  experience: "Experience",
  education: "Education",
  expertise: "Expertise",
  languages: "Languages",
};

export function ResumePage() {
  const { content, locale } = usePortfolioData();
  const { t, lang } = useI18n();
  const [params, setParams] = useSearchParams();
  const profile = content.profile;
  const focus = params.get("focus");
  const focusGroup = content.expertise.find((group) => group.id === focus) ?? null;
  const relevantIds = new Set(focusGroup?.relatedExperience ?? []);
  const focusOptions = content.expertise.filter((group) => group.relatedExperience.length > 0);
  const orderedExpertise = focusGroup
    ? [focusGroup, ...content.expertise.filter((group) => group.id !== focusGroup.id)]
    : content.expertise;

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-5 pt-32">
        <EmptyState
          title={t("portfolio.profileUnavailable.title")}
          description={t("portfolio.profileUnavailable.body")}
        />
      </div>
    );
  }

  const setFocus = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("focus", id);
    else next.delete("focus");
    startTransition(() => setParams(next, { replace: true }));
  };

  const localizedExportLabels: ResumeExportLabels = {
    experience: t("resume.experience"),
    education: t("resume.education"),
    expertise: t("resume.expertise"),
    languages: t("resume.languages"),
  };
  const exportPayload = async (): Promise<{
    exportContent: PortfolioContent;
    labels: ResumeExportLabels;
    exportFocus?: ResumeFocus;
  }> => {
    const exportContent =
      lang === "ar" ? normalizeContent(await getApiClient().getPublicContent("en")) : content;
    const exportGroup = focusGroup
      ? (exportContent.expertise.find((group) => group.id === focusGroup.id) ?? focusGroup)
      : null;
    return {
      exportContent,
      labels: lang === "ar" ? ENGLISH_EXPORT_LABELS : localizedExportLabels,
      exportFocus: exportGroup
        ? {
            id: exportGroup.id,
            title: exportGroup.title,
            note:
              lang === "ar"
                ? `Tailored for ${exportGroup.title}`
                : t("resume.tailored", { focus: exportGroup.title }),
          }
        : undefined,
    };
  };
  const fallbackDownload = (extension: "pdf" | "md") => {
    const anchor = document.createElement("a");
    anchor.href = `/files/ahmed-sghaier-resume.${extension}`;
    anchor.download = resumeFileName(extension, undefined, profile.name);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };
  const handlePdf = async () => {
    try {
      const payload = await exportPayload();
      downloadResumePdf(payload.exportContent, payload.labels, payload.exportFocus);
      toast.success(t("resume.downloaded"), {
        description: resumeFileName("pdf", payload.exportFocus, profile.name),
      });
    } catch {
      fallbackDownload("pdf");
      toast.success(t("resume.downloaded"), {
        description: resumeFileName("pdf", undefined, profile.name),
      });
    }
  };
  const handleMarkdown = async () => {
    try {
      const payload = await exportPayload();
      downloadResumeMarkdown(payload.exportContent, payload.labels, payload.exportFocus);
      toast.success(t("resume.downloaded"), {
        description: resumeFileName("md", payload.exportFocus, profile.name),
      });
    } catch {
      fallbackDownload("md");
      toast.success(t("resume.downloaded"), {
        description: resumeFileName("md", undefined, profile.name),
      });
    }
  };
  const handlePrint = async () => {
    try {
      const payload = await exportPayload();
      printResumePdf(payload.exportContent, payload.labels, payload.exportFocus);
    } catch {
      window.open("/files/ahmed-sghaier-resume.pdf", "_blank");
    }
  };

  return (
    <>
      <Seo
        title={t("label.resume")}
        description={`${t("label.cv")} — ${profile.name}, ${profile.title}.`}
        siteName={profile.name}
        path="/resume"
        locale={locale}
        type="profile"
        structuredData={[
          ...personStructuredData(profile),
          {
            "@type": "ProfilePage",
            name: `${profile.name} — ${t("label.resume")}`,
            mainEntity: { "@type": "Person", name: profile.name },
          },
        ]}
      />
      <div className="relative isolate mx-auto max-w-4xl px-5 pb-10 pt-32">
        <div className="print:hidden">
          <PageBackdrop motif="grid" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <Eyebrow>{t("label.resume")}</Eyebrow>
            <h1
              className="mt-4 font-display tracking-tight"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 500 }}
            >
              {t("label.cv")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ActionButton onClick={() => void handlePdf()}>
              <Download aria-hidden className="me-1 h-4 w-4" /> {t("cta.downloadPdf")}
            </ActionButton>
            <ActionButton onClick={() => void handlePrint()} variant="outline">
              <Printer aria-hidden className="me-1 h-4 w-4" /> {t("cta.printPdf")}
            </ActionButton>
            <button
              type="button"
              onClick={() => void handleMarkdown()}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-signal"
            >
              <FileText aria-hidden className="h-4 w-4" /> {t("resume.downloadMd")}
            </button>
          </div>
        </div>

        {focusOptions.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center gap-2 print:hidden">
            <span className="me-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t("resume.focus.label")}
            </span>
            <button
              type="button"
              aria-pressed={!focusGroup}
              onClick={() => setFocus(null)}
              className={`relative rounded-full border px-3 py-1 text-sm transition-colors ${
                !focusGroup
                  ? "border-signal/50 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("resume.focus.all")}
            </button>
            {focusOptions.map((group) => (
              <button
                key={group.id}
                type="button"
                aria-pressed={focusGroup?.id === group.id}
                onClick={() => setFocus(group.id)}
                className={`relative rounded-full border px-3 py-1 text-sm transition-colors ${
                  focusGroup?.id === group.id
                    ? "border-signal/50 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {focusGroup?.id === group.id ? (
                  <span className="absolute inset-0 -z-10 rounded-full bg-signal/10" />
                ) : null}
                {group.title}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 rounded-xl border border-border bg-card p-8 print:mt-0 print:border-0 print:bg-white print:p-0 print:text-black">
          <header className="border-b border-border pb-6 print:border-black/20">
            <h2
              className="font-display tracking-tight"
              style={{ fontSize: "1.8rem", fontWeight: 600 }}
            >
              {profile.name}
            </h2>
            <p className="mt-1 text-muted-foreground print:text-black">
              {profile.title} — {profile.disciplines.join(" · ")}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground print:text-black">
              {profile.links.email ? (
                <a
                  href={`mailto:${profile.links.email}`}
                  className="inline-flex items-center gap-1.5"
                >
                  <Mail aria-hidden className="h-3.5 w-3.5" /> {profile.links.email}
                </a>
              ) : null}
              {profile.links.github ? (
                <a href={profile.links.github} className="inline-flex items-center gap-1.5">
                  <Github aria-hidden className="h-3.5 w-3.5" /> {linkLabel(profile.links.github)}
                </a>
              ) : null}
              {profile.links.linkedin ? (
                <a href={profile.links.linkedin} className="inline-flex items-center gap-1.5">
                  <Linkedin aria-hidden className="h-3.5 w-3.5" />{" "}
                  {linkLabel(profile.links.linkedin)}
                </a>
              ) : null}
              <span>{profile.location}</span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-[1.55] text-muted-foreground print:text-black">
              {profile.statement}
            </p>
            {focusGroup ? (
              <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-signal print:text-black">
                {t("resume.tailored", { focus: focusGroup.title })}
              </p>
            ) : null}
          </header>

          <ResumeSection title={t("resume.experience")}>
            {content.experiences.map((experience) => {
              const relevant = !focusGroup || relevantIds.has(experience.id);
              return (
                <article
                  key={experience.id}
                  className={`mb-5 break-inside-avoid transition-opacity print:opacity-100 ${
                    relevant ? "opacity-100" : "opacity-55"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-medium">
                      {experience.role} · {experience.company}
                      {focusGroup && relevant ? (
                        <span className="rounded-full bg-signal/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-signal print:hidden">
                          {t("resume.focus.relevant")}
                        </span>
                      ) : null}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground print:text-black">
                      {experience.period}
                    </span>
                  </div>
                  {experience.summary ? (
                    <p className="mt-1 text-sm leading-[1.5] text-muted-foreground print:text-black">
                      {experience.summary}
                    </p>
                  ) : null}
                  {experience.achievements.length > 0 ? (
                    <ul className="mt-1.5 list-disc space-y-0.5 ps-5 text-sm text-muted-foreground print:text-black">
                      {experience.achievements.map((achievement) => (
                        <li key={achievement}>{achievement}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </ResumeSection>

          <ResumeSection title={t("resume.education")}>
            {content.education.map((education) => (
              <div
                key={education.id}
                className="mb-2 flex flex-wrap items-baseline justify-between gap-2"
              >
                <span>
                  {education.degree} — {education.school}
                </span>
                <span className="font-mono text-xs text-muted-foreground print:text-black">
                  {education.period}
                </span>
              </div>
            ))}
          </ResumeSection>

          <ResumeSection title={t("resume.expertise")}>
            <div className="grid gap-2 sm:grid-cols-2">
              {orderedExpertise.map((group) => {
                const focused = focusGroup?.id === group.id;
                return (
                  <div
                    key={group.id}
                    className={
                      focused
                        ? "-m-2 rounded-lg bg-signal/[0.06] p-2 print:m-0 print:bg-transparent print:p-0"
                        : undefined
                    }
                  >
                    <p
                      className={
                        focused ? "font-medium text-signal print:text-black" : "font-medium"
                      }
                    >
                      {group.title}
                    </p>
                    <p className="text-sm text-muted-foreground print:text-black">
                      {group.skills.join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </ResumeSection>

          <ResumeSection title={t("resume.languages")}>
            <p className="text-sm text-muted-foreground print:text-black">
              {profile.languages
                .map((language) => `${language.name} (${language.level})`)
                .join(" · ")}
            </p>
          </ResumeSection>
        </div>
      </div>
    </>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t border-border pt-5 print:border-black/20">
      <h3 className="font-mono text-xs uppercase tracking-wider text-signal print:text-black">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
