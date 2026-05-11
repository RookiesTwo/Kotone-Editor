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
