import { ApiError, createApiClient, type PortfolioApiClient } from "@portfolio/db/client";

export interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  category: string;
  message: string;
  consent: true;
  website?: string;
  locale: string;
}

export type PortfolioPublicClient = Pick<
  PortfolioApiClient,
  | "getPublicContent"
  | "listPublicProjects"
  | "getPublicProject"
  | "submitContact"
  | "lookupTicket"
  | "replyToTicket"
  | "askAssistant"
  | "runIntakeDemo"
  | "getUiMessages"
>;

let testClient: PortfolioPublicClient | null = null;

export function getApiClient(): PortfolioPublicClient {
  if (testClient) return testClient;
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/u, "") ?? "";
  return createApiClient({ baseUrl });
}

export function setApiClientForTests(client: PortfolioPublicClient | null): void {
  testClient = client;
}

export function friendlyApiError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

export function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const withStatus = error as ApiError & { status?: number };
  return withStatus.status === 404;
}
