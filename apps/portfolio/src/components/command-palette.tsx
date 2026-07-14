import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@portfolio/ui";
import { LANGS, useI18n, type Lang, type TKey } from "@portfolio/i18n";
import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  Check,
  FileText,
  FolderKanban,
  Github,
  Home,
  Languages,
  Layers3,
  Linkedin,
  Mail,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import type { PortfolioContent } from "@/lib/content";
import { localizedPath } from "@/lib/locale";

type CommandGroup = "navigate" | "actions" | "links" | "language";

interface PaletteCommand {
  id: string;
  label: string;
  keywords: string;
  group: CommandGroup;
  Icon: typeof Home;
  run: () => void;
}

interface CopyFeedback {
  kind: "success" | "error";
  message: string;
}

const groupOrder: CommandGroup[] = ["navigate", "actions", "links", "language"];

const groupKeys: Record<CommandGroup, TKey> = {
  navigate: "cmd.g.navigate",
  actions: "cmd.g.actions",
  links: "cmd.g.links",
  language: "cmd.g.language",
};

export function CommandPalette({
  open,
  onOpenChange,
  content,
  dark,
  onToggleTheme,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: PortfolioContent;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const { t, lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const copyAttemptRef = useRef(0);
  const profile = content.profile;
  const github = profile?.links.github;
  const linkedin = profile?.links.linkedin;
  const email = profile?.links.email;

  const close = useCallback(() => {
    copyAttemptRef.current += 1;
    setQuery("");
    setActiveIndex(0);
    setCopyFeedback(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const commands = useMemo<PaletteCommand[]>(() => {
    const go = (path: string) => () => {
      void navigate(localizedPath(path, lang));
      close();
    };
    const navigation: PaletteCommand[] = [
      {
        id: "home",
        label: t("nav.home"),
        keywords: "home start",
        group: "navigate",
        Icon: Home,
        run: go("/"),
      },
      {
        id: "about",
        label: t("nav.about"),
        keywords: "profile bio",
        group: "navigate",
        Icon: UserRound,
        run: go("/about"),
      },
      {
        id: "experience",
        label: t("nav.experience"),
        keywords: "career work",
        group: "navigate",
        Icon: BriefcaseBusiness,
        run: go("/experience"),
      },
      {
        id: "projects",
        label: t("nav.projects"),
        keywords: "work case studies",
        group: "navigate",
        Icon: FolderKanban,
        run: go("/projects"),
      },
      {
        id: "expertise",
        label: t("nav.expertise"),
        keywords: "skills capabilities",
        group: "navigate",
        Icon: Layers3,
        run: go("/expertise"),
      },
      {
        id: "resume",
        label: t("nav.resume"),
        keywords: "cv curriculum",
        group: "navigate",
        Icon: FileText,
        run: go("/resume"),
      },
      {
        id: "contact",
        label: t("nav.contact"),
        keywords: "email message",
        group: "navigate",
        Icon: Mail,
        run: go("/contact"),
      },
    ];
    const actions: PaletteCommand[] = [
      {
        id: "theme",
        label: dark ? t("cmd.act.themeLight") : t("cmd.act.themeDark"),
        keywords: "theme appearance dark light",
        group: "actions",
        Icon: dark ? Sun : Moon,
        run: () => {
          onToggleTheme();
          close();
        },
      },
    ];
    const links: PaletteCommand[] = [];
    if (github) {
      links.push({
        id: "github",
        label: t("cta.openGithub"),
        keywords: "github repository code",
        group: "links",
        Icon: Github,
        run: () => {
          window.open(github, "_blank", "noopener,noreferrer");
          close();
        },
      });
    }
    if (linkedin) {
      links.push({
        id: "linkedin",
        label: t("cmd.act.linkedin"),
        keywords: "linkedin profile",
        group: "links",
        Icon: Linkedin,
        run: () => {
          window.open(linkedin, "_blank", "noopener,noreferrer");
          close();
        },
      });
    }
    if (email) {
      links.push({
        id: "email",
        label: t("cmd.act.copyEmail"),
        keywords: "email mail copy",
        group: "links",
        Icon: Mail,
        run: () => {
          const attempt = ++copyAttemptRef.current;
          if (!navigator.clipboard?.writeText) {
            setCopyFeedback({ kind: "error", message: t("cmd.copyFailed", { email }) });
            return;
          }
          void navigator.clipboard
            .writeText(email)
            .then(() => {
              if (copyAttemptRef.current === attempt) {
                setCopyFeedback({
                  kind: "success",
                  message: t("cmd.copySuccess", { email }),
                });
              }
            })
            .catch(() => {
              if (copyAttemptRef.current === attempt) {
                setCopyFeedback({ kind: "error", message: t("cmd.copyFailed", { email }) });
              }
            });
        },
      });
    }
    const languages: PaletteCommand[] = LANGS.map((option) => ({
      id: `language-${option.code}`,
      label: option.native,
      keywords: `${option.code} ${option.label}`,
      group: "language",
      Icon: option.code === lang ? Check : Languages,
      run: () => {
        const next = option.code as Lang;
        void navigate(
          localizedPath(`${location.pathname}${location.search}${location.hash}`, next),
          {
            replace: true,
          },
        );
        close();
      },
    }));
    return [...navigation, ...actions, ...links, ...languages];
  }, [
    close,
    dark,
    email,
    github,
    lang,
    linkedin,
    location.pathname,
    location.search,
    location.hash,
    navigate,
    onToggleTheme,
    t,
  ]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.keywords}`.toLocaleLowerCase().includes(needle),
    );
  }, [commands, query]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    if (!open) return;
    const command = filtered[activeIndex];
    if (!command) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`portfolio-command-${command.id}`)
        ?.scrollIntoView?.({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeIndex, filtered, open]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        if (open) close();
        else onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close, onOpenChange, open]);

  const selectActive = () => filtered[activeIndex]?.run();
  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((value) => (value + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => (value - 1 + filtered.length) % filtered.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      selectActive();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        hideClose
        className="max-w-2xl gap-0 overflow-hidden p-0 rtl:translate-x-1/2"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          window.requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <DialogTitle className="sr-only">{t("footer.command")}</DialogTitle>
        <DialogDescription className="sr-only">{t("cmd.footer")}</DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <Search aria-hidden className="h-5 w-5 shrink-0 text-signal" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="portfolio-command-results"
            aria-activedescendant={
              filtered[activeIndex] ? `portfolio-command-${filtered[activeIndex].id}` : undefined
            }
            placeholder={t("cmd.placeholder.search")}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-[0.62rem] text-muted-foreground sm:inline-flex">
            Esc
          </kbd>
          <DialogClose asChild>
            <button
              type="button"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={`${t("portfolio.nav.close")} · ${t("footer.command")}`}
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>
        <div
          id="portfolio-command-results"
          role="listbox"
          className="max-h-[min(58vh,32rem)] overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t("cmd.noMatches")}
            </p>
          ) : (
            groupOrder.map((group) => {
              const entries = filtered.filter((command) => command.group === group);
              if (entries.length === 0) return null;
              return (
                <section
                  key={group}
                  role="group"
                  aria-labelledby={`portfolio-command-group-${group}`}
                  className="pb-2 last:pb-0"
                >
                  <h2
                    id={`portfolio-command-group-${group}`}
                    className="px-3 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {t(groupKeys[group])}
                  </h2>
                  {entries.map((command) => {
                    const index = filtered.indexOf(command);
                    const active = index === activeIndex;
                    return (
                      <button
                        id={`portfolio-command-${command.id}`}
                        key={command.id}
                        type="button"
                        role="option"
                        tabIndex={-1}
                        aria-selected={active}
                        onPointerMove={() => setActiveIndex(index)}
                        onClick={command.run}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors ${
                          active
                            ? "bg-signal/10 text-foreground"
                            : "text-muted-foreground hover:bg-secondary/55 hover:text-foreground"
                        }`}
                      >
                        <command.Icon
                          aria-hidden
                          className={`h-4 w-4 shrink-0 ${active ? "text-signal" : ""}`}
                        />
                        <span className="flex-1">{command.label}</span>
                        {active ? (
                          <span aria-hidden className="inline-flex items-center gap-1 text-signal">
                            <ArrowUp className="h-3 w-3" />
                            <ArrowDown className="h-3 w-3" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </section>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 font-mono text-[0.62rem] text-muted-foreground">
          <span>{profile?.name ?? t("set.publicProfile")}</span>
          {copyFeedback ? (
            <span
              role={copyFeedback.kind === "error" ? "alert" : "status"}
              className={copyFeedback.kind === "error" ? "text-destructive" : "text-signal"}
            >
              {copyFeedback.message}
            </span>
          ) : (
            <span className="hidden sm:inline">{t("cmd.footer")}</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
