import { Alert, Input, Textarea } from "@portfolio/ui";
import { useI18n } from "@portfolio/i18n";
import {
  Check,
  Clock,
  Copy,
  Github,
  Globe2,
  Linkedin,
  Loader2,
  Mail,
  Moon,
  Send,
  Sun,
  Ticket as TicketIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { EmptyState } from "@/components/feedback";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { Eyebrow } from "@/components/reference-home/ui";
import { linkLabel } from "@/lib/content";
import type { ContactActionData } from "@/lib/loaders";
import { localizedPath } from "@/lib/locale";
import { personStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

const opportunityTypes = [
  { value: "Full-time position", key: "contact.cat.fulltime" },
  { value: "Contract opportunity", key: "contact.cat.contract" },
  { value: "Architecture consulting", key: "contact.cat.consulting" },
  { value: "Technical collaboration", key: "contact.cat.collaboration" },
  { value: "Other", key: "contact.cat.other" },
] as const;

const BERLIN_TIME_ZONE = "Europe/Berlin";

function timeZoneOffset(date: Date, timeZone: string): number {
  const local = new Date(date.toLocaleString("en-US", { timeZone }));
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((local.getTime() - utc.getTime()) / 3_600_000);
}

function useBerlinTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BERLIN_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const weekday = part("weekday");
  const hour = Number(part("hour"));
  const weekend = weekday === "Sat" || weekday === "Sun";
  const working = !weekend && hour >= 9 && hour < 18;
  const berlinOffset = timeZoneOffset(now, BERLIN_TIME_ZONE);
  const visitorOffset = -now.getTimezoneOffset() / 60;

  return {
    time: `${String(hour).padStart(2, "0")}:${part("minute")}`,
    weekend,
    working,
    timeZoneLabel: berlinOffset >= 2 ? "CEST" : "CET",
    offsetToVisitor: Math.round(berlinOffset - visitorOffset),
  };
}

function LocalTimeCard({ snapshot }: { snapshot: ReturnType<typeof useBerlinTime> }) {
  const { t } = useI18n();
  const { time, weekend, working, timeZoneLabel, offsetToVisitor } = snapshot;
  const offsetText =
    offsetToVisitor === 0
      ? t("contact.now.sameTime")
      : t("contact.now.offset", {
          n: String(Math.abs(offsetToVisitor)),
          dir: offsetToVisitor > 0 ? t("contact.now.behind") : t("contact.now.ahead"),
        });

  return (
    <div className="mt-4 rounded-lg border border-border bg-card/60 px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock aria-hidden className="h-4 w-4 text-signal" />
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {t("contact.now.title")}
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{timeZoneLabel}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-display tabular-nums tracking-tight text-foreground"
          style={{ fontSize: "1.75rem", fontWeight: 500, lineHeight: 1 }}
        >
          {time}
        </span>
        <span className="text-sm text-muted-foreground">{t("contact.now.place")}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
            working ? "bg-signal/10 text-signal" : "bg-muted-foreground/10 text-muted-foreground"
          }`}
        >
          {working ? (
            <Sun aria-hidden className="h-3 w-3" />
          ) : (
            <Moon aria-hidden className="h-3 w-3" />
          )}
          {weekend
            ? t("contact.now.weekend")
            : working
              ? t("contact.now.working")
              : t("contact.now.offHours")}
        </span>
        <span className="text-xs text-muted-foreground">· {t("contact.now.hours")}</span>
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">{offsetText}</p>
    </div>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-destructive">
      {children}
    </p>
  );
}

export function ContactPage() {
  const { content, locale } = usePortfolioData();
  const { t, lang } = useI18n();
  const profile = content.profile;
  const actionData = useActionData<ContactActionData>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const berlin = useBerlinTime();
  const ticketPath = useMemo(
    () =>
      localizedPath(
        actionData?.ticketRef
          ? `/ticket?ref=${encodeURIComponent(actionData.ticketRef)}`
          : "/ticket",
        lang,
      ),
    [actionData?.ticketRef, lang],
  );

  useEffect(() => {
    if (actionData?.ok) setShowSuccess(true);
  }, [actionData]);

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

  const copyReference = async () => {
    if (!actionData?.ticketRef) return;
    try {
      await navigator.clipboard.writeText(actionData.ticketRef);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Seo
        title={t("contact.eyebrow")}
        description={t("contact.intro")}
        siteName={profile.name}
        path="/contact"
        locale={locale}
        structuredData={[
          ...personStructuredData(profile),
          {
            "@type": "ContactPage",
            name: `${t("contact.eyebrow")} — ${profile.name}`,
            url: `${profile.links.domain ?? ""}/contact`,
          },
        ]}
      />
      <div className="relative isolate mx-auto max-w-5xl px-5 pb-10 pt-32">
        <PageBackdrop motif="neural" />
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <aside>
            <Eyebrow>{t("contact.eyebrow")}</Eyebrow>
            <h1
              className="mt-4 font-display tracking-tight"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 500, lineHeight: 1.03 }}
            >
              {t("contact.title")}
            </h1>
            <p className="mt-4 text-muted-foreground" style={{ lineHeight: 1.6 }}>
              {t("contact.intro")}
            </p>
            {profile.availability ? (
              <div className="mt-8 flex items-center gap-2 rounded-lg border border-signal/30 bg-signal/5 px-4 py-3 text-sm">
                <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-signal" />
                <Globe2 aria-hidden className="h-4 w-4 shrink-0 text-signal" />
                <span className="text-muted-foreground">{profile.availability}</span>
              </div>
            ) : null}
            <LocalTimeCard snapshot={berlin} />
            <div className="mt-8 space-y-3">
              {profile.links.email ? (
                <a
                  href={`mailto:${profile.links.email}`}
                  className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-border transition-colors group-hover:border-signal/50">
                    <Mail aria-hidden className="h-4 w-4" />
                  </span>
                  {profile.links.email}
                </a>
              ) : null}
              {profile.links.github ? (
                <a
                  href={profile.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-border transition-colors group-hover:border-signal/50">
                    <Github aria-hidden className="h-4 w-4" />
                  </span>
                  {linkLabel(profile.links.github)}
                </a>
              ) : null}
              {profile.links.linkedin ? (
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-md border border-border transition-colors group-hover:border-signal/50">
                    <Linkedin aria-hidden className="h-4 w-4" />
                  </span>
                  {linkLabel(profile.links.linkedin)}
                </a>
              ) : null}
            </div>
            <Link
              to={localizedPath("/ticket", lang)}
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-signal"
            >
              <TicketIcon aria-hidden className="h-4 w-4" /> {t("contact.ticket.track")}
            </Link>
          </aside>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <AnimatePresence mode="wait">
              {actionData?.ok && showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[360px] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="grid h-16 w-16 place-items-center rounded-full bg-signal/15 text-signal"
                  >
                    <Check aria-hidden className="h-8 w-8" />
                  </motion.span>
                  <h2 className="mt-5 font-display text-[1.4rem] font-medium tracking-tight">
                    {t("contact.successTitle")}
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    {actionData.name && actionData.email
                      ? t("contact.successBody", {
                          name: actionData.name.split(" ")[0] ?? actionData.name,
                          email: actionData.email,
                        })
                      : t("contact.successInbox")}
                  </p>
                  {actionData.ticketRef ? (
                    <div className="mt-6 w-full max-w-xs rounded-xl border border-signal/30 bg-signal/5 p-4">
                      <p className="flex items-center justify-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                        <TicketIcon aria-hidden className="h-3 w-3" />
                        {t("contact.ticket.label")}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="font-mono text-[1.35rem] font-semibold tracking-widest text-signal">
                          {actionData.ticketRef}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            void copyReference();
                          }}
                          aria-label={t("contact.ticket.copy")}
                          className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-signal/50 hover:text-signal"
                        >
                          {copied ? (
                            <Check aria-hidden className="h-4 w-4 text-signal" />
                          ) : (
                            <Copy aria-hidden className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="mt-2.5 text-xs leading-[1.5] text-muted-foreground">
                        {t("contact.ticket.keep")}
                      </p>
                      <div className="mt-3 flex flex-col items-center gap-2">
                        <Link
                          to={ticketPath}
                          className="inline-flex items-center gap-1 text-xs text-signal hover:underline"
                        >
                          {t("contact.ticket.track")}
                        </Link>
                        <button
                          type="button"
                          disabled
                          title={t("contact.ticket.emailSoon")}
                          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground opacity-60"
                        >
                          <Send aria-hidden className="h-3 w-3" />
                          {t("contact.ticket.email")}
                        </button>
                        <span className="font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground/70">
                          {t("contact.ticket.emailSoon")}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccess(false);
                      setCopied(false);
                      setFormKey((value) => value + 1);
                    }}
                    className="mt-6 text-sm text-signal hover:underline"
                  >
                    {t("contact.sendAnother")}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Form key={formKey} method="post" className="space-y-4" noValidate>
                    <input type="hidden" name="locale" value={locale} />
                    <div
                      className="absolute start-[-10000px] h-px w-px overflow-hidden"
                      aria-hidden
                    >
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </div>
                    {actionData?.message ? (
                      <Alert title={t("contact.errorTitle")} variant="destructive">
                        {actionData.message}
                      </Alert>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          {t("contact.field.name")}
                        </span>
                        <Input
                          name="name"
                          autoComplete="name"
                          required
                          className="rounded-lg bg-input-background px-3.5 py-2.5 text-sm"
                          aria-invalid={Boolean(actionData?.fields?.name)}
                          aria-describedby={actionData?.fields?.name ? "name-error" : undefined}
                          placeholder={t("contact.ph.name")}
                        />
                        <FieldError id="name-error">{actionData?.fields?.name}</FieldError>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          {t("contact.field.email")}
                        </span>
                        <Input
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          className="rounded-lg bg-input-background px-3.5 py-2.5 text-sm"
                          aria-invalid={Boolean(actionData?.fields?.email)}
                          aria-describedby={actionData?.fields?.email ? "email-error" : undefined}
                          placeholder={t("contact.ph.email")}
                        />
                        <FieldError id="email-error">{actionData?.fields?.email}</FieldError>
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          {t("contact.field.company")}
                        </span>
                        <Input
                          name="company"
                          autoComplete="organization"
                          className="rounded-lg bg-input-background px-3.5 py-2.5 text-sm"
                          placeholder={t("contact.ph.company")}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          {t("contact.field.opportunity")}
                        </span>
                        <select
                          name="category"
                          className="w-full rounded-lg border border-border bg-input-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-signal/60 focus:ring-2 focus:ring-ring/40"
                        >
                          {opportunityTypes.map((item) => (
                            <option key={item.value} value={item.value}>
                              {t(item.key)}
                            </option>
                          ))}
                        </select>
                        <FieldError id="category-error">{actionData?.fields?.category}</FieldError>
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                        {t("contact.field.message")}
                      </span>
                      <Textarea
                        name="message"
                        rows={5}
                        required
                        className="min-h-[120px] resize-y rounded-lg bg-input-background px-3.5 py-2.5 text-sm"
                        aria-invalid={Boolean(actionData?.fields?.message)}
                        aria-describedby={actionData?.fields?.message ? "message-error" : undefined}
                        placeholder={t("contact.ph.message")}
                      />
                      <FieldError id="message-error">{actionData?.fields?.message}</FieldError>
                    </label>
                    <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                      <input
                        type="checkbox"
                        name="consent"
                        className="mt-1 h-4 w-4 rounded border-border accent-[var(--signal)]"
                        aria-invalid={Boolean(actionData?.fields?.consent)}
                      />
                      <span>{t("contact.consent")}</span>
                    </label>
                    <FieldError id="consent-error">{actionData?.fields?.consent}</FieldError>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm text-primary-foreground transition-all hover:shadow-[0_0_0_1px_var(--signal)] active:scale-[0.99] disabled:opacity-70"
                    >
                      {submitting ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
                      {submitting ? t("contact.sending") : t("contact.send")}
                    </button>
                    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full ${berlin.working ? "bg-signal" : "bg-muted-foreground/50"}`}
                      />
                      {berlin.working ? t("contact.hint.online") : t("contact.hint.offline")}
                    </p>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
