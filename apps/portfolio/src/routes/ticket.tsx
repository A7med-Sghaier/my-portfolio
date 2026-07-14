import { localeFor, useI18n, type TKey } from "@portfolio/i18n";
import { ArrowLeft, Check, Search, Send, ShieldCheck, Ticket as TicketIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Form, useActionData, useNavigation, useSearchParams } from "react-router";
import { PageBackdrop } from "@/components/reference-backgrounds";
import { Eyebrow } from "@/components/reference-home/ui";
import type { PublicTicket, TicketStatus } from "@/lib/content";
import type { TicketActionData } from "@/lib/loaders";
import { breadcrumbStructuredData, Seo } from "@/lib/seo";
import { usePortfolioData } from "@/lib/use-content";

const statusSteps: Array<{ status: TicketStatus; key: TKey }> = [
  { status: "received", key: "ticket.status.received" },
  { status: "reviewed", key: "ticket.status.reviewed" },
  { status: "discussion", key: "ticket.status.discussion" },
  { status: "closed", key: "ticket.status.closed" },
];

function TicketProgress({ status }: { status: TicketStatus }) {
  const { t } = useI18n();
  const current = statusSteps.findIndex((step) => step.status === status);
  return (
    <ol className="flex items-center gap-1.5" aria-label={t("ticket.title")}>
      {statusSteps.map((step, index) => {
        const done = index <= current;
        const active = index === current;
        return (
          <li key={step.status} className="flex flex-1 items-center gap-1.5">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[0.6rem] transition-colors ${
                  done
                    ? "border-signal bg-signal/15 text-signal"
                    : "border-border text-muted-foreground"
                } ${active ? "ring-2 ring-signal/30" : ""}`}
              >
                {done && index < current ? <Check aria-hidden className="h-3 w-3" /> : index + 1}
              </span>
              <span
                className={`text-center font-mono text-[0.58rem] uppercase tracking-wide ${
                  done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {t(step.key)}
              </span>
            </div>
            {index < statusSteps.length - 1 ? (
              <span
                aria-hidden
                className={`h-px flex-1 ${index < current ? "bg-signal/50" : "bg-border"}`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function ConversationBubble({
  mine,
  name,
  body,
  createdAt,
}: {
  mine: boolean;
  name: string;
  body: string;
  createdAt: string;
}) {
  const { lang, t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
          mine ? "border-signal/30 bg-signal/5" : "border-border bg-card"
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.62rem] uppercase tracking-wide text-signal">
            {mine ? t("ticket.you") : name}
          </span>
          {createdAt ? (
            <time className="font-mono text-[0.58rem] text-muted-foreground">
              {new Intl.DateTimeFormat(localeFor(lang), {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(createdAt))}
            </time>
          ) : null}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-[1.55] text-foreground">{body}</p>
      </div>
    </motion.div>
  );
}

export function TicketPage() {
  const { locale } = usePortfolioData();
  const { t } = useI18n();
  const actionData = useActionData<TicketActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const [ticket, setTicket] = useState<PublicTicket | null>(null);
  const [credentials, setCredentials] = useState<{ ref: string; email: string } | null>(null);
  const [ignorePreviousLookup, setIgnorePreviousLookup] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (actionData?.ok && actionData.ticket && actionData.ref && actionData.email) {
      setTicket(actionData.ticket);
      setCredentials({ ref: actionData.ref, email: actionData.email });
      setIgnorePreviousLookup(false);
      if (actionData.intent === "reply") setReplyBody("");
    }
  }, [actionData]);

  const submitting = navigation.state === "submitting";
  const intent = navigation.formData?.get("intent");
  const signOut = () => {
    setTicket(null);
    setCredentials(null);
    setIgnorePreviousLookup(true);
    setReplyBody("");
  };
  const field =
    "w-full rounded-lg border border-border bg-input-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-signal/60 focus:ring-2 focus:ring-ring/40";

  return (
    <div className="relative isolate mx-auto max-w-2xl px-5 pb-16 pt-32">
      <Seo
        title={t("ticket.eyebrow")}
        description={t("ticket.intro")}
        path="/ticket"
        locale={locale}
        noIndex
        structuredData={breadcrumbStructuredData([
          { name: t("nav.home"), path: "/" },
          { name: t("ticket.eyebrow"), path: "/ticket" },
        ])}
      />
      <PageBackdrop motif="grid" />
      <Eyebrow>{t("ticket.eyebrow")}</Eyebrow>
      <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] font-medium tracking-tight">
        {t("ticket.title")}
      </h1>

      <div className="mt-8">
        {!ticket || !credentials ? (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-sm leading-[1.6] text-muted-foreground">{t("ticket.intro")}</p>
            <Form method="post" className="mt-6 space-y-4" noValidate>
              <input type="hidden" name="intent" value="lookup" />
              {actionData?.message && actionData.intent === "lookup" ? (
                <p className="text-sm text-destructive" role="alert">
                  {actionData.message}
                </p>
              ) : null}
              <label className="block">
                <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  {t("ticket.field.ref")}
                </span>
                <input
                  name="ref"
                  required
                  autoCapitalize="characters"
                  defaultValue={
                    ignorePreviousLookup ? "" : (actionData?.ref ?? searchParams.get("ref") ?? "")
                  }
                  className={`${field} font-mono uppercase tracking-widest`}
                  placeholder="AS-XXXX"
                  aria-invalid={Boolean(actionData?.fields?.ref)}
                />
                {actionData?.fields?.ref ? (
                  <span className="mt-1.5 block text-xs text-destructive">
                    {actionData.fields.ref}
                  </span>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                  {t("ticket.field.email")}
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={ignorePreviousLookup ? "" : (actionData?.email ?? "")}
                  className={field}
                  placeholder={t("ticket.ph.email")}
                  aria-invalid={Boolean(actionData?.fields?.email)}
                />
                {actionData?.fields?.email ? (
                  <span className="mt-1.5 block text-xs text-destructive">
                    {actionData.fields.email}
                  </span>
                ) : null}
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm text-primary-foreground transition-all hover:shadow-[0_0_0_1px_var(--signal)] active:scale-[0.99] disabled:opacity-50"
              >
                <Search aria-hidden className="h-4 w-4" />
                {submitting && intent === "lookup" ? t("ticket.lookingUp") : t("ticket.lookup")}
              </button>
            </Form>
            <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t("ticket.privacy")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" /> {t("ticket.another")}
            </button>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-mono font-semibold tracking-widest text-signal">
                  <TicketIcon aria-hidden className="h-4 w-4" /> {ticket.ref}
                </span>
                {ticket.createdAt ? (
                  <time className="font-mono text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(localeFor(locale), {
                      dateStyle: "medium",
                    }).format(new Date(ticket.createdAt))}
                  </time>
                ) : null}
              </div>
              <div className="mt-6">
                <TicketProgress status={ticket.status} />
              </div>
            </div>

            <div className="space-y-3" aria-label={t("ticket.conversation")}>
              <ConversationBubble
                mine
                name={ticket.name}
                body={ticket.message}
                createdAt={ticket.createdAt}
              />
              {ticket.thread.map((entry) => (
                <ConversationBubble
                  key={entry.id}
                  mine={entry.author === "visitor"}
                  name={entry.author === "ahmed" ? "Ahmed Sghaier" : ticket.name}
                  body={entry.body}
                  createdAt={entry.createdAt}
                />
              ))}
            </div>

            {ticket.status === "closed" ? (
              <p className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-center text-sm text-muted-foreground">
                {t("ticket.closed")}
              </p>
            ) : null}
            {actionData?.message && actionData.intent === "reply" ? (
              <p className="text-sm text-destructive" role="alert">
                {actionData.message}
              </p>
            ) : null}

            <div className="rounded-2xl border border-border bg-card p-4">
              <Form method="post">
                <input type="hidden" name="intent" value="reply" />
                <input type="hidden" name="ref" value={credentials.ref} />
                <input type="hidden" name="email" value={credentials.email} />
                <label className="sr-only" htmlFor="ticket-reply">
                  {t("ticket.reply.ph")}
                </label>
                <textarea
                  id="ticket-reply"
                  name="body"
                  rows={4}
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  className={`${field} min-h-[90px] resize-y`}
                  placeholder={t("ticket.reply.ph")}
                  aria-invalid={Boolean(actionData?.fields?.body)}
                />
                {actionData?.fields?.body ? (
                  <span className="mt-1.5 block text-xs text-destructive">
                    {actionData.fields.body}
                  </span>
                ) : null}
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || replyBody.trim().length < 2}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-all hover:shadow-[0_0_0_1px_var(--signal)] active:scale-[0.99] disabled:opacity-50"
                  >
                    <Send aria-hidden className="h-4 w-4" />
                    {submitting && intent === "reply"
                      ? t("contact.sending")
                      : t("ticket.reply.send")}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
