import { useEffect } from "react";
import type { PortfolioProfile, PortfolioProject } from "./content";

const DEFAULT_ORIGIN = "https://a7med-sghaier.app";

export function siteOrigin(): string {
  const configured = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  if (!configured) return DEFAULT_ORIGIN;
  try {
    const url = new URL(configured);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : DEFAULT_ORIGIN;
  } catch {
    return DEFAULT_ORIGIN;
  }
}

function absoluteUrl(value: string): string {
  if (/^https?:\/\//.test(value)) return value;
  return `${siteOrigin()}${value.startsWith("/") ? value : `/${value}`}`;
}

function upsertMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  content: string,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

function upsertLink(selector: string, rel: string, href: string): HTMLLinkElement {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.append(element);
  }
  element.href = href;
  return element;
}

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  locale?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  structuredData?: unknown;
  noIndex?: boolean;
  /** Owner name from the admin-managed profile; suffixes titles and names the site. */
  siteName?: string;
}

export function Seo({
  title,
  description,
  path,
  locale = "en",
  image = "/og.png",
  imageAlt,
  type = "website",
  structuredData,
  noIndex = false,
  siteName = "Ahmed Sghaier",
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(siteName) ? title : `${title} · ${siteName}`;
    const normalizedPath = path === "/" ? "" : path;
    const canonical = `${siteOrigin()}${normalizedPath}`;
    const shareImage = absoluteUrl(image);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large",
    );
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    upsertMeta(
      'meta[property="og:site_name"]',
      "property",
      "og:site_name",
      `${siteName} — Portfolio`,
    );
    upsertMeta('meta[property="og:locale"]', "property", "og:locale", locale);
    upsertMeta('meta[property="og:image"]', "property", "og:image", shareImage);
    upsertMeta('meta[property="og:image:alt"]', "property", "og:image:alt", imageAlt ?? title);
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", shareImage);
    upsertLink('link[rel="canonical"]', "canonical", canonical);

    document.head
      .querySelectorAll<HTMLLinkElement>('link[data-portfolio-alternate="true"]')
      .forEach((element) => element.remove());
    for (const alternate of ["en", "de", "fr", "ar"]) {
      const element = document.createElement("link");
      element.rel = "alternate";
      element.hreflang = alternate;
      element.href = `${canonical}?lang=${alternate}`;
      element.dataset.portfolioAlternate = "true";
      document.head.append(element);
    }

    document.head
      .querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"][data-portfolio-jsonld="true"]',
      )
      .forEach((element) => element.remove());
    const graph = structuredData
      ? Array.isArray(structuredData)
        ? structuredData
        : [structuredData]
      : [];
    if (graph.length > 0) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.portfolioJsonld = "true";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": graph,
      }).replace(/</g, "\\u003c");
      document.head.append(script);
    }
  }, [description, image, imageAlt, locale, noIndex, path, siteName, structuredData, title, type]);

  return null;
}

export function personStructuredData(profile: PortfolioProfile | null): unknown[] {
  if (!profile) return [];
  // Inline data-URL avatars are unusable in structured data; fall back to the
  // static portrait asset in that case.
  const avatar =
    profile.avatarUrl && !profile.avatarUrl.startsWith("data:")
      ? absoluteUrl(profile.avatarUrl)
      : absoluteUrl("/images/profile/portrait.jpg");
  return [
    {
      "@type": "Person",
      name: profile.name,
      jobTitle: profile.title,
      description: profile.statement,
      url: siteOrigin(),
      image: avatar,
      email: profile.links.email ? `mailto:${profile.links.email}` : undefined,
      address: profile.location
        ? {
            "@type": "PostalAddress",
            addressLocality: profile.location,
          }
        : undefined,
      knowsAbout: profile.disciplines,
      knowsLanguage: profile.languages.map((language) => language.name),
      sameAs: [profile.links.github, profile.links.linkedin].filter(Boolean),
    },
    {
      "@type": "WebSite",
      name: `${profile.name} — Portfolio`,
      url: siteOrigin(),
    },
  ];
}

export function breadcrumbStructuredData(items: Array<{ name: string; path: string }>): unknown {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function projectStructuredData(
  project: PortfolioProject,
  profile: PortfolioProfile | null,
): unknown {
  return {
    "@type": "CreativeWork",
    name: project.title,
    description: project.tagline,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.media[0] ? absoluteUrl(project.media[0].src) : undefined,
    keywords: project.stack,
    author: profile ? { "@type": "Person", name: profile.name } : undefined,
    codeRepository: project.repo,
  };
}
