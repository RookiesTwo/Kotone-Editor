import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_EDITOR_LOCALE,
  EDITOR_LOCALE_STORAGE_KEY,
} from "../i18n/editor-locale";
import {
  EditorLocaleProvider,
  useEditorLocale,
} from "./EditorLocaleContext";

function LocaleProbe() {
  const { locale, setLocale, messages } = useEditorLocale();

  return (
    <div>
      <span>{locale}</span>
      <span>{messages.header.title}</span>
      <button type="button" onClick={() => setLocale("en")}>
        switch-en
      </button>
    </div>
  );
}

describe("EditorLocaleContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses zh-CN as the default locale", () => {
    render(
      <EditorLocaleProvider>
        <LocaleProbe />
      </EditorLocaleProvider>,
    );

    expect(screen.getByText(DEFAULT_EDITOR_LOCALE)).toBeInTheDocument();
    expect(screen.getByText("编辑器")).toBeInTheDocument();
  });

  it("switches locale and persists it", () => {
    render(
      <EditorLocaleProvider>
        <LocaleProbe />
      </EditorLocaleProvider>,
    );

    fireEvent.click(screen.getByText("switch-en"));

    expect(screen.getByText("en")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(localStorage.getItem(EDITOR_LOCALE_STORAGE_KEY)).toBe("en");
  });

  it("restores a saved locale and falls back on invalid values", () => {
    localStorage.setItem(EDITOR_LOCALE_STORAGE_KEY, "en");

    const { unmount } = render(
      <EditorLocaleProvider>
        <LocaleProbe />
      </EditorLocaleProvider>,
    );

    expect(screen.getByText("en")).toBeInTheDocument();
    unmount();

    localStorage.setItem(EDITOR_LOCALE_STORAGE_KEY, "fr");

    render(
      <EditorLocaleProvider>
        <LocaleProbe />
      </EditorLocaleProvider>,
    );

    expect(screen.getByText("zh-CN")).toBeInTheDocument();
  });
});
