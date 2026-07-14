import type { PortfolioContent } from "./content";

export interface PortfolioFact {
  id: string;
  label: string;
  path: string;
  text: string;
  searchText: string;
}

export interface PortfolioAnswer {
  text: string;
  sources: Array<Pick<PortfolioFact, "id" | "label" | "path">>;
}

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "at",
  "does",
  "he",
  "his",
  "is",
  "me",
  "of",
  "the",
  "what",
  "with",
  "und",
  "was",
  "wie",
  "ist",
  "er",
  "de",
  "des",
  "est",
  "il",
  "le",
  "les",
  "que",
  "عن",
  "في",
  "ما",
  "ماذا",
  "هو",
]);

function normalized(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim();
}

function tokens(value: string): string[] {
  return [
    ...new Set(
      normalized(value)
        .split(/\s+/)
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
    ),
  ];
}

function compact(values: Array<string | undefined>): string[] {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value));
}

function fact(
  id: string,
  label: string,
  path: string,
  visible: Array<string | undefined>,
  searchable: string[] = [],
): PortfolioFact | null {
  const parts = compact(visible);
  if (parts.length === 0) return null;
  const text = parts.join(" · ");
  return {
    id,
    label,
    path,
    text,
    searchText: normalized([label, text, ...searchable].join(" ")),
  };
}

export function buildPortfolioFacts(content: PortfolioContent): PortfolioFact[] {
  const result: Array<PortfolioFact | null> = [];
  const profile = content.profile;

  if (profile) {
    result.push(
      fact(
        "profile",
        profile.name,
        "/about",
        [
          `${profile.name} — ${profile.title}`,
          profile.positioning,
          profile.statement,
          profile.location,
          profile.availability,
        ],
        [
          ...profile.disciplines,
          ...profile.alternativeTitles,
          ...profile.languages.map((language) => `${language.name} ${language.level}`),
        ],
      ),
    );
  }

  for (const experience of content.experiences) {
    result.push(
      fact(
        `experience-${experience.id}`,
        experience.company,
        "/experience",
        [
          `${experience.role} — ${experience.company}`,
          experience.period,
          experience.summary,
          ...experience.achievements.slice(0, 3),
          experience.tech.join(", "),
        ],
        [...experience.tech, ...experience.achievements],
      ),
    );
  }

  for (const project of content.projects) {
    if (project.status !== "published" || project.visibility !== "public") continue;
    result.push(
      fact(
        `project-${project.slug}`,
        project.title,
        `/projects/${project.slug}`,
        [
          project.title,
          project.tagline,
          project.overview,
          ...project.results.slice(0, 2),
          project.stack.join(", "),
        ],
        [
          project.category,
          project.role,
          ...project.stack,
          ...project.architecture,
          ...project.userGroups,
        ],
      ),
    );
  }

  for (const group of content.expertise) {
    result.push(
      fact(
        `expertise-${group.id}`,
        group.title,
        "/expertise",
        [group.title, group.blurb, group.skills.join(", ")],
        group.skills,
      ),
    );
  }

  for (const education of content.education) {
    result.push(
      fact(`education-${education.id}`, education.school, "/about#journey", [
        education.degree,
        education.school,
        education.period,
        education.note,
      ]),
    );
  }

  return result.filter((item): item is PortfolioFact => item !== null);
}

function includesAny(value: string, phrases: string[]): boolean {
  return phrases.some((phrase) => value.includes(phrase));
}

function sourceOf(item: PortfolioFact): Pick<PortfolioFact, "id" | "label" | "path"> {
  return { id: item.id, label: item.label, path: item.path };
}

function resultFromFacts(facts: PortfolioFact[], fallback: string): PortfolioAnswer {
  if (facts.length === 0) return { text: fallback, sources: [] };
  return {
    text: facts.map((item) => item.text).join("\n\n"),
    sources: facts.map(sourceOf),
  };
}

export function answerPortfolioQuestion(
  content: PortfolioContent,
  question: string,
  fallback: string,
): PortfolioAnswer {
  const facts = buildPortfolioFacts(content);
  const query = normalized(question);
  if (!query) return { text: fallback, sources: [] };

  if (
    includesAny(query, [
      "available",
      "availability",
      "remote",
      "verfugbar",
      "disponible",
      "distance",
      "متاح",
      "عن بعد",
      "التوفر",
    ])
  ) {
    return resultFromFacts(
      facts.filter((item) => item.id === "profile"),
      fallback,
    );
  }

  if (
    includesAny(query, [
      "what does ahmed do",
      "who is ahmed",
      "was macht ahmed",
      "wer ist ahmed",
      "que fait ahmed",
      "qui est ahmed",
      "ماذا يعمل",
      "من هو",
    ])
  ) {
    return resultFromFacts(
      facts.filter((item) => item.id === "profile"),
      fallback,
    );
  }

  if (
    includesAny(query, [
      "strongest tech stack",
      "strongest stack",
      "starkster tech stack",
      "starkste tech stack",
      "stack technique la plus solide",
      "plus forte stack technique",
      "اقوى حزمة تقنية",
      "أقوى حزمة تقنية",
      "حزمة تقنية",
      "تقنية",
      "تقنيات",
    ])
  ) {
    const expertise = facts.filter((item) => item.id.startsWith("expertise-"));
    return resultFromFacts(
      expertise.length > 0 ? expertise : facts.filter((item) => item.id === "profile"),
      fallback,
    );
  }

  const queryTokens = tokens(question);
  const scored = facts
    .map((item) => {
      let score = 0;
      if (item.searchText.includes(query)) score += 8;
      for (const token of queryTokens) {
        if (item.searchText.includes(token)) score += token.length >= 5 ? 3 : 2;
        if (normalized(item.label).includes(token)) score += 3;
      }
      return { item, score };
    })
    .filter(({ score }) => score >= 2)
    .sort((left, right) => right.score - left.score || left.item.id.localeCompare(right.item.id));
  const bestScore = scored[0]?.score ?? 0;
  const ranked = scored
    .filter(({ score }) => score >= Math.max(2, Math.ceil(bestScore * 0.75)))
    .slice(0, 2)
    .map(({ item }) => item);

  return resultFromFacts(ranked, fallback);
}
