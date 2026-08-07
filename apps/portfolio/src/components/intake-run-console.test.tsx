import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@portfolio/i18n";
import type { IntakeDemoEvent } from "@portfolio/core";
import { describe, expect, it } from "vitest";
import { IntakeRunConsole } from "./intake-run-console";

// The console's whole point is that every line comes from a streamed
// measurement, so the tests assert the numbers on screen are the ones the
// events carried — never a plausible-looking stand-in.

const events: IntakeDemoEvent[] = [
  { type: "stage", id: "fetch" },
  {
    type: "note",
    note: { kind: "repo", fullName: "example/project", language: "TypeScript", topics: 5 },
  },
  { type: "note", note: { kind: "readme", chars: 11343 } },
  { type: "stage-done", stage: { id: "fetch", status: "ok", durationMs: 520 } },
  { type: "stage", id: "extract" },
  { type: "note", note: { kind: "section", heading: "Configuring CORS" } },
  { type: "note", note: { kind: "sections", count: 16 } },
  { type: "note", note: { kind: "field", field: "stack", chars: 40, items: 5, generated: false } },
  { type: "stage", id: "generate" },
  { type: "note", note: { kind: "grounding", chars: 11343, fields: 18 } },
  { type: "note", note: { kind: "field", field: "overview", chars: 282, generated: true } },
];

function renderConsole(stage: "fetch" | "generate", stream = events, elapsedMs = 72_000) {
  return render(
    <I18nProvider>
      <IntakeRunConsole
        stage={stage}
        events={stream}
        elapsedMs={elapsedMs}
        caption="Reading the repository."
      />
    </I18nProvider>,
  );
}

describe("IntakeRunConsole", () => {
  it("logs the measurements the stream reported", () => {
    renderConsole("generate");

    expect(screen.getByText(/example\/project/)).toBeInTheDocument();
    expect(screen.getByText("TypeScript · 5 topics")).toBeInTheDocument();
    expect(screen.getByText("README read — 11,343 characters")).toBeInTheDocument();
    expect(screen.getByText("16 README sections mapped to fields")).toBeInTheDocument();
    // A real heading from the README, rendered verbatim.
    expect(screen.getByText("Configuring CORS")).toBeInTheDocument();
    // List fields report entries, text fields report characters.
    expect(screen.getByText("Stack — 5 entries")).toBeInTheDocument();
    expect(screen.getByText("Overview — 282 characters")).toBeInTheDocument();
    // The model tag is never published — the line names "the model" instead.
    expect(screen.getByText("11,343 README characters sent to the model")).toBeInTheDocument();
    expect(screen.getByText("Fetch · 520 ms")).toBeInTheDocument();
  });

  it("keeps the elapsed counter and the stage hint moving while the model works", () => {
    renderConsole("generate");

    expect(screen.getByText("72 s")).toBeInTheDocument();
    // The hint explains how the running stage works — it never claims progress.
    expect(
      screen.getByText("The model sees the README and the repository metadata, and nothing else."),
    ).toBeInTheDocument();
  });

  it("renders an empty log before the first event arrives", () => {
    renderConsole("fetch", [], 0);

    expect(screen.getByText("Run log")).toBeInTheDocument();
    expect(screen.getByRole("log").textContent).toBe("");
  });
});
