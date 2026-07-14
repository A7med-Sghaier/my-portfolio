import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@portfolio/ui";
import { useI18n, type TKey } from "@portfolio/i18n";
import { ArrowUpRight, BookOpenCheck, MessageCircleQuestion, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import type { PortfolioContent } from "@/lib/content";
import { answerPortfolioQuestion, type PortfolioAnswer } from "@/lib/portfolio-assistant";
import { localizedPath } from "@/lib/locale";

interface AssistantMessage {
  id: number;
  role: "visitor" | "portfolio";
  text: string;
  sources: PortfolioAnswer["sources"];
}

const suggestionKeys: TKey[] = ["asst.q1", "asst.q2", "asst.q3", "asst.q4", "asst.q5"];

export function PortfolioAssistant({ content }: { content: PortfolioContent }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const profileName = content.profile?.name ?? "Ahmed";
  const firstName = profileName.split(/\s+/)[0] ?? profileName;
  const greeting = t("asst.greeting", { name: firstName });
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: 0, role: "portfolio", text: greeting, sources: [] },
  ]);

  useEffect(() => {
    nextId.current = 1;
    setInput("");
    setMessages([{ id: 0, role: "portfolio", text: greeting, sources: [] }]);
  }, [greeting]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "auto" });
  }, [messages]);

  const send = (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question) return;
    const answer = answerPortfolioQuestion(content, question, t("asst.fallback"));
    const visitorId = nextId.current++;
    const answerId = nextId.current++;
    setMessages((current) => [
      ...current,
      { id: visitorId, role: "visitor", text: question, sources: [] },
      { id: answerId, role: "portfolio", text: answer.text, sources: answer.sources },
    ]);
    setInput("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(input);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed bottom-5 end-5 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-signal/40 bg-card/90 px-4 text-sm font-medium text-foreground shadow-lg shadow-black/20 backdrop-blur transition-[border-color,transform] hover:-translate-y-0.5 hover:border-signal"
          aria-label={t("asst.launcher")}
        >
          <span className="relative grid h-6 w-6 place-items-center rounded-full bg-signal/12 text-signal">
            <MessageCircleQuestion aria-hidden className="h-4 w-4" />
            <span
              aria-hidden
              className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-signal"
            />
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.12em] sm:inline">
            {t("asst.launcher")}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="end"
        hideClose
        className="w-[min(28rem,94vw)] gap-0 p-0"
        aria-describedby="portfolio-assistant-description"
      >
        <SheetClose
          className="absolute end-4 top-4 z-10 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={t("portfolio.nav.close")}
        >
          <X aria-hidden className="size-4" />
        </SheetClose>
        <header className="border-b border-border px-5 py-4 pe-14">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-signal/30 bg-signal/10 text-signal">
              <BookOpenCheck aria-hidden className="h-4 w-4" />
            </span>
            <div>
              <SheetTitle className="text-base">{t("asst.title")}</SheetTitle>
              <SheetDescription
                id="portfolio-assistant-description"
                className="mt-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em]"
              >
                {t("asst.subtitle")}
              </SheetDescription>
            </div>
          </div>
        </header>

        <div
          ref={bodyRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 space-y-4 overflow-y-auto px-4 py-5"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={`flex ${message.role === "visitor" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                  message.role === "visitor"
                    ? "rounded-ee-sm bg-signal/14 text-foreground"
                    : "rounded-es-sm bg-secondary/65 text-muted-foreground"
                }`}
              >
                {message.text}
                {message.sources.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
                    {message.sources.map((source) => (
                      <Link
                        key={source.id}
                        to={localizedPath(source.path, lang)}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 font-mono text-[0.62rem] text-muted-foreground transition-colors hover:border-signal/45 hover:text-signal"
                      >
                        {source.label}
                        <ArrowUpRight aria-hidden className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}

          {messages.length === 1 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestionKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => send(t(key))}
                  className="rounded-full border border-border bg-background/55 px-3 py-1.5 text-start text-xs leading-5 text-muted-foreground transition-colors hover:border-signal/45 hover:text-foreground"
                >
                  {t(key)}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 border-t border-border bg-card px-3 py-3"
        >
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t("asst.placeholder")}</span>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  send(input);
                }
              }}
              rows={2}
              maxLength={500}
              placeholder={t("asst.placeholder")}
              className="max-h-28 min-h-11 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-5 outline-none transition-colors placeholder:text-muted-foreground focus:border-signal/55"
            />
          </label>
          <button
            type="submit"
            disabled={!input.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-signal text-signal-foreground transition-opacity disabled:opacity-40"
            aria-label={t("asst.send")}
          >
            <Send aria-hidden className="h-4 w-4 rtl:rotate-180" />
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
