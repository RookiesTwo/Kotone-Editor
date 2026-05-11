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
