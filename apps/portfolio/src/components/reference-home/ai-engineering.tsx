import { useI18n, type TKey } from "@portfolio/i18n";
import { Boxes, Braces, Cpu, GitBranch, Sparkles, Workflow } from "lucide-react";
import { DataFlow, IntelligenceField } from "./backgrounds";
import { Reveal } from "./motion";
import { Eyebrow } from "./ui";

const engineering: { icon: typeof Boxes; key: TKey }[] = [
  { icon: Boxes, key: "ai.se.architecture" },
  { icon: Braces, key: "ai.se.typed" },
  { icon: GitBranch, key: "ai.se.cicd" },
];

const intelligence: { icon: typeof Cpu; key: TKey }[] = [
  { icon: Cpu, key: "ai.ai.ml" },
  { icon: Workflow, key: "ai.ai.pipelines" },
  { icon: Sparkles, key: "ai.ai.assisted" },
];

export function AiEngineering() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-y border-border">
      <IntelligenceField />
      <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>{t("ai.eyebrow")}</Eyebrow>
          </div>
          <h2
            className="mt-5 font-display tracking-tight"
            style={{
              fontSize: "clamp(1.9rem, 4.4vw, 3.2rem)",
              fontWeight: 500,
              lineHeight: 1.05,
            }}
          >
            {t("ai.headingPre")} <span className="text-signal">{t("ai.headingSe")}</span>{" "}
            {t("ai.headingMid")} <span className="text-signal-2">{t("ai.headingAi")}</span>.
          </h2>
          <p className="mt-4 text-muted-foreground" style={{ lineHeight: 1.6 }}>
            {t("ai.body")}
          </p>
        </div>

        <div className="mt-14 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <Reveal className="rounded-2xl border border-border bg-card/70 p-7 backdrop-blur-sm">
            <p className="font-mono text-xs uppercase tracking-wider text-signal">
              {t("ai.seLabel")}
            </p>
            <ul className="mt-5 space-y-4">
              {engineering.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-signal/30 bg-signal/10 text-signal">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{t(item.key)}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div className="relative hidden h-24 w-28 md:block">
            <DataFlow lines={4} />
            <span
              className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-background font-display text-signal shadow-lg"
              style={{ fontWeight: 600 }}
            >
              AS
            </span>
          </div>

          <Reveal
            delay={0.1}
            className="rounded-2xl border border-border bg-card/70 p-7 backdrop-blur-sm"
          >
            <p className="font-mono text-xs uppercase tracking-wider text-signal-2">
              {t("ai.aiLabel")}
            </p>
            <ul className="mt-5 space-y-4">
              {intelligence.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-lg border-[color:var(--signal-2)]/30 bg-[color:var(--signal-2)]/10 text-[color:var(--signal-2)]"
                    style={{ borderWidth: 1 }}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{t(item.key)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
