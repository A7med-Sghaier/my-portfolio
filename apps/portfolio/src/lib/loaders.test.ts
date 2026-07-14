import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contactAction, projectLoader, rootLoader, ticketAction } from "./loaders";
import { setApiClientForTests, type PortfolioPublicClient } from "./api";

function client(overrides: Partial<PortfolioPublicClient> = {}): PortfolioPublicClient {
  return {
    getPublicContent: vi.fn().mockResolvedValue({
      profile: {
        name: "Ahmed Sghaier",
        monogram: "AS",
        title: "Engineer",
        positioning: "Positioning",
        statement: "Statement",
        location: "Bavaria, Germany",
        availability: "Remote",
        workAuthorization: "EU",
        disciplines: [],
        alternativeTitles: [],
        nationality: [],
        githubUrl: null,
        linkedinUrl: null,
        domainUrl: null,
        email: "ahmed@example.com",
        languages: [],
      },
      projects: [],
      experiences: [],
      education: [],
      expertise: [],
      heroMetrics: [],
      performanceMetrics: [],
      principles: [],
      settings: {},
    }),
    listPublicProjects: vi.fn().mockResolvedValue([]),
    getPublicProject: vi.fn().mockResolvedValue({
      slug: "case-study",
      title: "Case study",
      tagline: "Evidence",
      role: "Engineer",
      category: "Full-stack",
      status: "published",
      visibility: "public",
      featured: false,
      stack: [],
      metrics: [],
      overview: "Overview",
      userGroups: [],
      architecture: [],
      results: [],
    }),
    submitContact: vi.fn().mockResolvedValue({ ref: "AS-ABC123" }),
    lookupTicket: vi.fn().mockResolvedValue({
      ref: "AS-ABC123",
      name: "Visitor",
      email: "visitor@example.com",
      category: "Other",
      message: "A detailed original message",
      status: "received",
      read: false,
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-01T10:00:00.000Z",
      thread: [],
    }),
    replyToTicket: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as PortfolioPublicClient;
}

function loaderArgs(url: string, params: Record<string, string> = {}): LoaderFunctionArgs {
  return {
    request: new Request(url),
    params,
    context: {},
  } as unknown as LoaderFunctionArgs;
}

function actionArgs(url: string, values: Record<string, string>): ActionFunctionArgs {
  return {
    request: new Request(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(values),
    }),
    params: {},
    context: {},
  } as unknown as ActionFunctionArgs;
}

afterEach(() => setApiClientForTests(null));

describe("portfolio data routes", () => {
  it("loads localized content and project detail from the API", async () => {
    const api = client();
    setApiClientForTests(api);

    const root = await rootLoader(loaderArgs("https://portfolio.test/?lang=de"));
    const project = await projectLoader(
      loaderArgs("https://portfolio.test/projects/case-study?lang=de", {
        slug: "case-study",
      }),
    );

    expect(root.locale).toBe("de");
    expect(root.content.profile?.name).toBe("Ahmed Sghaier");
    expect(api.getPublicContent).toHaveBeenCalledWith("de", expect.any(AbortSignal));
    expect(project.project?.slug).toBe("case-study");
    expect(api.getPublicProject).toHaveBeenCalledWith("case-study", "de", expect.any(AbortSignal));
  });

  it("validates and submits the contact form through the API", async () => {
    const api = client();
    setApiClientForTests(api);
    const invalid = await contactAction(
      actionArgs("https://portfolio.test/contact", {
        name: "A",
        email: "bad",
        category: "Other",
        message: "short",
      }),
    );
    expect(invalid.ok).toBe(false);
    expect(invalid.fields?.email).toBeTruthy();

    const valid = await contactAction(
      actionArgs("https://portfolio.test/contact", {
        name: "Alex Visitor",
        email: "alex@example.com",
        category: "Other",
        message: "This is a detailed production enquiry.",
        consent: "on",
        locale: "en",
      }),
    );
    expect(valid).toEqual({
      ok: true,
      ticketRef: "AS-ABC123",
      name: "Alex Visitor",
      email: "alex@example.com",
    });
    expect(api.submitContact).toHaveBeenCalledOnce();
  });

  it("looks up and replies to a ticket without browser storage", async () => {
    const api = client();
    setApiClientForTests(api);
    const lookup = await ticketAction(
      actionArgs("https://portfolio.test/ticket", {
        intent: "lookup",
        ref: "as-abc123",
        email: "VISITOR@example.com",
      }),
    );
    expect(lookup.ok).toBe(true);
    expect(lookup.ticket?.ref).toBe("AS-ABC123");
    expect(api.lookupTicket).toHaveBeenCalledWith({
      ref: "AS-ABC123",
      email: "visitor@example.com",
    });

    const reply = await ticketAction(
      actionArgs("https://portfolio.test/ticket", {
        intent: "reply",
        ref: "AS-ABC123",
        email: "visitor@example.com",
        body: "Following up",
      }),
    );
    expect(reply.ok).toBe(true);
    expect(api.replyToTicket).toHaveBeenCalledWith({
      ref: "AS-ABC123",
      email: "visitor@example.com",
      body: "Following up",
    });
  });
});
