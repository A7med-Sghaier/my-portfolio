import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  MetricCard,
  PageState,
  SectionHeading,
} from ".";

describe("Button", () => {
  it("defaults to a non-submitting button", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("composes with a consumer-owned link", () => {
    render(
      <Button asChild variant="outline">
        <a href="/projects">Projects</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
  });
});

describe("PageState", () => {
  it("announces loading without exposing an error role", () => {
    render(<PageState kind="loading" title="Loading projects" />);
    const section = screen.getByText("Loading projects").closest("section");
    expect(section).toHaveAttribute("aria-busy", "true");
  });

  it("renders a recoverable error action", () => {
    render(<PageState kind="error" title="Projects unavailable" action={<Button>Retry</Button>} />);
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
  });

  it("defaults to an empty state and accepts a rendered icon", () => {
    render(<PageState icon={<svg aria-label="Custom state icon" />} title="Nothing here yet" />);
    expect(screen.getByText("Nothing here yet")).toBeVisible();
    expect(screen.getByLabelText("Custom state icon")).toBeInTheDocument();
  });
});

describe("consumer-facing composition", () => {
  it("supports visible compact alerts and compatibility copy aliases", () => {
    render(
      <>
        <Alert title="Your data is safe">Retry when the API is available.</Alert>
        <SectionHeading title="Selected work" intro="Verified case studies." />
        <MetricCard label="Projects" value={12} detail="Across three sectors" />
      </>,
    );

    expect(screen.getByText("Your data is safe")).toBeVisible();
    expect(screen.getByText("Verified case studies.")).toBeVisible();
    expect(screen.getByText("Across three sectors")).toBeVisible();
  });
});

describe("Dialog", () => {
  it("opens from its trigger and exposes an accessible title", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open editor</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Change verified project content.</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open editor" }));
    expect(screen.getByRole("dialog", { name: "Edit project" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
  });
});
