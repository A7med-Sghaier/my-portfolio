import type {
  AdminLoginRequest,
  AdminResource,
  AdminResourceInputMap,
  AdminResourceMap,
  ContactRequest,
  ContentSnapshot,
  Dashboard,
  GitHubSyncPreview,
  GitHubSyncStatus,
  Message,
  Project,
  PublicContent,
  ReorderRequest,
  SessionState,
  Setting,
  TicketLookupRequest,
  TicketReplyRequest,
  TicketStatus,
} from "@portfolio/core";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly issues?: unknown;

  constructor(status: number, code: string, message: string, issues?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

export type ApiClientOptions = {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
};

export type ListOptions = {
  signal?: AbortSignal;
  search?: string;
  status?: string;
};

export type MessageListOptions = ListOptions & {
  unread?: boolean;
};

export interface PortfolioApiClient {
  getPublicContent(locale?: string, signal?: AbortSignal): Promise<PublicContent>;
  listPublicProjects(locale?: string, signal?: AbortSignal): Promise<Project[]>;
  getPublicProject(slug: string, locale?: string, signal?: AbortSignal): Promise<Project>;
  submitContact(
    input: ContactRequest,
    signal?: AbortSignal,
  ): Promise<{ ref: string; status: TicketStatus; createdAt: string }>;
  lookupTicket(input: TicketLookupRequest, signal?: AbortSignal): Promise<Message>;
  replyToTicket(input: TicketReplyRequest, signal?: AbortSignal): Promise<Message>;
  getPublicCsrfToken(signal?: AbortSignal): Promise<{ csrfToken: string }>;
  getAdminCsrfToken(signal?: AbortSignal): Promise<{ csrfToken: string }>;
  getCsrfToken(signal?: AbortSignal): Promise<{ csrfToken: string }>;
  getSession(signal?: AbortSignal): Promise<SessionState>;
  login(input: AdminLoginRequest, signal?: AbortSignal): Promise<SessionState>;
  logout(signal?: AbortSignal): Promise<void>;
  getDashboard(signal?: AbortSignal): Promise<Dashboard>;
  getGitHubStatus(signal?: AbortSignal): Promise<GitHubSyncStatus>;
  previewGitHubSync(signal?: AbortSignal): Promise<GitHubSyncPreview>;
  exportContent(signal?: AbortSignal): Promise<ContentSnapshot>;
  importContent(
    snapshot: ContentSnapshot,
    options: { mode: "merge" | "replace" },
    signal?: AbortSignal,
  ): Promise<ContentSnapshot>;
  resetContentToSeed(signal?: AbortSignal): Promise<ContentSnapshot>;
  listResource<R extends AdminResource>(
    resource: R,
    options?: ListOptions,
  ): Promise<AdminResourceMap[R][]>;
  createResource<R extends AdminResource>(
    resource: R,
    input: AdminResourceInputMap[R],
    signal?: AbortSignal,
  ): Promise<AdminResourceMap[R]>;
  updateResource<R extends AdminResource>(
    resource: R,
    id: string,
    input: Partial<AdminResourceInputMap[R]>,
    signal?: AbortSignal,
  ): Promise<AdminResourceMap[R]>;
  deleteResource(resource: AdminResource, id: string, signal?: AbortSignal): Promise<void>;
  reorderResource(
    resource: AdminResource,
    input: ReorderRequest,
    signal?: AbortSignal,
  ): Promise<void>;
  listMessages(options?: MessageListOptions): Promise<Message[]>;
  getMessage(id: string, signal?: AbortSignal): Promise<Message>;
  setMessageStatus(id: string, status: TicketStatus, signal?: AbortSignal): Promise<Message>;
  setMessageRead(id: string, read: boolean, signal?: AbortSignal): Promise<Message>;
  replyToMessage(id: string, body: string, signal?: AbortSignal): Promise<Message>;
  deleteMessage(id: string, signal?: AbortSignal): Promise<void>;
  getSettings(signal?: AbortSignal): Promise<Setting[]>;
  updateSetting(
    key: string,
    value: Setting["value"],
    isPublic?: boolean,
    signal?: AbortSignal,
  ): Promise<Setting>;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  csrf?: "public" | "admin";
};

export function createApiClient(options: ApiClientOptions): PortfolioApiClient {
  const fetchImplementation = options.fetch ?? globalThis.fetch;
  if (!fetchImplementation) throw new Error("A Fetch API implementation is required");
  const baseUrl = options.baseUrl.replace(/\/$/, "");
  let publicCsrfToken: string | undefined;
  let adminCsrfToken: string | undefined;

  async function request<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const headers = new Headers({ Accept: "application/json" });
    if (requestOptions.body !== undefined) headers.set("Content-Type", "application/json");
    if (requestOptions.csrf === "public") {
      if (!publicCsrfToken)
        publicCsrfToken = (await getPublicCsrfToken(requestOptions.signal)).csrfToken;
      headers.set("X-CSRF-Token", publicCsrfToken);
    } else if (requestOptions.csrf === "admin") {
      if (!adminCsrfToken)
        adminCsrfToken = (await getAdminCsrfToken(requestOptions.signal)).csrfToken;
      headers.set("X-CSRF-Token", adminCsrfToken);
    }
    const init: RequestInit = {
      method: requestOptions.method ?? "GET",
      credentials: "include",
      headers,
    };
    if (requestOptions.signal) init.signal = requestOptions.signal;
    if (requestOptions.body !== undefined) init.body = JSON.stringify(requestOptions.body);
    const response = await fetchImplementation(`${baseUrl}${path}`, init);
    const payload = (await response.json().catch(() => null)) as {
      data?: T;
      error?: { code?: string; message?: string; issues?: unknown };
    } | null;
    if (!response.ok) {
      throw new ApiError(
        response.status,
        payload?.error?.code ?? "request_failed",
        payload?.error?.message ?? "The request could not be completed.",
        payload?.error?.issues,
      );
    }
    return payload?.data as T;
  }

  async function getPublicCsrfToken(signal?: AbortSignal): Promise<{ csrfToken: string }> {
    const result = await request<{ csrfToken: string }>(
      "/api/public/csrf",
      signal ? { signal } : {},
    );
    publicCsrfToken = result.csrfToken;
    return result;
  }

  async function getAdminCsrfToken(signal?: AbortSignal): Promise<{ csrfToken: string }> {
    const result = await request<{ csrfToken: string }>("/api/auth/csrf", signal ? { signal } : {});
    adminCsrfToken = result.csrfToken;
    return result;
  }

  const query = (values: Record<string, string | boolean | undefined>): string => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(values))
      if (value !== undefined) search.set(key, String(value));
    const value = search.toString();
    return value ? `?${value}` : "";
  };

  return {
    getPublicContent: (locale = "en", signal) =>
      request(`/api/content${query({ locale })}`, signal ? { signal } : {}),
    listPublicProjects: (locale = "en", signal) =>
      request(`/api/projects${query({ locale })}`, signal ? { signal } : {}),
    getPublicProject: (slug, locale = "en", signal) =>
      request(
        `/api/projects/${encodeURIComponent(slug)}${query({ locale })}`,
        signal ? { signal } : {},
      ),
    submitContact: (input, signal) =>
      request("/api/contact", {
        method: "POST",
        body: input,
        csrf: "public",
        ...(signal ? { signal } : {}),
      }),
    lookupTicket: (input, signal) =>
      request("/api/ticket/lookup", { method: "POST", body: input, ...(signal ? { signal } : {}) }),
    replyToTicket: (input, signal) =>
      request("/api/ticket/reply", {
        method: "POST",
        body: input,
        csrf: "public",
        ...(signal ? { signal } : {}),
      }),
    getPublicCsrfToken,
    getAdminCsrfToken,
    getCsrfToken: getAdminCsrfToken,
    getSession: async (signal) => {
      const session = await request<SessionState>("/api/auth/session", signal ? { signal } : {});
      adminCsrfToken = session.authenticated ? session.csrfToken : undefined;
      return session;
    },
    login: async (input, signal) => {
      const session = await request<SessionState>("/api/auth/login", {
        method: "POST",
        body: input,
        csrf: "admin",
        ...(signal ? { signal } : {}),
      });
      if (session.authenticated) adminCsrfToken = session.csrfToken;
      return session;
    },
    logout: async (signal) => {
      await request<void>("/api/auth/logout", {
        method: "POST",
        csrf: "admin",
        ...(signal ? { signal } : {}),
      });
      adminCsrfToken = undefined;
    },
    getDashboard: (signal) => request("/api/admin/dashboard", signal ? { signal } : {}),
    getGitHubStatus: (signal) => request("/api/admin/github/status", signal ? { signal } : {}),
    previewGitHubSync: (signal) =>
      request("/api/admin/github/preview", {
        method: "POST",
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    exportContent: (signal) => request("/api/admin/content/export", signal ? { signal } : {}),
    importContent: (snapshot, importOptions, signal) =>
      request("/api/admin/content/import", {
        method: "POST",
        body: { snapshot, mode: importOptions.mode },
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    resetContentToSeed: (signal) =>
      request("/api/admin/content/reset", {
        method: "POST",
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    listResource: (resource, listOptions = {}) =>
      request(
        `/api/admin/${resource}${query({ search: listOptions.search, status: listOptions.status })}`,
        listOptions.signal ? { signal: listOptions.signal } : {},
      ),
    createResource: (resource, input, signal) =>
      request(`/api/admin/${resource}`, {
        method: "POST",
        body: input,
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    updateResource: (resource, id, input, signal) =>
      request(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: input,
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    deleteResource: (resource, id, signal) =>
      request(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
        method: "DELETE",
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    reorderResource: (resource, input, signal) =>
      request(`/api/admin/${resource}/reorder`, {
        method: "POST",
        body: input,
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    listMessages: (listOptions = {}) =>
      request(
        `/api/admin/messages${query({ search: listOptions.search, status: listOptions.status, unread: listOptions.unread })}`,
        listOptions.signal ? { signal: listOptions.signal } : {},
      ),
    getMessage: (id, signal) =>
      request(`/api/admin/messages/${encodeURIComponent(id)}`, signal ? { signal } : {}),
    setMessageStatus: (id, status, signal) =>
      request(`/api/admin/messages/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        body: { status },
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    setMessageRead: (id, read, signal) =>
      request(`/api/admin/messages/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        body: { read },
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    replyToMessage: (id, body, signal) =>
      request(`/api/admin/messages/${encodeURIComponent(id)}/thread`, {
        method: "POST",
        body: { author: "admin", body },
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    deleteMessage: (id, signal) =>
      request(`/api/admin/messages/${encodeURIComponent(id)}`, {
        method: "DELETE",
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
    getSettings: (signal) => request("/api/admin/settings", signal ? { signal } : {}),
    updateSetting: (key, value, isPublic = false, signal) =>
      request(`/api/admin/settings/${encodeURIComponent(key)}`, {
        method: "PUT",
        body: { key, value, isPublic },
        csrf: "admin",
        ...(signal ? { signal } : {}),
      }),
  };
}
