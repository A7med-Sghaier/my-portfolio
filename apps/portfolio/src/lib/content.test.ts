import { describe, expect, it } from "vitest";
import {
  careerYears,
  contactReference,
  normalizeContent,
  normalizeProjectResponse,
  normalizeTicket,
} from "./content";

describe("portfolio response normalization", () => {
  it("normalizes the typed API snapshot without inventing missing content", () => {
    const result = normalizeContent({
      profile: {
        name: "Ahmed Sghaier",
        monogram: "AS",
        title: "Senior Full-Stack Engineer",
        positioning: "Building intelligent products.",
        statement: "End-to-end product engineering.",
        location: "Bavaria, Germany",
        availability: "Remote worldwide",
        workAuthorization: "Germany & European Union",
        disciplines: ["React", "Data & AI"],
        alternativeTitles: [],
        nationality: ["German", "Tunisian"],
        githubUrl: "https://github.com/example",
        linkedinUrl: "https://linkedin.com/in/example",
        domainUrl: "https://example.com",
        email: "ahmed@example.com",
        avatarUrl: "data:image/webp;base64,UklGRg==",
        languages: [{ name: "English", level: "B2", value: 75 }],
      },
      projects: [
        {
          slug: "typed-platform",
          title: "Typed Platform",
          tagline: "A production platform.",
          role: "Full-stack",
          category: "Full-stack",
          status: "published",
          visibility: "public",
          featured: true,
          stack: ["React", "PostgreSQL"],
          metrics: [{ value: "2x", label: "Delivery" }],
          overview: "Overview",
          userGroups: [],
          architecture: [],
          results: [],
          details: {
            media: [{ src: "/projects/typed.png", alt: "Typed platform UI" }],
          },
        },
      ],
      experiences: [],
      education: [],
      expertise: [],
      heroMetrics: [{ id: "years", value: 10, suffix: "+", label: "Years" }],
      performanceMetrics: [{ id: "speed", from: "2.5s", to: "700ms", label: "Object view" }],
      principles: [],
    });

    expect(result.profile?.links.github).toBe("https://github.com/example");
    // The admin-managed avatar (inline data URL or hosted image) flows through.
    expect(result.profile?.avatarUrl).toBe("data:image/webp;base64,UklGRg==");
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.media[0]?.alt).toBe("Typed platform UI");
    expect(result.performanceMetric?.to).toBe("700ms");
    expect(result.technologyEcosystem).toEqual(["React", "PostgreSQL"]);
  });

  it("drops avatar URLs that are neither safe links nor inline images", () => {
    const result = normalizeContent({
      profile: {
        name: "Ahmed Sghaier",
        avatarUrl: "ftp://example.com/portrait.jpg",
      },
    });
    expect(result.profile?.avatarUrl).toBeUndefined();
  });

  it("normalizes project and ticket envelopes", () => {
    const project = normalizeProjectResponse({
      data: {
        project: {
          slug: "case-study",
          title: "Case study",
          tagline: "Evidence",
          role: "Engineer",
          status: "published",
          visibility: "public",
          stack: [],
          metrics: [],
          overview: "Overview",
          userGroups: [],
          architecture: [],
          results: [],
        },
      },
    });
    const ticket = normalizeTicket({
      ref: "AS-ABC123",
      name: "Visitor",
      email: "visitor@example.com",
      message: "Hello",
      status: "discussion",
      createdAt: "2026-01-01T10:00:00.000Z",
      thread: [
        {
          id: "1",
          author: "admin",
          body: "Thanks",
          createdAt: "2026-01-01T11:00:00.000Z",
        },
      ],
    });

    expect(project?.slug).toBe("case-study");
    expect(ticket?.thread[0]?.author).toBe("ahmed");
    expect(contactReference({ data: { ref: "AS-ABC123" } })).toBe("AS-ABC123");
  });

  it("rejects unsafe public URLs and derives experience length from API dates", () => {
    const result = normalizeContent({
      profile: {
        name: "Ahmed Sghaier",
        githubUrl: "javascript:alert(1)",
        linkedinUrl: "https://linkedin.com/in/example",
        email: "invalid\n@example.com",
      },
      experiences: [
        { id: "first", company: "A", role: "Engineer", start: "2016-03" },
        { id: "second", company: "B", role: "Senior Engineer", start: "2021-01" },
      ],
      projects: [
        {
          slug: "safe-project",
          title: "Safe project",
          repo: "data:text/html,unsafe",
          liveUrl: "https://example.com/demo",
          media: [
            { src: "//evil.example/tracker.png", alt: "Unsafe media" },
            { src: "/projects/safe.png", alt: "Safe media" },
          ],
        },
      ],
    });

    expect(result.profile?.links.github).toBeUndefined();
    expect(result.profile?.links.linkedin).toBe("https://linkedin.com/in/example");
    expect(result.profile?.links.email).toBeUndefined();
    expect(result.projects[0]?.repo).toBeUndefined();
    expect(result.projects[0]?.liveUrl).toBe("https://example.com/demo");
    expect(result.projects[0]?.media).toEqual([{ src: "/projects/safe.png", alt: "Safe media" }]);
    expect(careerYears(result.experiences, 2026)).toBe(10);
  });
});
