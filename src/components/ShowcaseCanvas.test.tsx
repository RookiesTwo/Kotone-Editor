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

  it("renders the hero image as a background visual when display mode is background", () => {
    const config = createDefaultSiteConfig();
    render(<ShowcaseCanvas config={config} embedded />);

    expect(screen.getByTestId("showcase-active-background")).toBeInTheDocument();
  });

  it("renders inline image frames with composition sizing styles", () => {
    const config = createDefaultSiteConfig();
    config.sections[1].visible = true;

    render(<ShowcaseCanvas config={config} embedded />);

    const frame = document.querySelector(".section-image-frame") as HTMLElement;
    expect(frame).toBeTruthy();
    expect(frame.style.width).not.toBe("");
  });
});
