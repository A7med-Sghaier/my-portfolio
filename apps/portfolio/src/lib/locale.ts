import type { Lang } from "@portfolio/i18n";

export function localizedPath(path: string, locale: Lang): string {
  const url = new URL(path, "https://portfolio.local");
  url.searchParams.delete("lang");
  if (locale !== "en") url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}${url.hash}`;
}
