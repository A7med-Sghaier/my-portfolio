import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  I18nProvider,
  LANGS,
  assertDictionaryParity,
  dirFor,
  interpolate,
  messages,
  setMessageOverrides,
  translate,
  useI18n,
} from ".";
import { act } from "react";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  delete document.documentElement.dataset.lang;
  setMessageOverrides({});
});

describe("dictionary contract", () => {
  it("keeps every locale in exact key parity with English", () => {
    expect(() => assertDictionaryParity()).not.toThrow();
    const englishKeys = Object.keys(messages.en).sort();

    for (const { code } of LANGS) {
      expect(Object.keys(messages[code]).sort()).toEqual(englishKeys);
    }
    expect(englishKeys).toHaveLength(940);
  });

  it("rejects missing and extra external dictionary keys", () => {
    const invalid = {
      ...messages,
      de: { ...messages.de, unexpected: "Wert" },
    };
    expect(() => assertDictionaryParity(invalid)).toThrow(/Extra: unexpected/);
  });

  it("maps Arabic to RTL and all other supported languages to LTR", () => {
    expect(dirFor("ar")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
    expect(dirFor("de")).toBe("ltr");
    expect(dirFor("fr")).toBe("ltr");
  });
});

describe("translation", () => {
  it("interpolates repeated values and leaves unknown placeholders visible", () => {
    expect(interpolate("{name}: {count} / {count} / {missing}", { name: "Ahmed", count: 2 })).toBe(
      "Ahmed: 2 / 2 / {missing}",
    );
  });

  it("translates a shared key in each locale", () => {
    expect(translate("en", "nav.contact")).toBe("Contact");
    expect(translate("de", "nav.contact")).toBe("Kontakt");
    expect(translate("fr", "nav.contact")).toBe("Contact");
    expect(translate("ar", "nav.contact")).toBe("تواصل");
  });
});

function Harness() {
  const { lang, direction, setLang, t, formatNumber } = useI18n();
  return (
    <div>
      <output data-testid="state">
        {lang}:{direction}:{t("nav.about")}
      </output>
      <output data-testid="number">{formatNumber(1234)}</output>
      <button type="button" onClick={() => setLang("ar")}>
        Arabic
      </button>
    </div>
  );
}

describe("I18nProvider", () => {
  it("applies language and direction to the document and persists changes", async () => {
    const { unmount } = render(
      <I18nProvider initialLanguage="de" storageKey="test.lang">
        <Harness />
      </I18nProvider>,
    );

    expect(screen.getByTestId("state")).toHaveTextContent("de:ltr:Über mich");
    expect(document.documentElement).toHaveAttribute("lang", "de");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");

    fireEvent.click(screen.getByRole("button", { name: "Arabic" }));

    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("ar:rtl:");
      expect(document.documentElement).toHaveAttribute("lang", "ar");
      expect(document.documentElement).toHaveAttribute("dir", "rtl");
      expect(document.documentElement).toHaveAttribute("data-lang", "ar");
      expect(window.localStorage.getItem("test.lang")).toBe("ar");
    });

    expect(screen.getByTestId("number").textContent).toMatch(/[١٢٣٤]/);
    unmount();
  });

  it("uses a valid persisted language and ignores an invalid one", () => {
    window.localStorage.setItem("test.lang", "fr");
    const { unmount } = render(
      <I18nProvider initialLanguage="en" storageKey="test.lang">
        <Harness />
      </I18nProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("fr:ltr:À propos");
    unmount();

    window.localStorage.setItem("test.lang", "xx");
    render(
      <I18nProvider initialLanguage="en" storageKey="test.lang">
        <Harness />
      </I18nProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("en:ltr:About");
  });
});

describe("message overrides", () => {
  it("prefers an override, then the bundled locale, then bundled English", () => {
    setMessageOverrides({ de: { "nav.contact": "Schreib mir" } });
    expect(translate("de", "nav.contact")).toBe("Schreib mir");
    expect(translate("de", "nav.about")).toBe("Über mich");
    expect(translate("fr", "nav.contact")).toBe("Contact");
    setMessageOverrides({});
    expect(translate("de", "nav.contact")).toBe("Kontakt");
  });

  it("interpolates values inside overridden templates", () => {
    setMessageOverrides({ en: { "nav.contact": "Contact {name}" } });
    expect(translate("en", "nav.contact", { name: "Ahmed" })).toBe("Contact Ahmed");
  });

  it("re-renders provider consumers when overrides change at runtime", async () => {
    render(
      <I18nProvider initialLanguage="en" storageKey="test.lang">
        <Harness />
      </I18nProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("en:ltr:About");

    act(() => setMessageOverrides({ en: { "nav.about": "Story" } }));
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("en:ltr:Story"));
  });
});
