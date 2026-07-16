export type PublishStatus = "draft" | "published" | "archived";
export type Visibility = "public" | "private";

export interface ProfileLinkSet {
  github?: string;
  linkedin?: string;
  email?: string;
  domain?: string;
}

export interface ProfileLanguage {
  name: string;
  level: string;
  value?: number;
}

export interface PortfolioProfile {
  name: string;
  monogram: string;
  avatarUrl?: string;
  title: string;
  positioning: string;
  statement: string;
  summary: string[];
  location: string;
  availability: string;
  workAuthorization?: string;
  nationality: string[];
  disciplines: string[];
  alternativeTitles: string[];
  languages: ProfileLanguage[];
  links: ProfileLinkSet;
  cvPath?: string;
}

export interface PortfolioMetric {
  id: string;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  detail?: string;
}

export interface PerformanceMetric {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  start: string;
  end?: string;
  location?: string;
  featured: boolean;
  summary?: string;
  achievements: string[];
  tech: string[];
  relatedProjects: string[];
}

export interface PortfolioEducation {
  id: string;
  school: string;
  degree: string;
  period: string;
  location?: string;
  note?: string;
}

export interface PortfolioExpertise {
  id: string;
  title: string;
  blurb: string;
  skills: string[];
  relatedExperience: string[];
  relatedProjects: string[];
}

export interface PortfolioProjectMetric {
  value: string;
  label: string;
}

export interface PortfolioProjectMedia {
  src: string;
  alt: string;
  caption?: string;
}

export interface PortfolioProjectSection {
  heading: string;
  body: string[];
}

export interface PortfolioProject {
  slug: string;
  title: string;
  tagline: string;
  year?: string;
  role: string;
  timeframe?: string;
  category: string;
  visibility: Visibility;
  featured: boolean;
  status: PublishStatus;
  repo?: string;
  liveUrl?: string;
  stack: string[];
  metrics: PortfolioProjectMetric[];
  media: PortfolioProjectMedia[];
  overview: string;
  problem?: string;
  userGroups: string[];
  roleDetail?: string;
  architecture: string[];
  frontend?: string;
  backend?: string;
  database?: string;
  security?: string;
  performance?: string;
  testing?: string;
  cicd?: string;
  results: string[];
  sections: PortfolioProjectSection[];
  note?: string;
}

export interface EngineeringPrinciple {
  id: string;
  title: string;
  body: string;
}

export interface PortfolioContent {
  profile: PortfolioProfile | null;
  heroMetrics: PortfolioMetric[];
  performanceMetric: PerformanceMetric | null;
  experiences: PortfolioExperience[];
  education: PortfolioEducation[];
  expertise: PortfolioExpertise[];
  projects: PortfolioProject[];
  principles: EngineeringPrinciple[];
  technologyEcosystem: string[];
}

export type TicketStatus = "received" | "reviewed" | "discussion" | "closed";

export interface TicketThreadEntry {
  id: string;
  author: "visitor" | "ahmed";
  body: string;
  createdAt: string;
}

export interface PublicTicket {
  ref: string;
  name: string;
  email: string;
  category?: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  thread: TicketThreadEntry[];
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function nestedRecord(record: UnknownRecord, ...keys: string[]): UnknownRecord {
  for (const key of keys) {
    const value = asRecord(record[key]);
    if (Object.keys(value).length > 0) return value;
  }
  return {};
}

function unwrap(raw: unknown): UnknownRecord {
  const root = asRecord(raw);
  const nested = nestedRecord(root, "data", "content", "result");
  return Object.keys(nested).length > 0 ? nested : root;
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function optionalString(value: unknown): string | undefined {
  const result = stringValue(value).trim();
  return result || undefined;
}

function safeHttpUrl(value: unknown): string | undefined {
  const candidate = optionalString(value);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function safeAssetUrl(value: unknown): string | undefined {
  const candidate = optionalString(value);
  if (!candidate) return undefined;
  if (/^\/(?!\/)/.test(candidate) && !candidate.includes("\\")) {
    return candidate;
  }
  return safeHttpUrl(candidate);
}

// The admin stores avatars either as an inline data URL or a hosted image.
function safeAvatarUrl(value: unknown): string | undefined {
  const candidate = optionalString(value);
  if (!candidate) return undefined;
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(candidate)) return candidate;
  return safeAssetUrl(candidate);
}

function safeEmail(value: unknown): string | undefined {
  const candidate = optionalString(value)?.replace(/^mailto:/i, "");
  return candidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : undefined;
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function firstArray(root: UnknownRecord, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const value = root[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function periodFromDates(start: string, end?: string): string {
  if (!start) return end ?? "";
  return end ? `${start} — ${end === "present" ? "Present" : end}` : start;
}

function normalizeLinks(profile: UnknownRecord): ProfileLinkSet {
  const links = nestedRecord(profile, "links");
  const social = records(profile.social);
  const byPlatform = (platform: string) =>
    optionalString(social.find((item) => item.platform === platform)?.href);

  return {
    github: safeHttpUrl(
      optionalString(links.github) ?? optionalString(profile.githubUrl) ?? byPlatform("github"),
    ),
    linkedin: safeHttpUrl(
      optionalString(links.linkedin) ??
        optionalString(profile.linkedinUrl) ??
        byPlatform("linkedin"),
    ),
    email: safeEmail(
      optionalString(links.email) ?? optionalString(profile.email) ?? byPlatform("email"),
    ),
    domain: safeHttpUrl(
      optionalString(links.domain) ?? optionalString(profile.domainUrl) ?? byPlatform("website"),
    ),
  };
}

function normalizeProfile(value: unknown): PortfolioProfile | null {
  const profile = asRecord(value);
  const name = stringValue(profile.name).trim();
  if (!name) return null;

  const availability = asRecord(profile.availability);
  const summary = Array.isArray(profile.summaryLong)
    ? strings(profile.summaryLong)
    : strings(profile.summary);

  return {
    name,
    monogram:
      stringValue(profile.monogram).trim() ||
      name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    avatarUrl: safeAvatarUrl(profile.avatarUrl ?? profile.avatar ?? profile.photoUrl),
    title: stringValue(profile.title),
    positioning: stringValue(profile.positioning) || stringValue(profile.tagline),
    statement: stringValue(profile.statement) || stringValue(profile.summaryShort),
    summary,
    location: stringValue(profile.location),
    availability:
      stringValue(profile.availability) ||
      stringValue(availability.label) ||
      stringValue(availability.remote),
    workAuthorization: optionalString(profile.workAuthorization),
    nationality: Array.isArray(profile.nationality)
      ? strings(profile.nationality)
      : optionalString(profile.nationality)
        ? [stringValue(profile.nationality)]
        : [],
    disciplines: strings(profile.disciplines),
    alternativeTitles: strings(profile.alternativeTitles),
    languages: records(profile.languages).map((language) => ({
      name: stringValue(language.name),
      level: stringValue(language.level),
      value: language.value === undefined ? undefined : numberValue(language.value),
    })),
    links: normalizeLinks(profile),
    cvPath: safeAssetUrl(profile.cvPath),
  };
}

function normalizeMetric(value: unknown, index: number): PortfolioMetric {
  const metric = asRecord(value);
  return {
    id: stringValue(metric.id) || `metric-${index + 1}`,
    value: numberValue(metric.value),
    label: stringValue(metric.label),
    prefix: optionalString(metric.prefix),
    suffix: optionalString(metric.suffix),
    detail: optionalString(metric.detail),
  };
}

function normalizeExperience(value: unknown, index: number): PortfolioExperience {
  const item = asRecord(value);
  const start = stringValue(item.start) || stringValue(item.startDate);
  const end = optionalString(item.end) ?? optionalString(item.endDate);
  return {
    id: stringValue(item.id) || `experience-${index + 1}`,
    company: stringValue(item.company),
    role: stringValue(item.role),
    period: stringValue(item.period) || periodFromDates(start, end),
    start,
    end,
    location: optionalString(item.location),
    featured: booleanValue(item.featured) || stringValue(item.kind) === "primary",
    summary: optionalString(item.summary),
    achievements: strings(item.achievements).length
      ? strings(item.achievements)
      : strings(item.highlights),
    tech: strings(item.tech).length ? strings(item.tech) : strings(item.technologies),
    relatedProjects: strings(item.relatedProjects),
  };
}

function normalizeEducation(value: unknown, index: number): PortfolioEducation {
  const item = asRecord(value);
  const details = asRecord(item.details);
  const start = stringValue(item.startDate);
  const end = optionalString(item.endDate);
  return {
    id: stringValue(item.id) || `education-${index + 1}`,
    school: stringValue(item.school) || stringValue(item.institution),
    degree: stringValue(item.degree) || stringValue(item.credential),
    period: stringValue(item.period) || periodFromDates(start, end),
    location: optionalString(item.location) ?? optionalString(details.location),
    note: optionalString(item.note) ?? optionalString(details.note),
  };
}

function normalizeExpertise(value: unknown, index: number): PortfolioExpertise {
  const item = asRecord(value);
  return {
    id: stringValue(item.id) || `expertise-${index + 1}`,
    title: stringValue(item.title) || stringValue(item.name),
    blurb: stringValue(item.blurb) || stringValue(item.description),
    skills: strings(item.skills),
    relatedExperience: strings(item.relatedExperience),
    relatedProjects: strings(item.relatedProjects),
  };
}

function normalizeMedia(value: unknown): PortfolioProjectMedia[] {
  return records(value)
    .map((item) => ({
      src: safeAssetUrl(item.src) ?? "",
      alt: stringValue(item.alt),
      caption: optionalString(item.caption),
    }))
    .filter((item) => item.src && item.alt);
}

function normalizeProject(value: unknown): PortfolioProject | null {
  const project = asRecord(value);
  const details = asRecord(project.details);
  const slug = stringValue(project.slug).trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  const statusValue = stringValue(project.status);
  const status: PublishStatus =
    statusValue === "draft" || statusValue === "archived" ? statusValue : "published";
  const visibility: Visibility =
    stringValue(project.visibility) === "private" ? "private" : "public";
  const sectionSource = Array.isArray(project.sections) ? project.sections : details.sections;
  const sections = records(sectionSource).map((section) => ({
    heading: stringValue(section.heading),
    body: Array.isArray(section.body)
      ? strings(section.body)
      : optionalString(section.body)
        ? [stringValue(section.body)]
        : [],
  }));
  const source = asRecord(project.source);

  return {
    slug,
    title: stringValue(project.title),
    tagline:
      stringValue(project.tagline) ||
      stringValue(project.valueProposition) ||
      stringValue(project.summary),
    year: optionalString(project.year),
    role: stringValue(project.role),
    timeframe: optionalString(project.timeframe),
    category: stringValue(project.category) || stringValue(project.domain),
    visibility,
    featured: booleanValue(project.featured),
    status,
    repo: safeHttpUrl(
      optionalString(project.repo) ??
        optionalString(project.repoUrl) ??
        optionalString(source.repo),
    ),
    liveUrl: safeHttpUrl(optionalString(project.liveUrl) ?? optionalString(details.liveUrl)),
    stack: strings(project.stack),
    metrics: records(project.metrics).map((metric) => ({
      value: stringValue(metric.value),
      label: stringValue(metric.label),
    })),
    media: normalizeMedia(Array.isArray(project.media) ? project.media : details.media),
    overview: stringValue(project.overview) || stringValue(project.summary),
    problem: optionalString(project.problem),
    userGroups: strings(project.userGroups),
    roleDetail: optionalString(project.roleDetail) ?? optionalString(project.role_detail),
    architecture: strings(project.architecture),
    frontend: optionalString(project.frontend),
    backend: optionalString(project.backend),
    database: optionalString(project.database),
    security: optionalString(project.security),
    performance: optionalString(project.performance),
    testing: optionalString(project.testing),
    cicd: optionalString(project.cicd),
    results: strings(project.results).length
      ? strings(project.results)
      : strings(project.outcomes).length
        ? strings(project.outcomes)
        : strings(details.outcomes),
    sections,
    note: optionalString(project.note),
  };
}

function normalizePrinciple(value: unknown, index: number): EngineeringPrinciple {
  const item = asRecord(value);
  return {
    id: stringValue(item.id) || `principle-${index + 1}`,
    title: stringValue(item.title),
    body: stringValue(item.body) || stringValue(item.description),
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function normalizeContent(raw: unknown): PortfolioContent {
  const root = unwrap(raw);
  const site = nestedRecord(root, "site", "siteSettings");
  const metricValues = firstArray(root, "heroMetrics", "metrics").length
    ? firstArray(root, "heroMetrics", "metrics")
    : firstArray(site, "metrics");
  const principleValues = firstArray(root, "engineeringPrinciples", "principles").length
    ? firstArray(root, "engineeringPrinciples", "principles")
    : firstArray(site, "principles");
  const expertiseValues = firstArray(root, "expertise", "expertiseGroups", "skills");
  const projects = firstArray(root, "projects")
    .map(normalizeProject)
    .filter((project): project is PortfolioProject => project !== null);
  const expertise = expertiseValues.map(normalizeExpertise);
  const suppliedEcosystem = strings(root.technologyEcosystem);

  return {
    profile: normalizeProfile(root.profile),
    heroMetrics: metricValues.map(normalizeMetric),
    performanceMetric: (() => {
      const performanceValues = firstArray(root, "performanceMetrics");
      const item = performanceValues[0]
        ? asRecord(performanceValues[0])
        : nestedRecord(root, "performanceMetric", "perfMetric");
      if (!optionalString(item.from) || !optionalString(item.to)) return null;
      return {
        id: stringValue(item.id) || "performance",
        from: stringValue(item.from),
        to: stringValue(item.to),
        label: stringValue(item.label),
      };
    })(),
    experiences: firstArray(root, "experiences", "experience").map(normalizeExperience),
    education: firstArray(root, "education").map(normalizeEducation),
    expertise,
    projects,
    principles: principleValues.map(normalizePrinciple),
    technologyEcosystem: suppliedEcosystem.length
      ? suppliedEcosystem
      : unique([
          ...expertise.flatMap((group) => group.skills),
          ...projects.flatMap((project) => project.stack),
        ]),
  };
}

export function normalizeProjectResponse(raw: unknown): PortfolioProject | null {
  const root = unwrap(raw);
  return normalizeProject(root.project ?? root);
}

function normalizeTicketStatus(value: unknown): TicketStatus {
  const status = stringValue(value);
  if (status === "reviewed" || status === "discussion" || status === "closed") {
    return status;
  }
  if (status === "read") return "reviewed";
  if (status === "in_progress" || status === "in-discussion") return "discussion";
  return "received";
}

export function normalizeTicket(raw: unknown): PublicTicket | null {
  const root = unwrap(raw);
  const nested = nestedRecord(root, "ticket", "message");
  const ticket = Object.keys(nested).length > 0 ? nested : root;
  const ref =
    stringValue(ticket.ref) || stringValue(ticket.reference) || stringValue(ticket.claimRef);
  if (!ref) return null;

  return {
    ref,
    name: stringValue(ticket.name),
    email: stringValue(ticket.email),
    category: optionalString(ticket.category) ?? optionalString(ticket.subject),
    message: stringValue(ticket.message),
    status: normalizeTicketStatus(ticket.status),
    createdAt: stringValue(ticket.createdAt),
    thread: firstArray(ticket, "thread", "entries", "replies").map((value, index) => {
      const entry = asRecord(value);
      const authorValue = stringValue(entry.author);
      return {
        id: stringValue(entry.id) || `reply-${index + 1}`,
        author: authorValue === "ahmed" || authorValue === "admin" ? "ahmed" : "visitor",
        body: stringValue(entry.body) || stringValue(entry.message),
        createdAt: stringValue(entry.createdAt),
      };
    }),
  };
}

/** Compact display label for a profile link: host plus path, no protocol. */
export function linkLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, "");
    return `${parsed.host}${path}`;
  } catch {
    return url;
  }
}

/** Earliest four-digit start year across experiences, or null when unknown. */
export function careerStartYear(experiences: PortfolioExperience[]): number | null {
  const years = experiences
    .map((experience) => /(?:19|20)\d{2}/.exec(experience.start)?.[0])
    .filter((value): value is string => Boolean(value))
    .map(Number);
  return years.length > 0 ? Math.min(...years) : null;
}

export function careerYears(
  experiences: PortfolioExperience[],
  currentYear = new Date().getFullYear(),
): number {
  const startYears = experiences
    .map((experience) => /(?:19|20)\d{2}/.exec(experience.start)?.[0])
    .filter((value): value is string => Boolean(value))
    .map(Number)
    .filter((value) => value <= currentYear);
  if (startYears.length === 0) return 0;
  return Math.max(0, currentYear - Math.min(...startYears));
}

export function contactReference(raw: unknown): string | null {
  const root = unwrap(raw);
  const ticket = asRecord(root.ticket);
  return (
    optionalString(root.ticketRef) ??
    optionalString(root.ref) ??
    optionalString(root.claimRef) ??
    optionalString(ticket.ref) ??
    null
  );
}
