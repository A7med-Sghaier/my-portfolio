import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider } from "@portfolio/i18n";
import { useState } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { normalizeContent } from "@/lib/content";
import { CommandPalette } from "./command-palette";

const content = normalizeContent({
  profile: {
    name: "Ahmed Sghaier",
    title: "Engineer",
    positioning: "Product engineering",
    statement: "Verified profile",
    location: "Bavaria",
    availability: "Remote",
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

function LocationProbe() {
  const location = useLocation();
  return (
    <output aria-label="Current path">
      {location.pathname}
      {location.search}
      {location.hash}
    </output>
  );
}

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        content={content}
        dark
        onToggleTheme={vi.fn()}
      />
      <LocationProbe />
    </>
  );
}

describe("CommandPalette", () => {
  it("opens with Ctrl+K and supports keyboard navigation", async () => {
    render(
      <I18nProvider persist={false}>
        <MemoryRouter>
          <Harness />
        </MemoryRouter>
      </I18nProvider>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const search = screen.getByRole("combobox");
    fireEvent.change(search, { target: { value: "Projects" } });
    expect(screen.getByRole("option", { name: "Projects" })).toHaveAttribute("tabindex", "-1");
    fireEvent.keyDown(search, { key: "Enter" });

    expect(screen.getByRole("status", { name: "Current path" })).toHaveTextContent("/projects");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserves the anchor when switching locale", async () => {
    render(
      <I18nProvider persist={false}>
        <MemoryRouter initialEntries={["/about?view=timeline#journey"]}>
          <Harness />
        </MemoryRouter>
      </I18nProvider>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const search = await screen.findByRole("combobox");
    fireEvent.change(search, { target: { value: "Français" } });
    fireEvent.keyDown(search, { key: "Enter" });

    expect(screen.getByRole("status", { name: "Current path" })).toHaveTextContent(
      "/about?view=timeline&lang=fr#journey",
    );
  });

  it("keeps the palette open and confirms a copied email", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <I18nProvider persist={false}>
        <MemoryRouter>
          <Harness />
        </MemoryRouter>
      </I18nProvider>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const search = await screen.findByRole("combobox");
    fireEvent.change(search, { target: { value: "Copy email" } });
    fireEvent.keyDown(search, { key: "Enter" });

    expect(await screen.findByText("Copied ahmed@example.com to the clipboard.")).toBeVisible();
    expect(writeText).toHaveBeenCalledWith("ahmed@example.com");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("reports clipboard failures without closing the palette", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) },
    });

    render(
      <I18nProvider persist={false}>
        <MemoryRouter>
          <Harness />
        </MemoryRouter>
      </I18nProvider>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    const search = await screen.findByRole("combobox");
    fireEvent.change(search, { target: { value: "Copy email" } });
    fireEvent.keyDown(search, { key: "Enter" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not copy ahmed@example.com.");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps the centered dialog geometry in RTL", async () => {
    render(
      <I18nProvider initialLanguage="ar" persist={false}>
        <MemoryRouter>
          <Harness />
        </MemoryRouter>
      </I18nProvider>,
    );

    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(await screen.findByRole("dialog")).toHaveClass("rtl:translate-x-1/2");
  });
});
