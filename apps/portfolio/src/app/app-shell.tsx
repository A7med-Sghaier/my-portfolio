import { LANGS, useI18n, type Lang } from "@portfolio/i18n";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  Command as CommandIcon,
  Github,
  Globe,
  Linkedin,
  Mail,
  Menu,
  Moon,
  Palette,
  Sun,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import type { RootLoaderData } from "@/lib/loaders";
import { CommandPalette } from "@/components/command-palette";
import { PortfolioAssistant } from "@/components/portfolio-assistant";
import { SystemHud } from "@/components/system-hud";
import { localizedPath } from "@/lib/locale";

const navigationItems = [
  { to: "/about", key: "nav.about" },
  { to: "/experience", key: "nav.experience" },
  { to: "/projects", key: "nav.projects" },
  { to: "/expertise", key: "nav.expertise" },
  { to: "/resume", key: "nav.resume" },
  { to: "/contact", key: "nav.contact" },
] as const;

const STACK = ["React", "TypeScript", "Tailwind", "Motion"] as const;
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? "");

export const THEME_STORAGE_KEY = "portfolio.theme";

export function applyDarkTheme(dark: boolean, persist = false): void {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  if (!persist) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // Theme switching still works when preference storage is unavailable.
  }
}

export function initialDarkTheme(): boolean {
  let dark = document.documentElement.classList.contains("dark");
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") dark = stored === "dark";
  } catch {
    // Storage can be unavailable in hardened browsing modes; the document default remains valid.
  }
  applyDarkTheme(dark);
  return dark;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed start-0 top-0 z-[60] h-0.5 w-full origin-left bg-signal rtl:origin-right"
      style={{ scaleX }}
    />
  );
}

function LocaleSwitcher() {
  const { lang, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((language) => language.code === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onChange = (next: Lang) => {
    if (next === lang) {
      setOpen(false);
      return;
    }
    const search = new URLSearchParams(location.search);
    if (next === "en") search.delete("lang");
    else search.set("lang", next);
    setOpen(false);
    void navigate(
      {
        pathname: location.pathname,
        search: search.toString() ? `?${search.toString()}` : "",
        hash: location.hash,
      },
      { replace: true },
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("lang.label")}: ${current.label}`}
        className="group flex h-9 items-center gap-1.5 rounded-md border border-border px-2.5 text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground"
      >
        <Globe aria-hidden className="h-4 w-4" />
        <span className="font-mono text-xs uppercase tracking-wide">{current.code}</span>
        <ChevronDown
          aria-hidden
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            aria-label={t("lang.label")}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute end-0 z-50 mt-2 min-w-40 origin-top overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl shadow-black/10 backdrop-blur-xl"
          >
            {LANGS.map((language) => {
              const active = language.code === lang;
              return (
                <li key={language.code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => onChange(language.code)}
                    dir={language.direction}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active ? "bg-signal/10 text-signal" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="flex flex-col items-start leading-tight">
                      <span className={active ? "font-medium" : "font-normal"}>
                        {language.native}
                      </span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                        {language.code}
                      </span>
                    </span>
                    {active ? <Check aria-hidden className="h-4 w-4 shrink-0" /> : null}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? t("cmd.act.themeLight") : t("cmd.act.themeDark")}
      className="relative grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-signal/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Sun
        aria-hidden
        className={`h-4 w-4 transition-all ${
          dark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        }`}
      />
      <Moon
        aria-hidden
        className={`absolute h-4 w-4 transition-all ${
          dark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
    </button>
  );
}

function ProfileAvatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <span
      className="shrink-0 overflow-hidden rounded-full border border-border ring-1 ring-signal/30"
      style={{ width: size, height: size }}
    >
      <img
        src="/images/profile/portrait.jpg"
        alt={`${name} portrait`}
        width={size * 3}
        height={size * 3}
        className="h-full w-full object-cover object-top"
      />
    </span>
  );
}

function SiteHeader({
  data,
  dark,
  onToggleTheme,
}: {
  data: RootLoaderData;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const { t, lang } = useI18n();
  const profile = data.content.profile;
  const profileName = profile?.name || t("set.publicProfile");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav
        aria-label={t("portfolio.nav.primary")}
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
      >
        <NavLink
          to={localizedPath("/", lang)}
          className="group flex items-center gap-2.5"
          aria-label={`${profileName} — ${t("nav.home")}`}
        >
          <ProfileAvatar name={profileName} />
          <span className="flex flex-col leading-none">
            <span
              className="font-display tracking-tight"
              style={{ fontSize: "1.05rem", fontWeight: 600 }}
            >
              {profileName}
            </span>
            <span
              className="font-mono text-muted-foreground transition-colors group-hover:text-signal"
              style={{ fontSize: "0.62rem", letterSpacing: "0.12em" }}
            >
              {t("brand.tagline")}
            </span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={localizedPath(item.to, lang)}
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {t(item.key)}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-2.5 -bottom-0.5 h-px bg-signal"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
          <div className="ms-2 flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          <button
            type="button"
            aria-label={open ? t("portfolio.nav.close") : t("portfolio.nav.open")}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border"
          >
            {open ? (
              <X aria-hidden className="h-4 w-4" />
            ) : (
              <Menu aria-hidden className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav aria-label={t("portfolio.nav.mobile")} className="flex flex-col p-4">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={localizedPath(item.to, lang)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-3 text-sm ${
                      isActive ? "bg-secondary text-foreground" : "text-muted-foreground"
                    }`
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

type BerlinStatus = {
  time: string;
  tzLabel: string;
  isWorking: boolean;
  isWeekend: boolean;
};

function berlinStatus(now: Date): BerlinStatus {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  const weekday = part("weekday");
  const hour = Number(part("hour"));
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  return {
    time: `${part("hour")}:${part("minute")}`,
    tzLabel: part("timeZoneName") || "CET",
    isWorking: !isWeekend && hour >= 9 && hour < 18,
    isWeekend,
  };
}

function SystemStatus({ dark }: { dark: boolean }) {
  const { t, lang } = useI18n();
  const reduced = useReducedMotion();
  const [status, setStatus] = useState(() => berlinStatus(new Date()));

  useEffect(() => {
    const interval = window.setInterval(() => setStatus(berlinStatus(new Date())), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const langNative = LANGS.find((language) => language.code === lang)?.native ?? lang.toUpperCase();
  const presence = status.isWeekend
    ? t("status.presence.weekend")
    : status.isWorking
      ? t("status.presence.working")
      : t("status.presence.off");

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-secondary/20 px-4 py-3 font-mono text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-2 text-foreground/80">
        <span className="relative inline-flex h-2 w-2">
          {!reduced ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-signal"
              animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
        </span>
        <Activity aria-hidden className="h-3.5 w-3.5" />
        {t("status.operational")}
      </span>

      <span aria-hidden className="hidden h-3 w-px bg-border sm:inline-block" />

      <span className="inline-flex items-center gap-1.5">
        <Clock aria-hidden className="h-3.5 w-3.5" />
        <span className="tabular-nums text-foreground/80">{status.time}</span> {status.tzLabel}
        <span className="text-border">·</span>
        <span className={status.isWorking ? "text-signal" : ""}>{presence}</span>
      </span>

      <span aria-hidden className="hidden h-3 w-px bg-border sm:inline-block" />

      <span className="inline-flex items-center gap-1.5">
        <Palette aria-hidden className="h-3.5 w-3.5" />
        {dark ? t("status.theme.dark") : t("status.theme.light")}
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Globe aria-hidden className="h-3.5 w-3.5" />
        {langNative}
      </span>
    </div>
  );
}

function SiteFooter({
  data,
  dark,
  onOpenCommand,
}: {
  data: RootLoaderData;
  dark: boolean;
  onOpenCommand: () => void;
}) {
  const { t, lang } = useI18n();
  const profile = data.content.profile;
  const profileName = profile?.name || t("set.publicProfile");
  const links = [
    profile?.links.github ? { href: profile.links.github, label: "GitHub", Icon: Github } : null,
    profile?.links.linkedin
      ? { href: profile.links.linkedin, label: "LinkedIn", Icon: Linkedin }
      : null,
    profile?.links.email
      ? { href: `mailto:${profile.links.email}`, label: t("contact.field.email"), Icon: Mail }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);
  let domain = "a7med-sghaier.app";
  if (profile?.links.domain) {
    try {
      domain = new URL(profile.links.domain).hostname;
    } catch {
      // The normalized profile already rejects unsafe URLs; retain the canonical fallback.
    }
  }

  return (
    <footer data-portfolio-footer data-hud-hide className="mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <ProfileAvatar size={30} name={profileName} />
              <span className="font-display" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
                {profileName}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {profile?.statement || t("profile.statement")}
            </p>
            <p className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span
                aria-hidden
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-signal"
              />
              {t("footer.availability")}
            </p>

            <button
              type="button"
              onClick={onOpenCommand}
              className="group mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground"
              aria-label={t("footer.command")}
            >
              <CommandIcon
                aria-hidden
                className="h-3.5 w-3.5 transition-colors group-hover:text-signal"
              />
              <span>{t("footer.command")}</span>
              <kbd className="ms-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.65rem] tracking-wide text-muted-foreground">
                {IS_MAC ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer.navigate")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {navigationItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={localizedPath(item.to, lang)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t("footer.elsewhere")}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {links.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    className="group inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                    {label}
                    <ArrowUpRight
                      aria-hidden
                      className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <SystemStatus dark={dark} />
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
            <span className="text-foreground/80">{t("footer.colophon")}</span>
            <span className="text-border">·</span>
            {STACK.map((technology, index) => (
              <span key={technology} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="text-border">·</span> : null}
                {technology}
              </span>
            ))}
          </p>
          <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <span className="font-mono">
              © {new Date().getFullYear()} {profileName}
              {profile?.location ? ` · ${profile.location}` : ""}
            </span>
            <span className="font-mono">{domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell() {
  const data = useRouteLoaderData<RootLoaderData>("portfolio-root");
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const navigation = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dark, setDark] = useState(initialDarkTheme);

  const toggleTheme = useCallback(() => {
    setDark((current) => {
      const next = !current;
      applyDarkTheme(next, true);
      return next;
    });
  }, []);

  const openCommand = useCallback(() => setPaletteOpen(true), []);

  useEffect(() => {
    if (data && data.locale !== lang) setLang(data.locale);
  }, [data, lang, setLang]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  if (!data) throw new Error(t("error.unavailable.body"));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("portfolio.skip")}
      </a>
      <ScrollProgress />
      <div
        aria-hidden
        className={`fixed inset-x-0 top-0 z-[65] h-0.5 origin-left bg-signal transition-opacity ${
          navigation.state === "idle" ? "opacity-0" : "animate-pulse opacity-100"
        }`}
      />
      <SiteHeader data={data} dark={dark} onToggleTheme={toggleTheme} />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter data={data} dark={dark} onOpenCommand={openCommand} />
      <SystemHud
        content={data.content}
        navigationState={navigation.state}
        onOpenCommand={openCommand}
      />
      <PortfolioAssistant content={data.content} />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        content={data.content}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
