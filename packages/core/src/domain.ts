import { z } from "zod";

export const LocaleSchema = z.enum(["en", "de", "fr", "ar"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const ContentStatusSchema = z.enum(["draft", "published"]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const VisibilitySchema = z.enum(["public", "private"]);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const TicketStatusSchema = z.enum(["received", "reviewed", "discussion", "closed"]);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;

export const ThreadAuthorSchema = z.enum(["visitor", "admin"]);
export type ThreadAuthor = z.infer<typeof ThreadAuthorSchema>;

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
);
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const IdentifierSchema = z.string().trim().min(1).max(160);
export const HttpUrlSchema = z
  .string()
  .url()
  .max(2_048)
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" ||
      (url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    );
  }, "URL must use HTTPS; HTTP is allowed only for local development");
const UrlSchema = HttpUrlSchema;
const OptionalUrlSchema = UrlSchema.nullable().optional();
export const AvatarUrlSchema = z
  .string()
  .max(400_000)
  .refine(
    (value) =>
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ||
      HttpUrlSchema.safeParse(value).success,
    "Avatar must be an HTTPS URL or an inline image",
  );
const OptionalAvatarUrlSchema = AvatarUrlSchema.nullable().optional();
const TimestampSchema = z.string().datetime({ offset: true });
const SortOrderSchema = z.number().int().min(0).default(0);
const OptionalTextSchema = z.string().max(20_000).nullable().optional();

export const LanguageProficiencySchema = z.object({
  name: z.string().trim().min(1).max(100),
  level: z.string().trim().min(1).max(100),
  value: z.number().min(0).max(100).optional(),
});
export type LanguageProficiency = z.infer<typeof LanguageProficiencySchema>;

export const ProfileInputSchema = z.object({
  id: IdentifierSchema.default("primary"),
  name: z.string().trim().min(1).max(160),
  monogram: z.string().trim().min(1).max(12),
  title: z.string().trim().min(1).max(240),
  disciplines: z.array(z.string().trim().min(1).max(160)).max(40),
  positioning: z.string().trim().min(1).max(1_000),
  statement: z.string().trim().min(1).max(5_000),
  location: z.string().trim().min(1).max(240),
  nationality: z.array(z.string().trim().min(1).max(100)).max(10),
  workAuthorization: z.string().trim().min(1).max(500),
  availability: z.string().trim().min(1).max(1_000),
  alternativeTitles: z.array(z.string().trim().min(1).max(240)).max(30),
  githubUrl: OptionalUrlSchema,
  linkedinUrl: OptionalUrlSchema,
  domainUrl: OptionalUrlSchema,
  email: z.string().email().max(320),
  avatarUrl: OptionalAvatarUrlSchema,
  languages: z.array(LanguageProficiencySchema).max(20),
  status: ContentStatusSchema.default("published"),
});
export const ProfileSchema = ProfileInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type ProfileInput = z.input<typeof ProfileInputSchema>;
export type Profile = z.infer<typeof ProfileSchema>;

export const ProjectMetricInputSchema = z.object({
  id: IdentifierSchema.optional(),
  value: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(240),
  sortOrder: SortOrderSchema,
});
export type ProjectMetricInput = z.input<typeof ProjectMetricInputSchema>;

export const ProjectInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(240),
  tagline: z.string().trim().min(1).max(1_000),
  year: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(500),
  visibility: VisibilitySchema.default("private"),
  featured: z.boolean().default(false),
  status: ContentStatusSchema.default("draft"),
  atmosphere: z.string().trim().min(1).max(80),
  repoUrl: OptionalUrlSchema,
  stack: z.array(z.string().trim().min(1).max(160)).max(100),
  metrics: z.array(ProjectMetricInputSchema).max(50),
  overview: z.string().max(20_000),
  problem: z.string().max(20_000),
  userGroups: z.array(z.string().max(1_000)).max(50),
  roleDetail: z.string().max(20_000),
  architecture: z.array(z.string().max(2_000)).max(100),
  frontend: z.string().max(20_000),
  backend: z.string().max(20_000),
  database: z.string().max(20_000),
  security: z.string().max(20_000),
  performance: z.string().max(20_000),
  testing: z.string().max(20_000),
  cicd: z.string().max(20_000),
  results: z.array(z.string().max(2_000)).max(100),
  note: OptionalTextSchema,
  needsConfirmation: z.array(z.string().max(2_000)).max(100).default([]),
  ogImageUrl: OptionalUrlSchema,
  details: z.record(JsonValueSchema).default({}),
  sortOrder: SortOrderSchema,
});
export const ProjectSchema = ProjectInputSchema.extend({
  id: z.string().uuid(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type ProjectInput = z.input<typeof ProjectInputSchema>;
export type Project = z.infer<typeof ProjectSchema>;

// Regeneration rebuilds a project's editable copy on demand: from the linked
// repository when one is set, otherwise from the operator-entered fields. The
// result is returned to the editor for review — nothing is persisted.
export const ProjectRegenerationFieldNames = [
  "title",
  "tagline",
  "year",
  "stack",
  "overview",
  "problem",
  "roleDetail",
  "architecture",
  "frontend",
  "backend",
  "database",
  "security",
  "performance",
  "testing",
  "cicd",
  "results",
  "metrics",
  "note",
] as const;
export type ProjectRegenerationFieldName = (typeof ProjectRegenerationFieldNames)[number];

export const ProjectRegenerateRequestSchema = z.object({
  repoUrl: z.string().trim().url().max(2_048).nullable().optional(),
  // When present, only these fields are regenerated (and returned); omitted
  // means the full field set.
  fields: z.array(z.enum(ProjectRegenerationFieldNames)).min(1).max(50).optional(),
  project: z
    .object({
      title: z.string().trim().max(240).default(""),
      tagline: z.string().trim().max(1_000).default(""),
      year: z.string().trim().max(120).default(""),
      role: z.string().trim().max(500).default(""),
      stack: z.array(z.string().trim().max(160)).max(100).default([]),
      overview: z.string().max(20_000).default(""),
      problem: z.string().max(20_000).default(""),
      userGroups: z.array(z.string().max(1_000)).max(50).default([]),
      roleDetail: z.string().max(20_000).default(""),
      architecture: z.array(z.string().max(2_000)).max(100).default([]),
      frontend: z.string().max(20_000).default(""),
      backend: z.string().max(20_000).default(""),
      database: z.string().max(20_000).default(""),
      security: z.string().max(20_000).default(""),
      performance: z.string().max(20_000).default(""),
      testing: z.string().max(20_000).default(""),
      cicd: z.string().max(20_000).default(""),
      results: z.array(z.string().max(2_000)).max(100).default([]),
      metrics: z
        .array(z.object({ value: z.string().max(100), label: z.string().max(240) }))
        .max(50)
        .default([]),
      note: z.string().max(20_000).default(""),
    })
    .default({}),
});
export type ProjectRegenerateRequest = z.input<typeof ProjectRegenerateRequestSchema>;
export type ProjectRegenerateContent = z.infer<typeof ProjectRegenerateRequestSchema>["project"];

/** Only fields the regeneration actually produced are present — absent fields keep their current value in the editor. */
export type ProjectRegenerationFields = Partial<
  Pick<
    Project,
    | "title"
    | "tagline"
    | "year"
    | "stack"
    | "overview"
    | "problem"
    | "roleDetail"
    | "architecture"
    | "frontend"
    | "backend"
    | "database"
    | "security"
    | "performance"
    | "testing"
    | "cicd"
    | "results"
  > & {
    metrics: Array<{ value: string; label: string }>;
    note: string;
  }
>;
export type ProjectRegeneration = {
  fields: ProjectRegenerationFields;
  mode: "generated" | "extracted";
  source: "repository" | "content";
};

export const ExperienceInputSchema = z.object({
  id: IdentifierSchema,
  company: z.string().trim().min(1).max(240),
  role: z.string().trim().min(1).max(240),
  period: z.string().trim().min(1).max(160),
  start: z.string().regex(/^\d{4}-\d{2}$/),
  location: z.string().trim().min(1).max(240),
  featured: z.boolean().default(false),
  summary: OptionalTextSchema,
  achievements: z.array(z.string().max(2_000)).max(100).default([]),
  tech: z.array(z.string().trim().min(1).max(160)).max(100),
  relatedProjects: z.array(IdentifierSchema).max(100).default([]),
  hidden: z.boolean().default(false),
  status: ContentStatusSchema.default("published"),
  details: z.record(JsonValueSchema).default({}),
  sortOrder: SortOrderSchema,
});
export const ExperienceSchema = ExperienceInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type ExperienceInput = z.input<typeof ExperienceInputSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;

export const EducationInputSchema = z.object({
  id: IdentifierSchema,
  school: z.string().trim().min(1).max(300),
  degree: z.string().trim().min(1).max(500),
  period: z.string().trim().min(1).max(160),
  hidden: z.boolean().default(false),
  status: ContentStatusSchema.default("published"),
  details: z.record(JsonValueSchema).default({}),
  sortOrder: SortOrderSchema,
});
export const EducationSchema = EducationInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type EducationInput = z.input<typeof EducationInputSchema>;
export type Education = z.infer<typeof EducationSchema>;

export const ExpertiseGroupInputSchema = z.object({
  id: IdentifierSchema,
  title: z.string().trim().min(1).max(240),
  blurb: z.string().max(5_000),
  skills: z.array(z.string().trim().min(1).max(160)).max(100),
  relatedExperience: z.array(IdentifierSchema).max(100).default([]),
  relatedProjects: z.array(IdentifierSchema).max(100).default([]),
  hidden: z.boolean().default(false),
  status: ContentStatusSchema.default("published"),
  details: z.record(JsonValueSchema).default({}),
  sortOrder: SortOrderSchema,
});
export const ExpertiseGroupSchema = ExpertiseGroupInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type ExpertiseGroupInput = z.input<typeof ExpertiseGroupInputSchema>;
export type ExpertiseGroup = z.infer<typeof ExpertiseGroupSchema>;

export const HeroMetricInputSchema = z.object({
  id: IdentifierSchema,
  value: z.number().finite(),
  prefix: z.string().max(40).nullable().optional(),
  suffix: z.string().max(40).nullable().optional(),
  label: z.string().trim().min(1).max(500),
  decimals: z.number().int().min(0).max(6).default(0),
  hidden: z.boolean().default(false),
  status: ContentStatusSchema.default("published"),
  sortOrder: SortOrderSchema,
});
export const HeroMetricSchema = HeroMetricInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type HeroMetricInput = z.input<typeof HeroMetricInputSchema>;
export type HeroMetric = z.infer<typeof HeroMetricSchema>;

export const PerformanceMetricInputSchema = z.object({
  id: IdentifierSchema,
  from: z.string().trim().min(1).max(80),
  to: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(500),
  hidden: z.boolean().default(false),
  status: ContentStatusSchema.default("published"),
  sortOrder: SortOrderSchema,
});
export const PerformanceMetricSchema = PerformanceMetricInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type PerformanceMetricInput = z.input<typeof PerformanceMetricInputSchema>;
export type PerformanceMetric = z.infer<typeof PerformanceMetricSchema>;

export const PrincipleInputSchema = z.object({
  id: IdentifierSchema,
  title: z.string().trim().min(1).max(240),
  body: z.string().trim().min(1).max(5_000),
  hidden: z.boolean().default(false),
  status: ContentStatusSchema.default("published"),
  sortOrder: SortOrderSchema,
});
export const PrincipleSchema = PrincipleInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type PrincipleInput = z.input<typeof PrincipleInputSchema>;
export type Principle = z.infer<typeof PrincipleSchema>;

export const TranslationInputSchema = z.object({
  entityType: z.string().trim().min(1).max(80),
  entityKey: IdentifierSchema,
  locale: LocaleSchema.exclude(["en"]),
  field: z.string().trim().min(1).max(160),
  value: JsonValueSchema,
});
export const TranslationSchema = TranslationInputSchema.extend({
  id: z.string().uuid(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type TranslationInput = z.input<typeof TranslationInputSchema>;
export type Translation = z.infer<typeof TranslationSchema>;

export const UiMessageKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*$/);
export const UiMessageValueSchema = z.string().max(20_000);
export const UiMessageInputSchema = z.object({
  key: UiMessageKeySchema,
  locale: LocaleSchema,
  value: UiMessageValueSchema,
});
export type UiMessageInput = z.infer<typeof UiMessageInputSchema>;

// A localized-copy edit for one key: a string overrides that locale, null
// clears the override so the bundled default applies again.
export const UiMessageUpdateSchema = z.object({
  values: z.record(LocaleSchema, UiMessageValueSchema.nullable()),
});
export type UiMessageUpdate = z.infer<typeof UiMessageUpdateSchema>;

export type UiMessageBundle = Partial<Record<Locale, Record<string, string>>>;

export const SettingInputSchema = z.object({
  key: IdentifierSchema,
  value: JsonValueSchema,
  isPublic: z.boolean().default(false),
});
export const SettingSchema = SettingInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type SettingInput = z.input<typeof SettingInputSchema>;
export type Setting = z.infer<typeof SettingSchema>;

export const ServiceInputSchema = z.object({
  id: IdentifierSchema,
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(5_000),
  icon: z.string().trim().max(100).nullable().optional(),
  deliverables: z.array(z.string().trim().min(1).max(1_000)).max(100).default([]),
  status: ContentStatusSchema.default("published"),
  featured: z.boolean().default(false),
  sortOrder: SortOrderSchema,
  details: z.record(JsonValueSchema).default({}),
});
export const ServiceSchema = ServiceInputSchema.extend({
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type ServiceInput = z.input<typeof ServiceInputSchema>;
export type Service = z.infer<typeof ServiceSchema>;

export const ContactRequestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(240).optional(),
  category: z.string().trim().min(1).max(160),
  message: z.string().trim().min(10).max(10_000),
});
export type ContactRequest = z.infer<typeof ContactRequestSchema>;

export const AssistantAskRequestSchema = z.object({
  question: z.string().trim().min(1).max(500),
  locale: LocaleSchema.default("en"),
});
export type AssistantAskRequest = z.input<typeof AssistantAskRequestSchema>;
export type AssistantAnswer = { text: string };

// ── Admin AI toolbox ─────────────────────────────────────────────────────
// Every AI feature is optional: `configured` reflects whether an AI provider
// is set at all, `reachable` whether the engine answered just now. The admin
// uses this to decide which AI affordances to render.
export type AiStatus = {
  configured: boolean;
  reachable: boolean;
  models: { assistant: string; intake: string };
  /** Models the configured provider reports; empty when unreachable. */
  installed: string[];
};

export const AiTranslateRequestSchema = z.object({
  /** Source texts (English), keyed by a caller-chosen identifier. */
  texts: z.record(z.string().min(1).max(200), z.string().min(1).max(4_000)).refine((value) => {
    const size = Object.keys(value).length;
    return size >= 1 && size <= 40;
  }, "Between 1 and 40 texts per request."),
  targets: z
    .array(LocaleSchema.exclude(["en"]))
    .min(1)
    .max(3),
});
export type AiTranslateRequest = z.input<typeof AiTranslateRequestSchema>;
/** Locales the model failed on are absent — the caller keeps its values. */
export type AiTranslation = { texts: Partial<Record<Locale, Record<string, string>>> };

export const MessageReplyDraftRequestSchema = z.object({
  /** Optional operator steering, e.g. "decline politely" or "propose a call". */
  instruction: z.string().trim().max(500).optional(),
});
export type MessageReplyDraftRequest = z.input<typeof MessageReplyDraftRequestSchema>;
export type MessageReplyDraft = { text: string };

// ── Public intake demo ───────────────────────────────────────────────────
// Visitors run the repository-intake pipeline against any public GitHub
// repository to see how the studio drafts a case study. Nothing is persisted.
export const IntakeDemoRequestSchema = z.object({
  url: z.string().trim().url().max(2_048),
});
export type IntakeDemoRequest = z.input<typeof IntakeDemoRequestSchema>;

export type IntakeDemoStage = {
  id: "fetch" | "extract" | "generate";
  status: "ok" | "skipped" | "failed";
  durationMs: number;
};

export type IntakeDemoDraft = Pick<
  ProjectInput,
  | "title"
  | "tagline"
  | "year"
  | "stack"
  | "overview"
  | "problem"
  | "roleDetail"
  | "architecture"
  | "frontend"
  | "backend"
  | "database"
  | "security"
  | "performance"
  | "testing"
  | "cicd"
  | "results"
> & { metrics: Array<{ value: string; label: string }>; note: string };

/**
 * Measured qualities of a single demo run. Every number is derived from the
 * run itself — README overlap, filled fields, repository metadata — so the
 * scorecard reports what happened rather than decorating it.
 */
export type IntakeDemoScores = {
  /** Weighted composite of grounding, coverage, source and review load, 0–100. */
  readiness: number;
  /** Share of generated content words that also appear in the README, 0–100. */
  grounding: number;
  /** Share of the 18 draft fields that came back filled, 0–100. */
  coverage: number;
  /** How much material the repository itself offered the pipeline, 0–100. */
  source: number;
  /** Share of fields the model improved on top of deterministic extraction, 0–100. */
  lift: number;
  /** The raw counts behind the scores, so the UI can caption them honestly. */
  detail: {
    fieldsFilled: number;
    fieldsTotal: number;
    fieldsGenerated: number;
    /** Generated content words checked against the README (0 in extracted mode). */
    wordsChecked: number;
    readmeSections: number;
    reviewNotes: number;
  };
};

/**
 * One thing the pipeline observed, streamed while the run is still in flight.
 * Every variant carries measured values — repository metadata as GitHub
 * returned it, real README headings, per-field character counts — so the live
 * log states what happened rather than narrating a plausible run. The client
 * renders each variant through its own localized message; no prose crosses the
 * wire except text the repository itself published.
 */
export type IntakeDemoNote =
  | { kind: "repo"; fullName: string; language: string | null; topics: number }
  | { kind: "readme"; chars: number }
  /** A heading the sectionizer actually found, verbatim from the README. */
  | { kind: "section"; heading: string }
  | { kind: "sections"; count: number }
  /**
   * A draft field that came back filled, and how much copy it holds. `items`
   * is present for list fields (stack, results, …) — an entry count reads
   * better there than a character total.
   */
  | {
      kind: "field";
      field: ProjectRegenerationFieldName;
      chars: number;
      items?: number;
      generated: boolean;
    }
  /**
   * The grounding handed to the model: the clipped README size and how many
   * fields were asked for. The model tag itself is deliberately not published.
   */
  | { kind: "grounding"; chars: number; fields: number }
  /** The model did not contribute — the deterministic draft stands. */
  | { kind: "fallback"; reason: "unavailable" | "failed" }
  | { kind: "review"; notes: number };

/** NDJSON frames of a streamed demo run, in emission order. */
export type IntakeDemoEvent =
  | { type: "stage"; id: IntakeDemoStage["id"] }
  | { type: "stage-done"; stage: IntakeDemoStage }
  | { type: "note"; note: IntakeDemoNote }
  | { type: "result"; demo: IntakeDemo }
  /**
   * A failure the client must surface. `status` is the HTTP status the plain
   * JSON route would have answered with — the stream itself is already a 200
   * by the time anything can go wrong, so the code travels in the payload.
   */
  | { type: "error"; status: number; code: string; message: string };

export type IntakeDemo = {
  repo: {
    fullName: string;
    url: string;
    description: string | null;
    topics: string[];
    language: string | null;
    createdAt: string | null;
    readmeChars: number;
  };
  stages: IntakeDemoStage[];
  /** "generated" when the local model refined the draft, otherwise "extracted". */
  mode: "generated" | "extracted";
  /** Field names whose value came from the model rather than pure extraction. */
  generatedFields: ProjectRegenerationFieldName[];
  draft: IntakeDemoDraft;
  /** The operator-review checklist the real intake would attach to the draft. */
  review: string[];
  /** Measured quality of this run — see {@link IntakeDemoScores}. */
  scores: IntakeDemoScores;
};

export const TicketLookupRequestSchema = z.object({
  ref: z
    .string()
    .trim()
    .min(4)
    .max(40)
    .transform((value) => value.toUpperCase()),
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
});
export type TicketLookupRequest = z.infer<typeof TicketLookupRequestSchema>;

export const TicketReplyRequestSchema = TicketLookupRequestSchema.extend({
  body: z.string().trim().min(1).max(10_000),
});
export type TicketReplyRequest = z.infer<typeof TicketReplyRequestSchema>;

export const ThreadEntrySchema = z.object({
  id: z.string().uuid(),
  author: ThreadAuthorSchema,
  body: z.string().min(1).max(10_000),
  createdAt: TimestampSchema,
});
export type ThreadEntry = z.infer<typeof ThreadEntrySchema>;

export const MessageSummarySchema = z.object({
  id: z.string().uuid(),
  ref: z.string(),
  name: z.string(),
  email: z.string().email(),
  company: z.string().nullable(),
  category: z.string(),
  message: z.string(),
  status: TicketStatusSchema,
  read: z.boolean(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export const MessageSchema = MessageSummarySchema.extend({
  thread: z.array(ThreadEntrySchema),
});
export type MessageSummary = z.infer<typeof MessageSummarySchema>;
export type Message = z.infer<typeof MessageSchema>;

export const CreateThreadEntrySchema = z.object({
  body: z.string().trim().min(1).max(10_000),
  author: ThreadAuthorSchema.default("admin"),
});
export type CreateThreadEntry = z.input<typeof CreateThreadEntrySchema>;

export const AdminLoginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(512),
});
export type AdminLoginRequest = z.input<typeof AdminLoginRequestSchema>;

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(160),
  active: z.boolean(),
  lastLoginAt: TimestampSchema.nullable(),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;

export const DashboardSchema = z.object({
  projects: z.object({
    total: z.number().int(),
    published: z.number().int(),
    draft: z.number().int(),
  }),
  messages: z.object({ total: z.number().int(), unread: z.number().int(), open: z.number().int() }),
  content: z.object({
    experiences: z.number().int(),
    education: z.number().int(),
    expertise: z.number().int(),
  }),
});
export type Dashboard = z.infer<typeof DashboardSchema>;

export const GitHubSyncStatusSchema = z.object({
  enabled: z.boolean(),
  reason: z.string().optional(),
});
export type GitHubSyncStatus = z.infer<typeof GitHubSyncStatusSchema>;

export const GitHubProjectPreviewSchema = z.object({
  slug: z.string(),
  repoUrl: HttpUrlSchema,
  reachable: z.boolean(),
  description: z.string().nullable().optional(),
  homepage: HttpUrlSchema.nullable().optional(),
  defaultBranch: z.string().optional(),
  pushedAt: TimestampSchema.nullable().optional(),
  error: z.string().optional(),
});
export type GitHubProjectPreview = z.infer<typeof GitHubProjectPreviewSchema>;

export const GitHubChangePartSchema = z.object({
  field: z.enum(["description", "topics", "pushedAt"]),
  from: z.string(),
  to: z.string(),
});
export type GitHubChangePart = z.infer<typeof GitHubChangePartSchema>;

// One consolidated proposal per project: `parts` lists the individual field
// diffs and `patch` carries the complete merged update they amount to.
export const GitHubDetectedChangeSchema = z.object({
  id: z.string(),
  projectId: z.string().uuid(),
  slug: z.string(),
  repo: z.string(),
  field: z.enum(["description", "topics", "pushedAt", "update"]),
  from: z.string(),
  to: z.string(),
  visibility: VisibilitySchema,
  patch: z.record(JsonValueSchema),
  parts: z.array(GitHubChangePartSchema).default([]),
});
export type GitHubDetectedChange = z.infer<typeof GitHubDetectedChangeSchema>;

export const GitHubRepoCandidateSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  url: HttpUrlSchema,
  description: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  language: z.string().nullable(),
  private: z.boolean(),
  createdAt: TimestampSchema.nullable(),
  pushedAt: TimestampSchema.nullable(),
});
export type GitHubRepoCandidate = z.infer<typeof GitHubRepoCandidateSchema>;

export const GitHubSyncPreviewSchema = z.object({
  enabled: z.boolean(),
  generatedAt: TimestampSchema,
  projects: z.array(GitHubProjectPreviewSchema),
  changes: z.array(GitHubDetectedChangeSchema).default([]),
  newRepos: z.array(GitHubRepoCandidateSchema).default([]),
});
export type GitHubSyncPreview = z.infer<typeof GitHubSyncPreviewSchema>;

export const ReorderRequestSchema = z.object({
  ids: z.array(IdentifierSchema).min(1).max(500),
});
export type ReorderRequest = z.infer<typeof ReorderRequestSchema>;

export const TechnologyEcosystemSchema = z.array(z.string().trim().min(1).max(160)).max(500);

export const ProfileOverridesSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  title: z.string().trim().min(1).max(240).optional(),
  location: z.string().trim().min(1).max(240).optional(),
  email: z.string().email().max(320).optional(),
  avatarUrl: UrlSchema.nullable().optional(),
});
export type ProfileOverrides = z.infer<typeof ProfileOverridesSchema>;

export const ContentSnapshotSchema = z.object({
  version: z.literal(1),
  exportedAt: TimestampSchema,
  profileOverrides: ProfileOverridesSchema,
  projects: z.array(ProjectInputSchema),
  experiences: z.array(ExperienceInputSchema),
  education: z.array(EducationInputSchema),
  expertise: z.array(ExpertiseGroupInputSchema),
  heroMetrics: z.array(HeroMetricInputSchema),
  performanceMetrics: z.array(PerformanceMetricInputSchema),
  principles: z.array(PrincipleInputSchema),
  translations: z.array(TranslationInputSchema),
  uiMessages: z.array(UiMessageInputSchema).optional(),
  profiles: z.array(ProfileInputSchema).optional(),
  services: z.array(ServiceInputSchema).optional(),
  technologyEcosystem: TechnologyEcosystemSchema.optional(),
  settings: z.array(SettingInputSchema).optional(),
});
export type ContentSnapshot = z.infer<typeof ContentSnapshotSchema>;

export const ContentImportRequestSchema = z.object({
  mode: z.enum(["merge", "replace"]),
  snapshot: ContentSnapshotSchema,
});
export type ContentImportRequest = z.infer<typeof ContentImportRequestSchema>;

export const AdminResourceSchema = z.enum([
  "profiles",
  "projects",
  "experiences",
  "education",
  "expertise",
  "metrics",
  "performance-metrics",
  "principles",
  "translations",
  "settings",
]);
export type AdminResource = z.infer<typeof AdminResourceSchema>;

export type AdminResourceMap = {
  profiles: Profile;
  projects: Project;
  experiences: Experience;
  education: Education;
  expertise: ExpertiseGroup;
  metrics: HeroMetric;
  "performance-metrics": PerformanceMetric;
  principles: Principle;
  translations: Translation;
  settings: Setting;
};

export type AdminResourceInputMap = {
  profiles: ProfileInput;
  projects: ProjectInput;
  experiences: ExperienceInput;
  education: EducationInput;
  expertise: ExpertiseGroupInput;
  metrics: HeroMetricInput;
  "performance-metrics": PerformanceMetricInput;
  principles: PrincipleInput;
  translations: TranslationInput;
  settings: SettingInput;
};

export type PublicContent = {
  profile: Profile;
  profileOverrides: ProfileOverrides;
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  expertise: ExpertiseGroup[];
  heroMetrics: HeroMetric[];
  performanceMetrics: PerformanceMetric[];
  principles: Principle[];
  services: Service[];
  technologyEcosystem: string[];
  settings: Record<string, JsonValue>;
};

export type SessionState =
  | { authenticated: false }
  | { authenticated: true; user: AdminUser; csrfToken: string };

export type ApiSuccess<T> = { data: T };
export type ApiErrorBody = { error: { code: string; message: string; issues?: JsonValue } };
