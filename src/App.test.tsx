import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("uses the Kotone Editor browser title", () => {
    const indexHtml = readFileSync(resolve(import.meta.dirname, "../index.html"), "utf8");
    expect(indexHtml).toContain("<title>Kotone Editor</title>");
  });

  it("renders the ShowcaseCanvas via the default hash route", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Kotone Editor" })).toBeInTheDocument();
    expect(screen.getByText("一款完全可自定义的数据驱动纯前端炫酷展示页面编辑器。")).toBeInTheDocument();
  });
});
