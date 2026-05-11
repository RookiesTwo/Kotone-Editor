import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultSiteConfig } from "../data/default-config";
import { clearStoredConfig, loadStoredConfig, parseImportedConfig, saveStoredConfig, STORAGE_KEY } from "./persistence";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and reloads config through localStorage", () => {
    const config = createDefaultSiteConfig();
    config.global.siteTitle = "Saved Title";

    saveStoredConfig(config);
    const loaded = loadStoredConfig(createDefaultSiteConfig());

    expect(localStorage.getItem(STORAGE_KEY)).toContain("Saved Title");
    expect(loaded.global.siteTitle).toBe("Saved Title");
  });

  it("falls back when localStorage data is invalid", () => {
    localStorage.setItem(STORAGE_KEY, "{not json}");

    const loaded = loadStoredConfig(createDefaultSiteConfig());
    expect(loaded.global.siteTitle).toBe(createDefaultSiteConfig().global.siteTitle);
  });

  it("parses imported JSON and normalizes it", () => {
    const loaded = parseImportedConfig('{"global":{"siteTitle":"Imported"},"sections":[]}');
    expect(loaded.global.siteTitle).toBe("Imported");
    expect(loaded.sections.length).toBeGreaterThan(0);
  });

  it("returns fallback when localStorage.getItem throws", () => {
    const fallback = createDefaultSiteConfig();
    fallback.global.siteTitle = "Fallback Title";

    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: access denied");
    });

    const loaded = loadStoredConfig(fallback);

    expect(loaded.global.siteTitle).toBe("Fallback Title");

    getItemSpy.mockRestore();
  });

  it("does not throw when localStorage.setItem throws", () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError: access denied");
    });

    const config = createDefaultSiteConfig();
    expect(() => saveStoredConfig(config)).not.toThrow();

    setItemSpy.mockRestore();
  });

  it("does not throw when localStorage.removeItem throws", () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError: access denied");
    });

    expect(() => clearStoredConfig()).not.toThrow();

    removeItemSpy.mockRestore();
  });
});
