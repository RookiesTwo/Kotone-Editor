import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorLocaleProvider } from "../context/EditorLocaleContext";
import { SiteConfigProvider } from "../context/SiteConfigContext";
import { EditorPage } from "./EditorPage";

describe("EditorPage localization", () => {
  it("switches editor UI copy from Chinese to English without changing preview content", () => {
    render(
      <EditorLocaleProvider>
        <SiteConfigProvider>
          <EditorPage />
        </SiteConfigProvider>
      </EditorLocaleProvider>,
    );

    expect(screen.getByText("编辑器")).toBeInTheDocument();
    expect(screen.getByText("站点标题")).toBeInTheDocument();
    expect(screen.getAllByText("Neon Reverie").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getAllByText("Editor").length).toBeGreaterThan(0);
    expect(screen.getByText("Site title")).toBeInTheDocument();
    expect(screen.getAllByText("Neon Reverie").length).toBeGreaterThan(0);
  });

  it("lets the user add and remove tags", () => {
    render(
      <EditorLocaleProvider>
        <SiteConfigProvider>
          <EditorPage />
        </SiteConfigProvider>
      </EditorLocaleProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Add tag"), {
      target: { value: "new-tag" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add tag" }));

    expect(screen.getAllByText("new-tag").length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" }).at(-1)!);

    expect(screen.queryByText("new-tag")).not.toBeInTheDocument();
  });
});
