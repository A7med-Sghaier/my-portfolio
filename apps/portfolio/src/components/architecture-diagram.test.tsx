import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@portfolio/i18n";
import { describe, expect, it } from "vitest";
import { normalizeProjectResponse } from "@/lib/content";
import { ArchitectureDiagram } from "./architecture-diagram";

describe("ArchitectureDiagram", () => {
  it("renders the exact loaded architecture nodes and exposes a trace control", () => {
    const project = normalizeProjectResponse({
      slug: "verified-flow",
      title: "Verified Flow",
      tagline: "A loaded project",
      role: "Engineer",
      status: "published",
      visibility: "public",
      stack: [],
      metrics: [],
      overview: "Overview",
      architecture: [
        "React client",
        "Python Falcon API layer",
        "ML prediction model",
        "PostgreSQL data store",
      ],
      userGroups: [],
      results: [],
    });
    if (!project) throw new Error("Expected a normalized project");

    render(
      <I18nProvider persist={false}>
        <ArchitectureDiagram project={project} />
      </I18nProvider>,
    );

    expect(screen.getByRole("figure", { name: /system architecture/i })).toBeInTheDocument();
    expect(screen.getByText("React client")).toBeInTheDocument();
    expect(screen.getByText("Python Falcon API layer")).toBeInTheDocument();
    expect(screen.getByText("ML prediction model")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL data store")).toBeInTheDocument();
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("Intelligence")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /system architecture/i })).toHaveAttribute(
      "tabindex",
      "0",
    );
    fireEvent.click(screen.getByRole("button", { name: "Run request" }));
    expect(screen.getByRole("button", { name: "Tracing…" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("React client");
  });
});
