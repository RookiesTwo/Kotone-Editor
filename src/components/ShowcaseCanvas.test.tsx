import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDefaultSiteConfig } from "../data/default-config";
import "../index.css";
import { ShowcaseCanvas } from "./ShowcaseCanvas";

describe("ShowcaseCanvas", () => {
  it("renders the first visible hero section", () => {
    render(<ShowcaseCanvas config={createDefaultSiteConfig()} embedded />);

    expect(screen.getByRole("heading", { name: "Kotone Editor" })).toBeInTheDocument();
    expect(screen.getByText("立刻尝试")).toBeInTheDocument();
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

  it("marks inline image frames as dragging while the pointer is down", () => {
    const config = createDefaultSiteConfig();
    const section = config.sections[1];

    render(
      <ShowcaseCanvas
        config={config}
        embedded
        editableSectionId={section.id}
        onImageOffsetChange={() => undefined}
      />,
    );

    const frame = document.querySelector(".section-image-frame.is-draggable") as HTMLElement;

    Object.defineProperty(frame, "clientWidth", { configurable: true, value: 400 });
    Object.defineProperty(frame, "clientHeight", { configurable: true, value: 400 });
    frame.setPointerCapture = () => undefined;

    const pointerDown = new Event("pointerdown", { bubbles: true });
    Object.assign(pointerDown, { pointerId: 1, clientX: 100, clientY: 100 });

    const pointerMove = new Event("pointermove", { bubbles: true });
    Object.assign(pointerMove, { pointerId: 1, clientX: 200, clientY: 100 });

    const pointerUp = new Event("pointerup", { bubbles: true });
    Object.assign(pointerUp, { pointerId: 1, clientX: 200, clientY: 100 });

    fireEvent(frame, pointerDown);
    expect(frame.className).toContain("is-dragging");

    fireEvent(frame, pointerMove);
    fireEvent(frame, pointerUp);

    expect(frame.className).not.toContain("is-dragging");
  });
});
