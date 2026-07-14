import { describe, expect, it } from "vitest";
import {
  ContactRequestSchema,
  ContentSnapshotSchema,
  ProjectInputSchema,
  TicketLookupRequestSchema,
  HttpUrlSchema,
} from "../src/index.js";

describe("domain validation", () => {
  it("normalizes ticket claim credentials", () => {
    expect(
      TicketLookupRequestSchema.parse({ ref: " as-ab23 ", email: "User@Example.COM" }),
    ).toEqual({
      ref: "AS-AB23",
      email: "user@example.com",
    });
  });

  it("rejects malformed contact requests", () => {
    expect(() =>
      ContactRequestSchema.parse({ name: "A", email: "invalid", category: "", message: "short" }),
    ).toThrow();
  });

  it("defaults new projects to private drafts", () => {
    const project = ProjectInputSchema.parse({
      slug: "safe-project",
      title: "Safe project",
      tagline: "A verified project.",
      year: "2026",
      role: "Engineer",
      atmosphere: "project",
      stack: [],
      metrics: [],
      overview: "",
      problem: "",
      userGroups: [],
      roleDetail: "",
      architecture: [],
      frontend: "",
      backend: "",
      database: "",
      security: "",
      performance: "",
      testing: "",
      cicd: "",
      results: [],
      sortOrder: 0,
    });
    expect(project).toMatchObject({ visibility: "private", status: "draft", featured: false });
  });

  it("does not admit inbox data into content snapshots", () => {
    const result = ContentSnapshotSchema.parse({
      version: 1,
      exportedAt: new Date().toISOString(),
      profileOverrides: {},
      projects: [],
      experiences: [],
      education: [],
      expertise: [],
      heroMetrics: [],
      performanceMetrics: [],
      principles: [],
      translations: [],
      messages: [{ email: "private@example.com" }],
    });
    expect(result).not.toHaveProperty("messages");
  });

  it("accepts only HTTPS URLs outside local development", () => {
    expect(HttpUrlSchema.parse("https://example.com/path")).toBe("https://example.com/path");
    expect(HttpUrlSchema.parse("http://localhost:5173/path")).toBe("http://localhost:5173/path");
    expect(() => HttpUrlSchema.parse("http://example.com")).toThrow();
    expect(() => HttpUrlSchema.parse("javascript:alert(1)")).toThrow();
    expect(() => HttpUrlSchema.parse("ftp://example.com/file")).toThrow();
  });
});
