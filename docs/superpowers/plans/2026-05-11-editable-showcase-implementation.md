# Editable Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Pages-ready React + TypeScript frontend with a scroll-driven showcase page and a live-preview editor page backed by `localStorage` and JSON import/export.

**Architecture:** Use a single `SiteConfig` model shared by the renderer, editor, persistence layer, and import/export logic. Use `createHashRouter` for reliable static hosting on GitHub Pages, and keep section transitions CSS-driven so the visual effect stays polished without adding a heavy animation runtime.

**Tech Stack:** Vite, React, TypeScript, React Router, Vitest, Testing Library, plain CSS

---

## Context Notes

- The workspace is currently empty.
- The workspace is currently not a git repository, so commit steps are intentionally omitted from this plan.
- The production base path below assumes the repository name remains `Website-FullAIwork`. If the GitHub repository name changes before deployment, update the `base` field in `vite.config.ts` during execution.

## File Structure And Responsibilities

- `package.json`: scripts and dependencies
- `vite.config.ts`: Vite config, GitHub Pages base path, Vitest config
- `public/assets/*.svg`: bundled example visual assets for the demo theme
- `src/main.tsx`: app bootstrap
- `src/App.tsx`: hash router definition
- `src/index.css`: global, showcase, and editor styling
- `src/types/site-config.ts`: shared application types
- `src/data/default-config.ts`: bundled example site configuration
- `src/lib/config-utils.ts`: section defaults and runtime normalization
- `src/lib/persistence.ts`: `localStorage` and JSON import/export helpers
- `src/lib/config-utils.test.ts`: unit tests for normalization and section creation
- `src/lib/persistence.test.ts`: unit tests for persistence helpers
- `src/context/SiteConfigContext.tsx`: shared state and mutation API
- `src/hooks/useActiveSection.ts`: active-section tracking for scroll transitions
- `src/components/ShowcaseCanvas.tsx`: reusable renderer used by both the public page and editor preview
- `src/components/ShowcaseCanvas.test.tsx`: component smoke test for the renderer
- `src/pages/ShowcasePage.tsx`: public landing page route
- `src/pages/EditorPage.tsx`: editor route with live preview and import/export controls
- `src/test/setup.ts`: Testing Library setup

### Task 1: Bootstrap The App And Tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/index.css`, `src/test/setup.ts`, `vite.config.ts`
- Modify: generated scaffold files in project root and `src/`

- [ ] **Step 1: Scaffold the Vite React TypeScript app in the current directory**

Run:

```bash
npm create vite@latest . -- --template react-ts
```

Expected: Vite creates the React TypeScript starter in the current folder.

- [ ] **Step 2: Install runtime and test dependencies**

Run:

```bash
npm install react-router-dom
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `node_modules` installs successfully with no missing peer dependency errors.

- [ ] **Step 3: Replace `vite.config.ts` with GitHub Pages and Vitest support**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/Website-FullAIwork/" : "/",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
```

- [ ] **Step 4: Replace `src/test/setup.ts` with Testing Library setup**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Replace the scaffolded `src/index.css` with a minimal reset so later tasks have a clean base**

```css
:root {
  color-scheme: dark;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #f5f7ff;
  background: #090611;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  min-width: 320px;
}

button,
input,
textarea,
select {
  font: inherit;
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 6: Add a `test` script to `package.json`**

Replace the `scripts` block with:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 7: Run the build once to verify the scaffold is healthy before feature work starts**

Run:

```bash
npm run build
```

Expected: `vite build` finishes successfully and creates `dist/`.

### Task 2: Define The Shared Model And Default Example Data

**Files:**
- Create: `src/types/site-config.ts`, `src/data/default-config.ts`, `public/assets/hero-panel.svg`, `public/assets/profile-panel.svg`, `public/assets/gallery-panel-a.svg`, `public/assets/gallery-panel-b.svg`

- [ ] **Step 1: Create the shared type model in `src/types/site-config.ts`**

```ts
export type SectionType = "hero" | "profile" | "gallery" | "quote" | "custom";
export type FontPreset = "display" | "modern" | "editorial";
export type MotionPreset = "soft" | "medium" | "bold";
export type AlignMode = "start" | "center" | "end";
export type DensityMode = "compact" | "full" | "tall";
export type TransitionStyle = "fade" | "lift" | "glow";
export type ImageKind = "remote" | "local";

export interface ImageAsset {
  src: string;
  alt: string;
  kind: ImageKind;
}

export interface GlobalLink {
  label: string;
  href: string;
}

export interface GlobalConfig {
  siteTitle: string;
  siteSubtitle: string;
  accent: string;
  accentSoft: string;
  backgroundStart: string;
  backgroundEnd: string;
  fontPreset: FontPreset;
  motionPreset: MotionPreset;
  showNav: boolean;
  showFooter: boolean;
  links: GlobalLink[];
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  visible: boolean;
  title: string;
  description: string;
  quote: string;
  tags: string[];
  image: ImageAsset | null;
  secondaryImage: ImageAsset | null;
  galleryItems: ImageAsset[];
  background: string;
  backgroundAccent: string;
  overlayOpacity: number;
  align: AlignMode;
  density: DensityMode;
  buttonLabel: string;
  buttonHref: string;
  transitionStyle: TransitionStyle;
}

export interface SiteConfig {
  global: GlobalConfig;
  sections: SectionConfig[];
}
```

- [ ] **Step 2: Create the bundled SVG assets for the sample theme**

Create `public/assets/hero-panel.svg`:

```svg
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1600" height="900" fill="#13091F"/>
  <rect x="980" y="80" width="420" height="740" rx="36" fill="url(#heroGradient)"/>
  <circle cx="1180" cy="290" r="180" fill="#FF6AC2" fill-opacity="0.35"/>
  <path d="M180 670C320 430 520 280 760 250" stroke="#FFD34D" stroke-width="18" stroke-linecap="round"/>
  <path d="M220 760C420 520 650 390 910 370" stroke="#6BE3FF" stroke-width="10" stroke-linecap="round"/>
  <defs>
    <linearGradient id="heroGradient" x1="980" y1="80" x2="1400" y2="820" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FF8A00"/>
      <stop offset="0.45" stop-color="#FF4FB0"/>
      <stop offset="1" stop-color="#6A5BFF"/>
    </linearGradient>
  </defs>
</svg>
```

Create `public/assets/profile-panel.svg`:

```svg
<svg width="1200" height="1400" viewBox="0 0 1200 1400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="1400" rx="40" fill="#1A1030"/>
  <circle cx="610" cy="430" r="250" fill="#FF4FB0" fill-opacity="0.28"/>
  <rect x="280" y="160" width="620" height="1040" rx="32" fill="url(#profileGradient)"/>
  <path d="M350 1040C500 930 700 910 840 980" stroke="#FFF3A1" stroke-width="14" stroke-linecap="round"/>
  <defs>
    <linearGradient id="profileGradient" x1="280" y1="160" x2="900" y2="1200" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFB36B"/>
      <stop offset="0.55" stop-color="#FF5CA8"/>
      <stop offset="1" stop-color="#6D7DFF"/>
    </linearGradient>
  </defs>
</svg>
```

Create `public/assets/gallery-panel-a.svg`:

```svg
<svg width="1200" height="900" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="900" rx="36" fill="#161029"/>
  <rect x="120" y="120" width="420" height="660" rx="28" fill="#FF6DA8"/>
  <rect x="620" y="180" width="460" height="540" rx="28" fill="#FFD34D"/>
  <circle cx="860" cy="250" r="110" fill="#FFF5B0" fill-opacity="0.45"/>
</svg>
```

Create `public/assets/gallery-panel-b.svg`:

```svg
<svg width="1200" height="900" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="900" rx="36" fill="#120C21"/>
  <circle cx="330" cy="280" r="160" fill="#6BE3FF" fill-opacity="0.5"/>
  <rect x="220" y="170" width="760" height="560" rx="32" fill="url(#galleryGradient)"/>
  <defs>
    <linearGradient id="galleryGradient" x1="220" y1="170" x2="980" y2="730" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5328FF"/>
      <stop offset="0.6" stop-color="#FF4FB0"/>
      <stop offset="1" stop-color="#FFB36B"/>
    </linearGradient>
  </defs>
</svg>
```

- [ ] **Step 3: Create the bundled example config in `src/data/default-config.ts`**

```ts
import type { SiteConfig } from "../types/site-config";

export function createDefaultSiteConfig(): SiteConfig {
  return {
    global: {
      siteTitle: "LUMINOUS ECHO",
      siteSubtitle: "A configurable showcase template for character art, mood, and motion.",
      accent: "#ff6aa2",
      accentSoft: "#ffd36a",
      backgroundStart: "#0c0716",
      backgroundEnd: "#24113d",
      fontPreset: "display",
      motionPreset: "medium",
      showNav: true,
      showFooter: true,
      links: [
        { label: "Editor", href: "#/editor" },
        { label: "GitHub", href: "https://github.com/" },
      ],
    },
    sections: [
      {
        id: "hero-01",
        type: "hero",
        visible: true,
        title: "Neon Reverie",
        description: "A one-page stage for poster-grade character visuals and dramatic scrolling transitions.",
        quote: "",
        tags: ["showcase", "landing page", "editable"],
        image: { src: "/assets/hero-panel.svg", alt: "Hero key visual", kind: "local" },
        secondaryImage: null,
        galleryItems: [],
        background: "linear-gradient(145deg, #090611 0%, #231033 100%)",
        backgroundAccent: "#ff6aa2",
        overlayOpacity: 0.36,
        align: "start",
        density: "full",
        buttonLabel: "Open Editor",
        buttonHref: "#/editor",
        transitionStyle: "glow",
      },
      {
        id: "profile-01",
        type: "profile",
        visible: true,
        title: "Designed For Character-First Storytelling",
        description: "Swap in your own illustrations, colors, and mood while keeping the pacing and structure of a modern campaign page.",
        quote: "",
        tags: ["TypeScript", "GitHub Pages", "AI agent"],
        image: { src: "/assets/profile-panel.svg", alt: "Profile visual", kind: "local" },
        secondaryImage: null,
        galleryItems: [],
        background: "linear-gradient(140deg, #13091f 0%, #35124e 100%)",
        backgroundAccent: "#ffd36a",
        overlayOpacity: 0.28,
        align: "center",
        density: "tall",
        buttonLabel: "",
        buttonHref: "",
        transitionStyle: "lift",
      },
      {
        id: "gallery-01",
        type: "gallery",
        visible: true,
        title: "Gallery Frames",
        description: "Use this section to present featured artwork, alternate costumes, or key visual moods.",
        quote: "",
        tags: ["artwork", "frames", "motion"],
        image: null,
        secondaryImage: null,
        galleryItems: [
          { src: "/assets/gallery-panel-a.svg", alt: "Gallery panel A", kind: "local" },
          { src: "/assets/gallery-panel-b.svg", alt: "Gallery panel B", kind: "local" },
        ],
        background: "linear-gradient(140deg, #1a1030 0%, #44195f 100%)",
        backgroundAccent: "#6be3ff",
        overlayOpacity: 0.22,
        align: "center",
        density: "full",
        buttonLabel: "",
        buttonHref: "",
        transitionStyle: "fade",
      },
      {
        id: "quote-01",
        type: "quote",
        visible: true,
        title: "",
        description: "",
        quote: "Build the frame once, then rewrite the whole mood from the editor.",
        tags: ["reusable", "config driven"],
        image: null,
        secondaryImage: null,
        galleryItems: [],
        background: "linear-gradient(140deg, #0d0718 0%, #29143b 100%)",
        backgroundAccent: "#ffb36b",
        overlayOpacity: 0.18,
        align: "center",
        density: "compact",
        buttonLabel: "",
        buttonHref: "",
        transitionStyle: "glow",
      },
    ],
  };
}
```

- [ ] **Step 4: Run the build again to catch any type or import mistakes immediately**

Run:

```bash
npm run build
```

Expected: build succeeds with the new type and data files present.

### Task 3: Add Runtime Normalization And Persistence With Tests

**Files:**
- Create: `src/lib/config-utils.ts`, `src/lib/persistence.ts`, `src/lib/config-utils.test.ts`, `src/lib/persistence.test.ts`

- [ ] **Step 1: Write the failing normalization tests in `src/lib/config-utils.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { createSection, normalizeSiteConfig } from "./config-utils";

describe("config-utils", () => {
  it("creates a section with safe defaults", () => {
    const section = createSection("hero");

    expect(section.type).toBe("hero");
    expect(section.visible).toBe(true);
    expect(section.title).toBe("New Section");
    expect(section.galleryItems).toEqual([]);
  });

  it("normalizes partial imported data", () => {
    const config = normalizeSiteConfig({
      global: {
        siteTitle: "Imported",
      },
      sections: [
        {
          id: "x",
          type: "quote",
          quote: "hello",
        },
      ],
    });

    expect(config.global.siteTitle).toBe("Imported");
    expect(config.global.motionPreset).toBe("medium");
    expect(config.sections[0].quote).toBe("hello");
    expect(config.sections[0].visible).toBe(true);
  });

  it("drops invalid section types back to custom", () => {
    const config = normalizeSiteConfig({
      sections: [{ id: "bad", type: "unknown" }],
    });

    expect(config.sections[0].type).toBe("custom");
  });
});
```

- [ ] **Step 2: Write the failing persistence tests in `src/lib/persistence.test.ts`**

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { createDefaultSiteConfig } from "../data/default-config";
import { loadStoredConfig, parseImportedConfig, saveStoredConfig, STORAGE_KEY } from "./persistence";

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
});
```

- [ ] **Step 3: Run the tests to verify they fail before implementation**

Run:

```bash
npm run test -- src/lib/config-utils.test.ts src/lib/persistence.test.ts
```

Expected: FAIL with module-not-found or missing export errors.

- [ ] **Step 4: Implement the runtime model helpers in `src/lib/config-utils.ts`**

```ts
import { createDefaultSiteConfig } from "../data/default-config";
import type {
  AlignMode,
  DensityMode,
  FontPreset,
  GlobalConfig,
  ImageAsset,
  MotionPreset,
  SectionConfig,
  SectionType,
  SiteConfig,
  TransitionStyle,
} from "../types/site-config";

const sectionTypes: SectionType[] = ["hero", "profile", "gallery", "quote", "custom"];
const fontPresets: FontPreset[] = ["display", "modern", "editorial"];
const motionPresets: MotionPreset[] = ["soft", "medium", "bold"];
const alignModes: AlignMode[] = ["start", "center", "end"];
const densityModes: DensityMode[] = ["compact", "full", "tall"];
const transitionStyles: TransitionStyle[] = ["fade", "lift", "glow"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickEnum<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function pickString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeImageAsset(value: unknown): ImageAsset | null {
  if (!isRecord(value)) {
    return null;
  }

  const src = pickString(value.src);
  if (!src) {
    return null;
  }

  return {
    src,
    alt: pickString(value.alt, "Image"),
    kind: value.kind === "remote" ? "remote" : "local",
  };
}

function normalizeGlobalConfig(value: unknown, fallback: GlobalConfig): GlobalConfig {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    siteTitle: pickString(value.siteTitle, fallback.siteTitle),
    siteSubtitle: pickString(value.siteSubtitle, fallback.siteSubtitle),
    accent: pickString(value.accent, fallback.accent),
    accentSoft: pickString(value.accentSoft, fallback.accentSoft),
    backgroundStart: pickString(value.backgroundStart, fallback.backgroundStart),
    backgroundEnd: pickString(value.backgroundEnd, fallback.backgroundEnd),
    fontPreset: pickEnum(value.fontPreset, fontPresets, fallback.fontPreset),
    motionPreset: pickEnum(value.motionPreset, motionPresets, fallback.motionPreset),
    showNav: pickBoolean(value.showNav, fallback.showNav),
    showFooter: pickBoolean(value.showFooter, fallback.showFooter),
    links: Array.isArray(value.links)
      ? value.links
          .filter(isRecord)
          .map((link) => ({
            label: pickString(link.label, "Link"),
            href: pickString(link.href, "#"),
          }))
      : fallback.links,
  };
}

export function createSection(type: SectionType = "custom"): SectionConfig {
  return {
    id: `section-${crypto.randomUUID()}`,
    type,
    visible: true,
    title: "New Section",
    description: "Describe the visual focus of this section.",
    quote: "",
    tags: [],
    image: null,
    secondaryImage: null,
    galleryItems: [],
    background: "linear-gradient(140deg, #12091f 0%, #2d1343 100%)",
    backgroundAccent: "#ff6aa2",
    overlayOpacity: 0.2,
    align: "center",
    density: "full",
    buttonLabel: "",
    buttonHref: "",
    transitionStyle: "fade",
  };
}

function normalizeSection(value: unknown): SectionConfig {
  const fallback = createSection("custom");
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    id: pickString(value.id, fallback.id),
    type: pickEnum(value.type, sectionTypes, "custom"),
    visible: pickBoolean(value.visible, true),
    title: pickString(value.title, fallback.title),
    description: pickString(value.description, fallback.description),
    quote: pickString(value.quote, ""),
    tags: Array.isArray(value.tags) ? value.tags.filter((item): item is string => typeof item === "string") : [],
    image: normalizeImageAsset(value.image),
    secondaryImage: normalizeImageAsset(value.secondaryImage),
    galleryItems: Array.isArray(value.galleryItems)
      ? value.galleryItems.map(normalizeImageAsset).filter((item): item is ImageAsset => item !== null)
      : [],
    background: pickString(value.background, fallback.background),
    backgroundAccent: pickString(value.backgroundAccent, fallback.backgroundAccent),
    overlayOpacity: Math.max(0, Math.min(0.75, pickNumber(value.overlayOpacity, fallback.overlayOpacity))),
    align: pickEnum(value.align, alignModes, fallback.align),
    density: pickEnum(value.density, densityModes, fallback.density),
    buttonLabel: pickString(value.buttonLabel, ""),
    buttonHref: pickString(value.buttonHref, ""),
    transitionStyle: pickEnum(value.transitionStyle, transitionStyles, fallback.transitionStyle),
  };
}

export function normalizeSiteConfig(value: unknown): SiteConfig {
  const fallback = createDefaultSiteConfig();
  const record = isRecord(value) ? value : {};

  const sections = Array.isArray(record.sections)
    ? record.sections.map(normalizeSection)
    : fallback.sections;

  return {
    global: normalizeGlobalConfig(record.global, fallback.global),
    sections: sections.length > 0 ? sections : fallback.sections,
  };
}
```

- [ ] **Step 5: Implement persistence helpers in `src/lib/persistence.ts`**

```ts
import type { SiteConfig } from "../types/site-config";
import { normalizeSiteConfig } from "./config-utils";

export const STORAGE_KEY = "editable-showcase.site-config";

export function loadStoredConfig(fallback: SiteConfig): SiteConfig {
  const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config, null, 2));
}

export function clearStoredConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function serializeConfig(config: SiteConfig): string {
  return JSON.stringify(config, null, 2);
}

export function parseImportedConfig(text: string): SiteConfig {
  return normalizeSiteConfig(JSON.parse(text));
}
```

- [ ] **Step 6: Run the tests to verify the utilities now pass**

Run:

```bash
npm run test -- src/lib/config-utils.test.ts src/lib/persistence.test.ts
```

Expected: PASS for all utility tests.

### Task 4: Wire Shared State And Routing

**Files:**
- Create: `src/context/SiteConfigContext.tsx`, `src/App.tsx`, `src/pages/ShowcasePage.tsx`, `src/pages/EditorPage.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create the shared config provider in `src/context/SiteConfigContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createDefaultSiteConfig } from "../data/default-config";
import { createSection, normalizeSiteConfig } from "../lib/config-utils";
import { clearStoredConfig, loadStoredConfig, saveStoredConfig } from "../lib/persistence";
import type { GlobalConfig, SectionConfig, SectionType, SiteConfig } from "../types/site-config";

interface SiteConfigContextValue {
  config: SiteConfig;
  selectedSectionId: string;
  setSelectedSectionId: (id: string) => void;
  updateGlobal: (patch: Partial<GlobalConfig>) => void;
  updateSection: (id: string, patch: Partial<SectionConfig>) => void;
  addSection: (type: SectionType) => void;
  deleteSection: (id: string) => void;
  moveSection: (id: string, direction: -1 | 1) => void;
  replaceConfig: (next: SiteConfig) => void;
  resetConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const fallback = createDefaultSiteConfig();
  const [config, setConfig] = useState<SiteConfig>(() => loadStoredConfig(fallback));
  const [selectedSectionId, setSelectedSectionId] = useState(config.sections[0]?.id ?? "");

  useEffect(() => {
    saveStoredConfig(config);
    if (!config.sections.find((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(config.sections[0]?.id ?? "");
    }
  }, [config, selectedSectionId]);

  function updateGlobal(patch: Partial<GlobalConfig>) {
    setConfig((current) => ({ ...current, global: { ...current.global, ...patch } }));
  }

  function updateSection(id: string, patch: Partial<SectionConfig>) {
    setConfig((current) => ({
      ...current,
      sections: current.sections.map((section) => (section.id === id ? { ...section, ...patch } : section)),
    }));
  }

  function addSection(type: SectionType) {
    const next = createSection(type);
    setConfig((current) => ({ ...current, sections: [...current.sections, next] }));
    setSelectedSectionId(next.id);
  }

  function deleteSection(id: string) {
    setConfig((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== id),
    }));
  }

  function moveSection(id: string, direction: -1 | 1) {
    setConfig((current) => {
      const index = current.sections.findIndex((section) => section.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.sections.length) {
        return current;
      }

      const nextSections = [...current.sections];
      const [moved] = nextSections.splice(index, 1);
      nextSections.splice(target, 0, moved);
      return { ...current, sections: nextSections };
    });
  }

  function replaceConfig(next: SiteConfig) {
    setConfig(normalizeSiteConfig(next));
  }

  function resetConfig() {
    clearStoredConfig();
    const next = createDefaultSiteConfig();
    setConfig(next);
    setSelectedSectionId(next.sections[0]?.id ?? "");
  }

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        selectedSectionId,
        setSelectedSectionId,
        updateGlobal,
        updateSection,
        addSection,
        deleteSection,
        moveSection,
        replaceConfig,
        resetConfig,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used inside SiteConfigProvider");
  }

  return context;
}
```

- [ ] **Step 2: Create route stubs in `src/pages/ShowcasePage.tsx` and `src/pages/EditorPage.tsx`**

Create `src/pages/ShowcasePage.tsx`:

```tsx
export function ShowcasePage() {
  return <main>Showcase page pending renderer task.</main>;
}
```

Create `src/pages/EditorPage.tsx`:

```tsx
export function EditorPage() {
  return <main>Editor page pending editor task.</main>;
}
```

- [ ] **Step 3: Replace `src/App.tsx` with hash-based routing**

```tsx
import { createHashRouter, RouterProvider } from "react-router-dom";
import { SiteConfigProvider } from "./context/SiteConfigContext";
import { EditorPage } from "./pages/EditorPage";
import { ShowcasePage } from "./pages/ShowcasePage";

const router = createHashRouter([
  { path: "/", element: <ShowcasePage /> },
  { path: "/editor", element: <EditorPage /> },
]);

export default function App() {
  return (
    <SiteConfigProvider>
      <RouterProvider router={router} />
    </SiteConfigProvider>
  );
}
```

- [ ] **Step 4: Replace `src/main.tsx` with the production entrypoint**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 5: Run the build to confirm routing and provider wiring compile cleanly**

Run:

```bash
npm run build
```

Expected: build succeeds with the placeholder routes.

### Task 5: Build The Reusable Showcase Renderer And Scroll State

**Files:**
- Create: `src/hooks/useActiveSection.ts`, `src/components/ShowcaseCanvas.tsx`, `src/components/ShowcaseCanvas.test.tsx`
- Modify: `src/pages/ShowcasePage.tsx`

- [ ] **Step 1: Write a failing renderer smoke test in `src/components/ShowcaseCanvas.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDefaultSiteConfig } from "../data/default-config";
import { ShowcaseCanvas } from "./ShowcaseCanvas";

describe("ShowcaseCanvas", () => {
  it("renders the first visible hero section", () => {
    render(<ShowcaseCanvas config={createDefaultSiteConfig()} embedded />);

    expect(screen.getByText("Neon Reverie")).toBeInTheDocument();
    expect(screen.getByText(/Open Editor/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the renderer test to verify it fails before implementation**

Run:

```bash
npm run test -- src/components/ShowcaseCanvas.test.tsx
```

Expected: FAIL with missing component or missing export errors.

- [ ] **Step 3: Create the active-section hook in `src/hooks/useActiveSection.ts`**

```ts
import { useEffect, useState, type RefObject } from "react";

export function useActiveSection(sectionIds: string[], rootRef?: RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveId("");
      return;
    }

    const root = rootRef?.current ?? null;
    const nodes = Array.from((root ?? document).querySelectorAll<HTMLElement>("[data-section-id]"));
    if (nodes.length === 0) {
      setActiveId(sectionIds[0]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (best?.target instanceof HTMLElement) {
          setActiveId(best.target.dataset.sectionId ?? sectionIds[0]);
        }
      },
      {
        root,
        threshold: [0.35, 0.6, 0.85],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [rootRef, sectionIds]);

  return activeId;
}
```

- [ ] **Step 4: Implement the shared showcase renderer in `src/components/ShowcaseCanvas.tsx`**

```tsx
import { useRef } from "react";
import { useActiveSection } from "../hooks/useActiveSection";
import type { SectionConfig, SiteConfig } from "../types/site-config";

function renderSectionBody(section: SectionConfig) {
  if (section.type === "quote") {
    return <blockquote className="section-quote">{section.quote}</blockquote>;
  }

  if (section.type === "gallery") {
    return (
      <div className="gallery-grid">
        {section.galleryItems.map((item) => (
          <article key={item.src} className="gallery-card">
            <img src={item.src} alt={item.alt} />
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="section-copy">
      {section.description ? <p>{section.description}</p> : null}
      {section.image ? (
        <figure className="section-image-frame">
          <img src={section.image.src} alt={section.image.alt} />
        </figure>
      ) : null}
    </div>
  );
}

export function ShowcaseCanvas({ config, embedded = false }: { config: SiteConfig; embedded?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const visibleSections = config.sections.filter((section) => section.visible);
  const activeId = useActiveSection(
    visibleSections.map((section) => section.id),
    embedded ? scrollerRef : undefined,
  );

  const activeSection = visibleSections.find((section) => section.id === activeId) ?? visibleSections[0];

  return (
    <div
      ref={scrollerRef}
      className={`showcase-shell${embedded ? " showcase-shell--embedded" : ""}`}
      style={{
        background: activeSection?.background ?? config.global.backgroundStart,
        ["--accent" as string]: activeSection?.backgroundAccent ?? config.global.accent,
        ["--accent-soft" as string]: config.global.accentSoft,
        ["--overlay-opacity" as string]: String(activeSection?.overlayOpacity ?? 0.24),
      }}
    >
      <div className="showcase-backdrop" aria-hidden="true" />

      {config.global.showNav ? (
        <header className="showcase-nav">
          <span className="showcase-nav__brand">{config.global.siteTitle}</span>
          <nav className="showcase-nav__links">
            {config.global.links.map((link) => (
              <a key={`${link.label}-${link.href}`} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {link.label}
              </a>
            ))}
          </nav>
        </header>
      ) : null}

      <div className="showcase-sections">
        {visibleSections.map((section) => {
          const isActive = section.id === activeSection?.id;

          return (
            <section
              key={section.id}
              data-section-id={section.id}
              className={`showcase-section showcase-section--${section.align} showcase-section--${section.density} ${
                isActive ? "is-active" : "is-idle"
              } showcase-section--${section.transitionStyle}`}
            >
              <div className="showcase-section__inner">
                <div className="showcase-section__meta">
                  {section.tags.length > 0 ? (
                    <ul className="tag-row">
                      {section.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}

                  {section.title ? <h2>{section.title}</h2> : null}
                  {renderSectionBody(section)}

                  {section.buttonLabel && section.buttonHref ? (
                    <a className="showcase-button" href={section.buttonHref}>
                      {section.buttonLabel}
                    </a>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {config.global.showFooter ? <footer className="showcase-footer">Built as a pure frontend editable showcase.</footer> : null}
    </div>
  );
}
```

- [ ] **Step 5: Replace `src/pages/ShowcasePage.tsx` so the public route uses the shared renderer**

```tsx
import { ShowcaseCanvas } from "../components/ShowcaseCanvas";
import { useSiteConfig } from "../context/SiteConfigContext";

export function ShowcasePage() {
  const { config } = useSiteConfig();
  return <ShowcaseCanvas config={config} />;
}
```

- [ ] **Step 6: Run the renderer test and full test suite**

Run:

```bash
npm run test -- src/components/ShowcaseCanvas.test.tsx
npm run test
```

Expected: PASS for the smoke test and the existing utility tests.

### Task 6: Build The Editor Page With Live Preview And Config Controls

**Files:**
- Modify: `src/pages/EditorPage.tsx`

- [ ] **Step 1: Replace `src/pages/EditorPage.tsx` with the editor shell, section controls, and preview**

```tsx
import { useRef, useState, type ChangeEvent } from "react";
import { ShowcaseCanvas } from "../components/ShowcaseCanvas";
import { useSiteConfig } from "../context/SiteConfigContext";
import { parseImportedConfig, serializeConfig } from "../lib/persistence";
import type { SectionType } from "../types/site-config";

const sectionTypes: SectionType[] = ["hero", "profile", "gallery", "quote", "custom"];

export function EditorPage() {
  const {
    config,
    selectedSectionId,
    setSelectedSectionId,
    updateGlobal,
    updateSection,
    addSection,
    deleteSection,
    moveSection,
    replaceConfig,
    resetConfig,
  } = useSiteConfig();

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [newSectionType, setNewSectionType] = useState<SectionType>("hero");
  const selectedSection = config.sections.find((section) => section.id === selectedSectionId) ?? config.sections[0];

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      replaceConfig(parseImportedConfig(text));
    } catch {
      window.alert("Import failed. Please choose a valid JSON config file.");
    } finally {
      event.target.value = "";
    }
  }

  function handleExport() {
    const blob = new Blob([serializeConfig(config)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "editable-showcase-config.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="editor-layout">
      <aside className="editor-sidebar">
        <section className="editor-panel">
          <h1>Editor</h1>
          <p>Adjust the showcase and watch the preview update in real time.</p>
        </section>

        <section className="editor-panel">
          <h2>Global</h2>
          <label>
            <span>Site title</span>
            <input value={config.global.siteTitle} onChange={(event) => updateGlobal({ siteTitle: event.target.value })} />
          </label>
          <label>
            <span>Subtitle</span>
            <textarea value={config.global.siteSubtitle} onChange={(event) => updateGlobal({ siteSubtitle: event.target.value })} />
          </label>
          <label>
            <span>Accent</span>
            <input value={config.global.accent} onChange={(event) => updateGlobal({ accent: event.target.value })} />
          </label>
          <label>
            <span>Accent soft</span>
            <input value={config.global.accentSoft} onChange={(event) => updateGlobal({ accentSoft: event.target.value })} />
          </label>
        </section>

        <section className="editor-panel">
          <div className="editor-panel__row">
            <h2>Sections</h2>
            <select value={newSectionType} onChange={(event) => setNewSectionType(event.target.value as SectionType)}>
              {sectionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => addSection(newSectionType)}>
              Add section
            </button>
          </div>

          <ul className="editor-section-list">
            {config.sections.map((section, index) => (
              <li key={section.id} className={section.id === selectedSection?.id ? "is-selected" : ""}>
                <button type="button" onClick={() => setSelectedSectionId(section.id)}>
                  <strong>{section.title || "Untitled section"}</strong>
                  <span>{section.type}</span>
                </button>
                <div className="editor-inline-actions">
                  <button type="button" onClick={() => moveSection(section.id, -1)} disabled={index === 0}>
                    Up
                  </button>
                  <button type="button" onClick={() => moveSection(section.id, 1)} disabled={index === config.sections.length - 1}>
                    Down
                  </button>
                  <button type="button" onClick={() => deleteSection(section.id)} disabled={config.sections.length === 1}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {selectedSection ? (
          <section className="editor-panel">
            <h2>Selected section</h2>
            <label>
              <span>Type</span>
              <select value={selectedSection.type} onChange={(event) => updateSection(selectedSection.id, { type: event.target.value as SectionType })}>
                {sectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Visible</span>
              <input
                type="checkbox"
                checked={selectedSection.visible}
                onChange={(event) => updateSection(selectedSection.id, { visible: event.target.checked })}
              />
            </label>
            <label>
              <span>Title</span>
              <input value={selectedSection.title} onChange={(event) => updateSection(selectedSection.id, { title: event.target.value })} />
            </label>
            <label>
              <span>Description</span>
              <textarea
                value={selectedSection.description}
                onChange={(event) => updateSection(selectedSection.id, { description: event.target.value })}
              />
            </label>
            <label>
              <span>Quote</span>
              <textarea value={selectedSection.quote} onChange={(event) => updateSection(selectedSection.id, { quote: event.target.value })} />
            </label>
            <label>
              <span>Image src</span>
              <input
                value={selectedSection.image?.src ?? ""}
                onChange={(event) =>
                  updateSection(selectedSection.id, {
                    image: event.target.value
                      ? {
                          src: event.target.value,
                          alt: selectedSection.image?.alt || selectedSection.title || "Section image",
                          kind: event.target.value.startsWith("http") ? "remote" : "local",
                        }
                      : null,
                  })
                }
              />
            </label>
            <label>
              <span>Background</span>
              <input value={selectedSection.background} onChange={(event) => updateSection(selectedSection.id, { background: event.target.value })} />
            </label>
            <label>
              <span>Accent</span>
              <input value={selectedSection.backgroundAccent} onChange={(event) => updateSection(selectedSection.id, { backgroundAccent: event.target.value })} />
            </label>
            <label>
              <span>Button label</span>
              <input value={selectedSection.buttonLabel} onChange={(event) => updateSection(selectedSection.id, { buttonLabel: event.target.value })} />
            </label>
            <label>
              <span>Button href</span>
              <input value={selectedSection.buttonHref} onChange={(event) => updateSection(selectedSection.id, { buttonHref: event.target.value })} />
            </label>
          </section>
        ) : null}

        <section className="editor-panel">
          <h2>Data</h2>
          <div className="editor-inline-actions">
            <button type="button" onClick={handleExport}>
              Export JSON
            </button>
            <button type="button" onClick={() => importInputRef.current?.click()}>
              Import JSON
            </button>
            <button type="button" onClick={resetConfig}>
              Reset Demo
            </button>
          </div>
          <input ref={importInputRef} type="file" accept="application/json" hidden onChange={handleImport} />
        </section>
      </aside>

      <section className="editor-preview">
        <ShowcaseCanvas config={config} embedded />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Run the dev server and manually verify the editor data flow before styling polish**

Run:

```bash
npm run dev
```

Expected manual checks:

- `#/editor` opens the editor shell.
- Changing the site title updates the preview immediately.
- Adding a section appends it and selects it.
- Refreshing the page preserves edits through `localStorage`.

- [ ] **Step 3: Verify JSON export and import manually**

Expected manual checks while the dev server is running:

- Export creates `editable-showcase-config.json`.
- Edit the exported file title, then import it.
- The preview updates to show the imported title.
- Invalid JSON triggers the alert and leaves current data intact.

### Task 7: Polish Styling, Motion, And Final Hosting Behavior

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css` with the full showcase and editor styling**

```css
:root {
  color-scheme: dark;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #f5f7ff;
  background: #090611;
  --panel: rgba(16, 12, 26, 0.8);
  --panel-border: rgba(255, 255, 255, 0.08);
  --text-soft: rgba(245, 247, 255, 0.72);
  --accent: #ff6aa2;
  --accent-soft: #ffd36a;
  --overlay-opacity: 0.24;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
}

body {
  min-width: 320px;
  background: #090611;
  color: #f5f7ff;
}

button,
input,
textarea,
select {
  font: inherit;
}

button,
input,
textarea,
select {
  border-radius: 16px;
  border: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
}

button {
  cursor: pointer;
}

label {
  display: grid;
  gap: 0.45rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.85rem 1rem;
}

textarea {
  min-height: 5.5rem;
  resize: vertical;
}

.showcase-shell {
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background: #090611;
  transition: background 600ms ease;
}

.showcase-shell--embedded {
  height: 100%;
  overflow-y: auto;
  border-radius: 28px;
}

.showcase-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--accent) 28%, transparent) 0%, transparent 30%),
    radial-gradient(circle at 80% 15%, color-mix(in srgb, var(--accent-soft) 22%, transparent) 0%, transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, calc(var(--overlay-opacity) * 0.16)) 0%, transparent 38%);
  mix-blend-mode: screen;
  opacity: 0.95;
  transition: opacity 600ms ease, transform 600ms ease;
}

.showcase-shell--embedded .showcase-backdrop {
  position: absolute;
}

.showcase-nav,
.showcase-footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 2rem;
  color: rgba(255, 255, 255, 0.85);
}

.showcase-nav__brand {
  font-size: 0.85rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.showcase-nav__links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.showcase-sections {
  position: relative;
  z-index: 1;
}

.showcase-section {
  min-height: 100vh;
  display: grid;
  align-items: center;
  padding: 6rem 2rem 4rem;
}

.showcase-shell--embedded .showcase-section {
  min-height: 78vh;
}

.showcase-section__inner {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.showcase-section__meta {
  max-width: 760px;
  display: grid;
  gap: 1.2rem;
  transform: translateY(30px) scale(0.98);
  opacity: 0.38;
  transition: transform 600ms ease, opacity 600ms ease, filter 600ms ease;
}

.showcase-section.is-active .showcase-section__meta {
  transform: translateY(0) scale(1);
  opacity: 1;
  filter: drop-shadow(0 18px 48px rgba(0, 0, 0, 0.25));
}

.showcase-section h2 {
  margin: 0;
  font-size: clamp(3rem, 9vw, 7rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
}

.showcase-section p,
.section-quote {
  margin: 0;
  max-width: 58ch;
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  color: var(--text-soft);
}

.section-quote {
  font-size: clamp(1.8rem, 4.5vw, 4rem);
  line-height: 1.05;
  color: #fff3f8;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.tag-row li {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-copy {
  display: grid;
  gap: 1.4rem;
}

.section-image-frame,
.gallery-card {
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
}

.gallery-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.showcase-button {
  width: fit-content;
  padding: 0.95rem 1.35rem;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 100%);
  color: #12081b;
  font-weight: 700;
}

.showcase-section--start .showcase-section__meta {
  justify-self: start;
}

.showcase-section--center .showcase-section__meta {
  justify-self: center;
}

.showcase-section--end .showcase-section__meta {
  justify-self: end;
}

.showcase-section--compact {
  min-height: 72vh;
}

.showcase-section--tall {
  min-height: 120vh;
}

.editor-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 420px 1fr;
  background: #08050f;
}

.editor-sidebar {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(6, 4, 12, 0.92);
}

.editor-panel {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
}

.editor-panel h1,
.editor-panel h2,
.editor-panel p {
  margin: 0;
}

.editor-panel__row,
.editor-inline-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}

.editor-section-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.editor-section-list li {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.editor-section-list li.is-selected {
  border-color: color-mix(in srgb, var(--accent) 60%, white 14%);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
}

.editor-section-list li > button {
  display: grid;
  justify-items: start;
  gap: 0.25rem;
  text-align: left;
  padding: 0.9rem;
}

.editor-preview {
  min-width: 0;
  padding: 1.25rem;
}

@media (max-width: 980px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .editor-preview {
    min-height: 65vh;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Run the full test suite after the styling pass**

Run:

```bash
npm run test
```

Expected: PASS for all existing tests, since styling should not break them.

- [ ] **Step 3: Run production build and final manual verification**

Run:

```bash
npm run build
npm run preview
```

Expected manual checks:

- `#/` shows the showcase with full-screen transitions.
- `#/editor` shows the editor with a live preview on the right.
- Refresh preserves edits.
- Reset restores the demo theme.
- Local SVG assets load in preview mode.
- Mobile responsive mode in browser devtools keeps both routes usable.

## Self-Review Notes

- Spec coverage check: routes, config model, editor, live preview, localStorage, JSON import/export, default theme, responsive behavior, and GitHub Pages compatibility all map to at least one task above.
- Placeholder scan: no `TODO`, `TBD`, or undefined “handle later” instructions remain.
- Type consistency: `SiteConfig`, `SectionConfig`, `SectionType`, `ShowcaseCanvas`, and persistence helper names are used consistently across tasks.
