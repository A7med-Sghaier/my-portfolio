import { describe, expect, it } from "vitest";
import { localizedPath } from "./locale";

describe("localizedPath", () => {
  it("preserves filters and anchors while replacing the locale", () => {
    expect(localizedPath("/projects?filter=data&lang=de#results", "ar")).toBe(
      "/projects?filter=data&lang=ar#results",
    );
    expect(localizedPath("/about?lang=fr#journey", "en")).toBe("/about#journey");
  });
});
