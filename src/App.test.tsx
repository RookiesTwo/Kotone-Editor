import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the ShowcaseCanvas via the default hash route", () => {
    render(<App />);
    expect(screen.getByText("Neon Reverie")).toBeInTheDocument();
    expect(screen.getByText("LUMINOUS ECHO")).toBeInTheDocument();
  });
});
