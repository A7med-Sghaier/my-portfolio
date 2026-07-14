import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Seo } from "./seo";

describe("Seo", () => {
  it("writes canonical, social and structured metadata for a route", async () => {
    render(
      <Seo
        title="Projects"
        description="Verified engineering case studies."
        path="/projects"
        locale="de"
        structuredData={{ "@type": "CollectionPage", name: "Projects" }}
      />,
    );

    await waitFor(() => expect(document.title).toBe("Projects · Ahmed Sghaier"));
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://a7med-sghaier.app/projects",
    );
    expect(document.querySelector('meta[property="og:locale"]')).toHaveAttribute("content", "de");
    expect(document.querySelector('script[data-portfolio-jsonld="true"]')?.textContent).toContain(
      "CollectionPage",
    );
    expect(document.querySelectorAll('link[data-portfolio-alternate="true"]')).toHaveLength(4);
  });
});
