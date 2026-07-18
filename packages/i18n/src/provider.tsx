import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  dirFor,
  getMessageOverridesVersion,
  isLang,
  localeFor,
  subscribeToMessageOverrides,
  translate,
  type Direction,
  type Lang,
  type TKey,
  type TranslationValues,
} from "./core";

export type I18nContextValue = {
  lang: Lang;
  direction: Direction;
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: TKey, values?: TranslationValues) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage(storageKey: string): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage?.getItem(storageKey);
    return isLang(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredLanguage(storageKey: string, lang: Lang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(storageKey, lang);
  } catch {
    // Storage can be unavailable in privacy-restricted browsing contexts.
  }
}

export type I18nProviderProps = {
  children: ReactNode;
  initialLanguage?: Lang;
  storageKey?: string;
  persist?: boolean;
  onLanguageChange?: (lang: Lang) => void;
};

export function I18nProvider({
  children,
  initialLanguage = "en",
  storageKey = "portfolio.lang",
  persist = true,
  onLanguageChange,
}: I18nProviderProps) {
  const [lang, setLang] = useState<Lang>(() => {
    if (!persist) return initialLanguage;
    return readStoredLanguage(storageKey) ?? initialLanguage;
  });

  const direction = dirFor(lang);
  const locale = localeFor(lang);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const previous = {
      lang: root.getAttribute("lang"),
      dir: root.getAttribute("dir"),
      dataLang: root.getAttribute("data-lang"),
    };

    root.lang = lang;
    root.dir = direction;
    root.dataset.lang = lang;

    if (persist) writeStoredLanguage(storageKey, lang);
    onLanguageChange?.(lang);

    return () => {
      if (previous.lang === null) root.removeAttribute("lang");
      else root.setAttribute("lang", previous.lang);
      if (previous.dir === null) root.removeAttribute("dir");
      else root.setAttribute("dir", previous.dir);
      if (previous.dataLang === null) root.removeAttribute("data-lang");
      else root.setAttribute("data-lang", previous.dataLang);
    };
  }, [direction, lang, onLanguageChange, persist, storageKey]);

  // Re-renders consumers when remotely managed copy arrives or changes.
  const overridesVersion = useSyncExternalStore(
    subscribeToMessageOverrides,
    getMessageOverridesVersion,
    getMessageOverridesVersion,
  );

  const t = useCallback(
    (key: TKey, values?: TranslationValues) => translate(lang, key, values),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- overridesVersion invalidates translate's module-level source.
    [lang, overridesVersion],
  );
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, options).format(value),
    [locale],
  );
  const formatDate = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, options).format(
        value instanceof Date ? value : new Date(value),
      ),
    [locale],
  );

  const context = useMemo<I18nContextValue>(
    () => ({
      lang,
      direction,
      locale,
      setLang,
      t,
      formatNumber,
      formatDate,
    }),
    [direction, formatDate, formatNumber, lang, locale, t],
  );

  return <I18nContext.Provider value={context}>{children}</I18nContext.Provider>;
}

export function useOptionalI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}

export function useI18n(): I18nContextValue {
  const context = useOptionalI18n();
  if (!context) throw new Error("useI18n must be used within an I18nProvider.");
  return context;
}
