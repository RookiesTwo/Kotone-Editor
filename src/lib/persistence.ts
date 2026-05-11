import type { SiteConfig } from "../types/site-config";
import { normalizeSiteConfig } from "./config-utils";

export const STORAGE_KEY = "editable-showcase.site-config";

export function loadStoredConfig(fallback: SiteConfig): SiteConfig {
  let raw: string | null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return fallback;
  }

  if (!raw) {
    return fallback;
  }

  try {
    return normalizeSiteConfig(JSON.parse(raw));
  } catch {
    return fallback;
  }
}

export function saveStoredConfig(config: SiteConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config, null, 2));
  } catch {
    // Ignore storage write failures in restricted environments.
  }
}

export function clearStoredConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage removal failures in restricted environments.
  }
}

export function serializeConfig(config: SiteConfig): string {
  return JSON.stringify(config, null, 2);
}

export function parseImportedConfig(text: string): SiteConfig {
  return normalizeSiteConfig(JSON.parse(text));
}
