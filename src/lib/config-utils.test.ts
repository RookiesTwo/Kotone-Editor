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

  it("adds safe defaults for image composition fields", () => {
    const section = createSection("profile");

    expect(section.imageDisplayMode).toBe("inline");
    expect(section.imageFrameWidth).toBe(56);
    expect(section.imageFrameHeight).toBe(72);
    expect(section.imageScale).toBe(1);
    expect(section.imageOffsetX).toBe(0);
    expect(section.imageOffsetY).toBe(0);
  });

  it("defaults hero imageDisplayMode to background when the field is missing", () => {
    const config = normalizeSiteConfig({
      sections: [{ id: "hero-old", type: "hero" }],
    });

    expect(config.sections[0].imageDisplayMode).toBe("background");
  });

  it("normalizes missing or invalid image composition values", () => {
    const config = normalizeSiteConfig({
      sections: [
        {
          id: "hero-bg",
          type: "hero",
          imageDisplayMode: "background",
          imageFrameWidth: 140,
          imageFrameHeight: -20,
          imageScale: 0,
          imageOffsetX: "bad",
        },
      ],
    });

    expect(config.sections[0].imageDisplayMode).toBe("background");
    expect(config.sections[0].imageFrameWidth).toBe(100);
    expect(config.sections[0].imageFrameHeight).toBe(24);
    expect(config.sections[0].imageScale).toBe(0.5);
    expect(config.sections[0].imageOffsetX).toBe(0);
    expect(config.sections[0].imageOffsetY).toBe(0);
  });
});
