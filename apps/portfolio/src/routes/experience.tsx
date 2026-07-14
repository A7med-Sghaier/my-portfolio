import { useI18n } from "@portfolio/i18n";
import { PageBackdrop } from "@/components/reference-about/page-backdrop";
import { ReferenceTimeline } from "@/components/reference-experience/timeline";
import { EmptyState } from "@/components/feedback";
import { Reveal } from "@/components/reference-home/motion";
import { Eyebrow, SectionHeading } from "@/components/reference-home/ui";
import { careerYears } from "@/lib/content";
import { personStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

export function ExperiencePage() {
  const { content, locale } = usePortfolioData();
  const { t, formatNumber } = useI18n();
  const profile = content.profile;
  const years = careerYears(content.experiences);

  return (
    <>
      <Seo
        title={t("exp.eyebrow")}
        description={t("exp.intro")}
        path="/experience"
        locale={locale}
        structuredData={personStructuredData(profile)}
      />
      <div className="relative isolate mx-auto max-w-5xl px-5 pb-10 pt-32">
        <PageBackdrop motif="flow" />
        <Eyebrow>{t("exp.eyebrow")}</Eyebrow>
        <h1
          className="mt-4 max-w-3xl font-display tracking-tight"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
            fontWeight: 500,
            lineHeight: 1.03,
          }}
        >
          {t("exp.title", { years: formatNumber(years) })}
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground" style={{ lineHeight: 1.6 }}>
          {t("exp.intro")}
        </p>

        <div className="mt-14 max-w-3xl">
          {content.experiences.length > 0 ? (
            <ReferenceTimeline experiences={content.experiences} />
          ) : (
            <EmptyState title={t("exp.empty.title")} description={t("exp.empty.body")} />
          )}
        </div>

        {content.education.length > 0 ? (
          <div className="mt-16 border-t border-border pt-14">
            <SectionHeading eyebrow={t("exp.education")} title={t("exp.education")} />
            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              {content.education.map((education) => (
                <Reveal key={education.id} className="bg-card p-6">
                  <p className="font-mono text-xs text-muted-foreground">{education.period}</p>
                  <h3
                    className="mt-2 font-display tracking-tight"
                    style={{ fontSize: "1.05rem", fontWeight: 500 }}
                  >
                    {education.degree}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{education.school}</p>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
