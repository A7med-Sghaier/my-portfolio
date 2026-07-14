import { act, render, screen } from "@testing-library/react";
import { I18nProvider } from "@portfolio/i18n";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { normalizeContent } from "@/lib/content";
import { SystemHud } from "./system-hud";

const content = normalizeContent({
  profile: null,
  projects: [],
  experiences: [],
  education: [],
  expertise: [],
  principles: [],
  heroMetrics: [],
  performanceMetrics: [],
});

afterEach(() => vi.unstubAllGlobals());

describe("SystemHud", () => {
  it("labels elapsed session time truthfully and leaves the focus tree at the footer", () => {
    let updateIntersection: IntersectionObserverCallback | undefined;
    class IntersectionObserverMock {
      constructor(callback: IntersectionObserverCallback) {
        updateIntersection = callback;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
    }
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

    render(
      <I18nProvider persist={false}>
        <MemoryRouter>
          <SystemHud content={content} navigationState="idle" onOpenCommand={vi.fn()} />
          <footer data-portfolio-footer />
        </MemoryRouter>
      </I18nProvider>,
    );

    expect(screen.getByText("Session elapsed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Command palette/ })).toBeInTheDocument();

    act(() => {
      updateIntersection?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.queryByRole("button", { name: /Command palette/ })).not.toBeInTheDocument();
  });
});
