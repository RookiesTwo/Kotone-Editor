import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDefaultSiteConfig } from "../data/default-config";
import "../index.css";
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

  it("uses a viewport-fixed background layer on the public showcase route", () => {
    const config = createDefaultSiteConfig();
    render(<ShowcaseCanvas config={config} />);

    const background = screen.getByTestId("showcase-active-background");
    expect(background.className).toContain("showcase-active-background--page");
  });

  it("renders both background slots and keeps the current background layer mounted", () => {
    const config = createDefaultSiteConfig();
    render(<ShowcaseCanvas config={config} />);

    expect(screen.getByTestId("showcase-active-background")).toBeInTheDocument();
    expect(screen.getByTestId("showcase-active-background-to")).toBeInTheDocument();
  });
});