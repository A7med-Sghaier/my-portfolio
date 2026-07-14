import { beforeEach, describe, expect, it } from "vitest";
import { applyDarkTheme, initialDarkTheme, THEME_STORAGE_KEY } from "./app-shell";

const storedValues = new Map<string, string>();
const storage: Storage = {
  get length() {
    return storedValues.size;
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => [...storedValues.keys()][index] ?? null,
  removeItem: (key) => storedValues.delete(key),
  setItem: (key, value) => storedValues.set(key, value),
};
Object.defineProperty(window, "localStorage", { configurable: true, value: storage });

describe("portfolio theme preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  });

  it("restores a saved light preference before rendering the shell", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    expect(initialDarkTheme()).toBe(false);
    expect(document.documentElement).not.toHaveClass("dark");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("persists a theme change", () => {
    applyDarkTheme(false, true);

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
