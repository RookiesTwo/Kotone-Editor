import { describe, expect, it } from "vitest";
import { resolveAssetSrc } from "./asset-url";

describe("asset-url", () => {
  it("prefixes root-relative local assets with the Vite base URL", () => {
    expect(resolveAssetSrc("/assets/Kotone_01.jpeg", "/Kotone-Editor/")).toBe("/Kotone-Editor/assets/Kotone_01.jpeg");
  });

  it("leaves root-relative assets unchanged when the app base is the domain root", () => {
    expect(resolveAssetSrc("/assets/Kotone_01.jpeg", "/")).toBe("/assets/Kotone_01.jpeg");
  });

  it("does not modify remote URLs or already-prefixed asset URLs", () => {
    expect(resolveAssetSrc("https://example.com/image.jpg", "/Kotone-Editor/")).toBe("https://example.com/image.jpg");
    expect(resolveAssetSrc("/Kotone-Editor/assets/Kotone_01.jpeg", "/Kotone-Editor/")).toBe(
      "/Kotone-Editor/assets/Kotone_01.jpeg",
    );
  });
});
