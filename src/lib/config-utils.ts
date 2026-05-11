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
const imageDisplayModes: SectionConfig["imageDisplayMode"][] = ["inline", "background"];

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
    imageDisplayMode: type === "hero" ? "background" : "inline",
    imageFrameWidth: 56,
    imageFrameHeight: 72,
    imageScale: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
  };
}

function normalizeSection(value: unknown): SectionConfig {
  if (!isRecord(value)) {
    return createSection("custom");
  }

  const type = pickEnum(value.type, sectionTypes, "custom");
  const fallback = createSection(type);

  return {
    id: pickString(value.id, fallback.id),
    type,
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
    imageDisplayMode: pickEnum(value.imageDisplayMode, imageDisplayModes, fallback.imageDisplayMode),
    imageFrameWidth: Math.max(24, Math.min(100, pickNumber(value.imageFrameWidth, fallback.imageFrameWidth))),
    imageFrameHeight: Math.max(24, Math.min(100, pickNumber(value.imageFrameHeight, fallback.imageFrameHeight))),
    imageScale: Math.max(0.5, Math.min(2.5, pickNumber(value.imageScale, fallback.imageScale))),
    imageOffsetX: Math.max(-100, Math.min(100, pickNumber(value.imageOffsetX, fallback.imageOffsetX))),
    imageOffsetY: Math.max(-100, Math.min(100, pickNumber(value.imageOffsetY, fallback.imageOffsetY))),
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
