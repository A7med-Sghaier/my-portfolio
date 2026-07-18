import { ar } from "./messages/ar";
import { de } from "./messages/de";
import { en } from "./messages/en";
import { fr } from "./messages/fr";

export type Lang = "en" | "de" | "fr" | "ar";
export type Direction = "ltr" | "rtl";
export type TKey = keyof typeof en;
export type TranslationValues = Record<string, string | number>;
export type Dictionary = Record<TKey, string>;

export type LanguageOption = {
  code: Lang;
  label: string;
  native: string;
  nativeLabel: string;
  direction: Direction;
  locale: string;
};

export const LANGS = [
  {
    code: "en",
    label: "English",
    native: "English",
    nativeLabel: "English",
    direction: "ltr",
    locale: "en-US",
  },
  {
    code: "de",
    label: "German",
    native: "Deutsch",
    nativeLabel: "Deutsch",
    direction: "ltr",
    locale: "de-DE",
  },
  {
    code: "fr",
    label: "French",
    native: "Français",
    nativeLabel: "Français",
    direction: "ltr",
    locale: "fr-FR",
  },
  {
    code: "ar",
    label: "Arabic",
    native: "العربية",
    nativeLabel: "العربية",
    direction: "rtl",
    locale: "ar-EG",
  },
] as const satisfies readonly LanguageOption[];

export const messages = {
  en,
  de,
  fr,
  ar,
} satisfies Record<Lang, Dictionary>;

const LANGUAGE_SET = new Set<Lang>(LANGS.map(({ code }) => code));

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && LANGUAGE_SET.has(value as Lang);
}

export function dirFor(lang: Lang): Direction {
  return lang === "ar" ? "rtl" : "ltr";
}

export function localeFor(lang: Lang): string {
  return LANGS.find(({ code }) => code === lang)?.locale ?? "en-US";
}

export type MessageOverrides = Partial<Record<Lang, Record<string, string>>>;

// Remotely managed copy loaded at runtime (the admin edits it). The bundled
// dictionaries stay authoritative for any key or locale without an override.
let messageOverrides: MessageOverrides = {};
let overridesVersion = 0;
const overrideListeners = new Set<() => void>();

export function setMessageOverrides(overrides: MessageOverrides): void {
  messageOverrides = overrides;
  overridesVersion += 1;
  for (const listener of overrideListeners) listener();
}

export function getMessageOverrides(): MessageOverrides {
  return messageOverrides;
}

export function subscribeToMessageOverrides(listener: () => void): () => void {
  overrideListeners.add(listener);
  return () => overrideListeners.delete(listener);
}

export function getMessageOverridesVersion(): number {
  return overridesVersion;
}

export function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (token, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token,
  );
}

export function translate(lang: Lang, key: TKey, values?: TranslationValues): string {
  const template =
    messageOverrides[lang]?.[key] ??
    messages[lang][key] ??
    messageOverrides.en?.[key] ??
    messages.en[key] ??
    key;
  return interpolate(template, values);
}

export function createTranslator(lang: Lang) {
  return (key: TKey, values?: TranslationValues) => translate(lang, key, values);
}

/**
 * Runtime guard for data loaded from an external translation source. The
 * bundled dictionaries are also checked statically by the `messages` type.
 */
export function assertDictionaryParity(
  candidate: Partial<Record<Lang, Record<string, string>>> = messages,
): void {
  const expected = Object.keys(messages.en).sort();

  for (const { code } of LANGS) {
    const dictionary = candidate[code];
    if (!dictionary) throw new Error(`Missing dictionary for locale "${code}".`);

    const actual = Object.keys(dictionary).sort();
    const missing = expected.filter((key) => !(key in dictionary));
    const extra = actual.filter((key) => !(key in messages.en));

    if (missing.length > 0 || extra.length > 0) {
      throw new Error(
        `Dictionary "${code}" is out of sync. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`,
      );
    }
  }
}
