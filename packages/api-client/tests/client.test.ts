import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../src/index.js";

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("browser API client", () => {
  it("retains the session-bound CSRF token after a reload", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(
        response({
          authenticated: true,
          csrfToken: "session-csrf",
          user: {
            id: "48e7a8d3-a028-4f07-a893-e31a2f55d290",
            email: "admin@example.com",
            displayName: "Admin",
            active: true,
            lastLoginAt: null,
          },
        }),
      )
      .mockResolvedValueOnce(response(null));
    const client = createApiClient({ baseUrl: "https://admin.example.com/", fetch });
    await client.getSession();
    await client.deleteMessage("18249552-46ca-4aea-bf43-f5b1268b7999");
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "https://admin.example.com/api/auth/session",
      expect.objectContaining({ credentials: "include" }),
    );
    const secondRequest = fetch.mock.calls[1]?.[1];
    expect(new Headers(secondRequest?.headers).get("X-CSRF-Token")).toBe("session-csrf");
  });

  it("keeps public and admin anonymous CSRF tokens separate", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(response({ csrfToken: "public-csrf" }))
      .mockResolvedValueOnce(
        response(
          {
            ref: "AS-0123456789ABCDEF0123456789ABCDEF",
            status: "received",
            createdAt: new Date().toISOString(),
          },
          201,
        ),
      )
      .mockResolvedValueOnce(response({ csrfToken: "admin-csrf" }))
      .mockResolvedValueOnce(
        response({
          authenticated: true,
          csrfToken: "session-csrf",
          user: {
            id: "48e7a8d3-a028-4f07-a893-e31a2f55d290",
            email: "admin@example.com",
            displayName: "Admin",
            active: true,
            lastLoginAt: null,
          },
        }),
      );
    const client = createApiClient({ baseUrl: "https://portfolio.example.com", fetch });
    await client.submitContact({
      name: "Taylor Example",
      email: "taylor@example.com",
      category: "Project inquiry",
      message: "A sufficiently detailed project inquiry.",
    });
    await client.login({ email: "admin@example.com", password: "strong-test-password" });

    expect(fetch.mock.calls[0]?.[0]).toBe("https://portfolio.example.com/api/public/csrf");
    const publicMutation = fetch.mock.calls[1]?.[1];
    expect(new Headers(publicMutation?.headers).get("X-CSRF-Token")).toBe("public-csrf");
    expect(publicMutation?.credentials).toBe("include");
    expect(fetch.mock.calls[2]?.[0]).toBe("https://portfolio.example.com/api/auth/csrf");
    const adminMutation = fetch.mock.calls[3]?.[1];
    expect(new Headers(adminMutation?.headers).get("X-CSRF-Token")).toBe("admin-csrf");
  });
});
