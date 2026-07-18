import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { setMessageOverrides, translate, type Lang } from "@portfolio/i18n";
import {
  contactReference,
  normalizeContent,
  normalizeProjectResponse,
  normalizeTicket,
  type PortfolioContent,
  type PortfolioProject,
  type PublicTicket,
} from "./content";
import { friendlyApiError, getApiClient, isNotFoundError, type ContactSubmission } from "./api";

const SUPPORTED_LOCALES = new Set<Lang>(["en", "de", "fr", "ar"]);

export function localeFromRequest(request: Request): Lang {
  const requested = new URL(request.url).searchParams.get("lang") as Lang | null;
  return requested && SUPPORTED_LOCALES.has(requested) ? requested : "en";
}

function projectsFromResponse(raw: unknown): PortfolioProject[] {
  return normalizeContent(Array.isArray(raw) ? { projects: raw } : raw).projects;
}

export interface RootLoaderData {
  locale: Lang;
  content: PortfolioContent;
}

export async function rootLoader({ request }: LoaderFunctionArgs): Promise<RootLoaderData> {
  const locale = localeFromRequest(request);
  const client = getApiClient();
  const [contentResponse, projectsResponse, uiMessages] = await Promise.all([
    client.getPublicContent(locale, request.signal),
    client.listPublicProjects(locale, request.signal),
    // Admin-managed copy is an enhancement; the bundled dictionaries keep the
    // site fully translated when the endpoint is unavailable.
    client.getUiMessages(request.signal).catch(() => ({})),
  ]);
  setMessageOverrides(uiMessages);
  const content = normalizeContent(contentResponse);
  const projects = projectsFromResponse(projectsResponse);

  return {
    locale,
    content: {
      ...content,
      projects: projects.length > 0 ? projects : content.projects,
    },
  };
}

export interface ProjectLoaderData {
  locale: Lang;
  project: PortfolioProject | null;
}

export async function projectLoader({
  params,
  request,
}: LoaderFunctionArgs): Promise<ProjectLoaderData> {
  const locale = localeFromRequest(request);
  const slug = params.slug;
  if (!slug) return { locale, project: null };

  try {
    const response = await getApiClient().getPublicProject(slug, locale, request.signal);
    return { locale, project: normalizeProjectResponse(response) };
  } catch (error) {
    if (isNotFoundError(error)) return { locale, project: null };
    throw error;
  }
}

export interface ContactActionData {
  ok: boolean;
  ticketRef?: string;
  name?: string;
  email?: string;
  message?: string;
  fields?: Record<string, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validateContact(formData: FormData): {
  input?: ContactSubmission;
  fields: Record<string, string>;
} {
  const name = formString(formData, "name").trim();
  const email = formString(formData, "email").trim().toLowerCase();
  const company = formString(formData, "company").trim();
  const category = formString(formData, "category").trim();
  const message = formString(formData, "message").trim();
  const website = formString(formData, "website").trim();
  const consent = formData.get("consent") === "on";
  const requestedLocale = formString(formData, "locale") as Lang;
  const locale = SUPPORTED_LOCALES.has(requestedLocale) ? requestedLocale : "en";
  const fields: Record<string, string> = {};

  if (!name) fields.name = translate(locale, "contact.err.name");
  if (!EMAIL_PATTERN.test(email)) fields.email = translate(locale, "contact.err.email");
  if (!category) fields.category = "Choose an opportunity type.";
  if (message.length < 10) {
    fields.message = translate(locale, "contact.err.message");
  }
  if (!consent) fields.consent = translate(locale, "contact.err.consent");
  if (website) fields.website = "Invalid submission.";

  if (Object.keys(fields).length > 0) return { fields };

  return {
    fields,
    input: {
      name,
      email,
      company: company || undefined,
      category,
      message,
      consent: true,
      website: website || undefined,
      locale,
    },
  };
}

export async function contactAction({ request }: ActionFunctionArgs): Promise<ContactActionData> {
  const formData = await request.formData();
  const validation = validateContact(formData);
  if (!validation.input) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fields: validation.fields,
    };
  }

  try {
    const { name, email, company, category, message } = validation.input;
    const response = await getApiClient().submitContact({
      name,
      email,
      ...(company ? { company } : {}),
      category,
      message,
    });
    return {
      ok: true,
      ticketRef: contactReference(response) ?? undefined,
      name,
      email,
    };
  } catch (error) {
    return {
      ok: false,
      message: friendlyApiError(error, "Your message could not be sent. Please try again shortly."),
    };
  }
}

export interface TicketActionData {
  ok: boolean;
  intent: "lookup" | "reply";
  ticket?: PublicTicket;
  ref?: string;
  email?: string;
  message?: string;
  fields?: Record<string, string>;
}

export async function ticketAction({ request }: ActionFunctionArgs): Promise<TicketActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") === "reply" ? "reply" : "lookup";
  const ref = formString(formData, "ref").trim().toUpperCase();
  const email = formString(formData, "email").trim().toLowerCase();
  const fields: Record<string, string> = {};
  if (ref.length < 4) fields.ref = "Enter your ticket reference.";
  if (!EMAIL_PATTERN.test(email)) fields.email = "Enter the email used to contact us.";

  if (intent === "reply") {
    const body = formString(formData, "body").trim();
    if (body.length < 2) fields.body = "Write a short reply first.";
    if (Object.keys(fields).length > 0) {
      return { ok: false, intent, ref, email, fields };
    }
    try {
      await getApiClient().replyToTicket({ ref, email, body });
      const response = await getApiClient().lookupTicket({ ref, email });
      const ticket = normalizeTicket(response);
      return ticket
        ? { ok: true, intent, ref, email, ticket }
        : {
            ok: false,
            intent,
            ref,
            email,
            message: "The reply was sent, but the conversation could not be refreshed.",
          };
    } catch (error) {
      return {
        ok: false,
        intent,
        ref,
        email,
        message: friendlyApiError(error, "Your reply could not be sent."),
      };
    }
  }

  if (Object.keys(fields).length > 0) {
    return { ok: false, intent, ref, email, fields };
  }

  try {
    const response = await getApiClient().lookupTicket({ ref, email });
    const ticket = normalizeTicket(response);
    return ticket
      ? { ok: true, intent, ref, email, ticket }
      : {
          ok: false,
          intent,
          ref,
          email,
          message: "No ticket matches that reference and email.",
        };
  } catch (error) {
    return {
      ok: false,
      intent,
      ref,
      email,
      message: friendlyApiError(error, "No ticket matches that reference and email."),
    };
  }
}
