import { createBrowserRouter } from "react-router";
import { AppShell } from "./app-shell";
import { InitialLoading, RouteErrorBoundary } from "@/components/feedback";
import { contactAction, projectLoader, rootLoader, ticketAction } from "@/lib/loaders";

export const router = createBrowserRouter([
  {
    id: "portfolio-root",
    path: "/",
    loader: rootLoader,
    Component: AppShell,
    HydrateFallback: InitialLoading,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import("@/routes/home");
          return { Component: HomePage };
        },
      },
      {
        path: "about",
        lazy: async () => {
          const { AboutPage } = await import("@/routes/about");
          return { Component: AboutPage };
        },
      },
      {
        path: "experience",
        lazy: async () => {
          const { ExperiencePage } = await import("@/routes/experience");
          return { Component: ExperiencePage };
        },
      },
      {
        path: "projects",
        lazy: async () => {
          const { ProjectsPage } = await import("@/routes/projects");
          return { Component: ProjectsPage };
        },
      },
      {
        path: "projects/:slug",
        loader: projectLoader,
        lazy: async () => {
          const { ProjectDetailPage } = await import("@/routes/project-detail");
          return { Component: ProjectDetailPage };
        },
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "expertise",
        lazy: async () => {
          const { ExpertisePage } = await import("@/routes/expertise");
          return { Component: ExpertisePage };
        },
      },
      {
        path: "ai-lab",
        lazy: async () => {
          const { AiLabPage } = await import("@/routes/ai-lab");
          return { Component: AiLabPage };
        },
      },
      {
        path: "resume",
        lazy: async () => {
          const { ResumePage } = await import("@/routes/resume");
          return { Component: ResumePage };
        },
      },
      {
        path: "contact",
        action: contactAction,
        lazy: async () => {
          const { ContactPage } = await import("@/routes/contact");
          return { Component: ContactPage };
        },
      },
      {
        path: "ticket",
        action: ticketAction,
        lazy: async () => {
          const { TicketPage } = await import("@/routes/ticket");
          return { Component: TicketPage };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundPage } = await import("@/routes/not-found");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
