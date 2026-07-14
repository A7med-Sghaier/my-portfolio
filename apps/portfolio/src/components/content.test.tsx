import { I18nProvider } from "@portfolio/i18n";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { PortfolioProject } from "@/lib/content";
import { ProjectCard } from "./content";

const project: PortfolioProject = {
  slug: "typed-platform",
  title: "Typed Platform",
  tagline: "A reliable data-intensive product.",
  year: "2026",
  role: "Full-stack engineering",
  category: "Full-stack",
  visibility: "public",
  featured: true,
  status: "published",
  stack: ["React", "PostgreSQL"],
  metrics: [],
  media: [{ src: "/projects/platform.png", alt: "Platform dashboard" }],
  overview: "Overview",
  userGroups: [],
  architecture: [],
  results: [],
  sections: [],
};

describe("ProjectCard", () => {
  it("renders meaningful media and a localized case-study link", () => {
    render(
      <I18nProvider initialLanguage="ar" persist={false}>
        <MemoryRouter>
          <ProjectCard project={project} />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByRole("img", { name: "Platform dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Typed Platform" })).toHaveAttribute(
      "href",
      "/projects/typed-platform?lang=ar",
    );
    expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
  });
});
