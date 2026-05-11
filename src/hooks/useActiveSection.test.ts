import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";

describe("useActiveSection", () => {
  it("returns a default from/to/progress shape before any observation", () => {
    const { result } = renderHook(() => useActiveSection(["a", "b"]));

    expect(result.current.from).toBe("a");
    expect(result.current.to).toBe("a");
    expect(result.current.progress).toBe(0);
  });

  it("sets from and to to the same first section when only one section exists", () => {
    const { result } = renderHook(() => useActiveSection(["only"]));

    expect(result.current.from).toBe("only");
    expect(result.current.to).toBe("only");
    expect(result.current.progress).toBe(0);
  });
});
