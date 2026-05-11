import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the ShowcasePage placeholder for the default hash route", () => {
    render(<App />);
    expect(
      screen.getByText(/Showcase page pending renderer task/i),
    ).toBeInTheDocument();
  });
});
