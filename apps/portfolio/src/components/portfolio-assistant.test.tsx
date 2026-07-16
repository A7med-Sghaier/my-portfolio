import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@portfolio/i18n";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setApiClientForTests, type PortfolioPublicClient } from "@/lib/api";
import { normalizeContent } from "@/lib/content";
import { PortfolioAssistant } from "./portfolio-assistant";

const content = normalizeContent({
  profile: {
    name: "Ahmed Sghaier",
    title: "Engineer",
    positioning: "Product engineering",
    statement: "Verified profile",
    location: "Bavaria",
    availability: "Available for remote work",
    languages: [],
    links: { email: "ahmed@example.com" },
  },
  projects: [],
  experiences: [],
  education: [],
  expertise: [],
  principles: [],
  heroMetrics: [],
  performanceMetrics: [],
});

function renderAssistant(askAssistant: PortfolioPublicClient["askAssistant"]) {
  setApiClientForTests({ askAssistant } as unknown as PortfolioPublicClient);
  render(
    <I18nProvider persist={false}>
      <MemoryRouter>
        <PortfolioAssistant content={content} />
      </MemoryRouter>
    </I18nProvider>,
  );
}

async function ask(question: string) {
  fireEvent.click(screen.getByRole("button", { name: "Ask my portfolio" }));
  fireEvent.change(await screen.findByPlaceholderText("Ask about experience, projects, skills…"), {
    target: { value: question },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
}

afterEach(() => setApiClientForTests(null));

describe("PortfolioAssistant", () => {
  it("shows the AI answer when the assistant endpoint responds", async () => {
    const askAssistant = vi.fn().mockResolvedValue({ text: "Ahmed is a full-stack engineer." });
    renderAssistant(askAssistant);
    await ask("What does Ahmed do?");
    expect(await screen.findByText("Ahmed is a full-stack engineer.")).toBeInTheDocument();
    expect(askAssistant).toHaveBeenCalledWith(
      { question: "What does Ahmed do?", locale: "en" },
      expect.any(AbortSignal),
    );
  });

  it("falls back to the grounded keyword answer when the endpoint fails", async () => {
    renderAssistant(vi.fn().mockRejectedValue(new Error("assistant_unavailable")));
    await ask("Is Ahmed available for remote work?");
    expect(await screen.findByText(/Available for remote work/)).toBeInTheDocument();
  });
});
