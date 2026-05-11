import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";

describe("useActiveSection", () => {
  it("returns a zone state for the first section before any DOM observation", () => {
    const { result } = renderHook(() => useActiveSection(["a", "b"]));

    expect(result.current.mode).toBe("zone");
    expect(result.current.current).toBe("a");
    expect(result.current.from).toBe("a");
    expect(result.current.to).toBe("a");
    expect(result.current.progress).toBe(0);
  });

  it("keeps a single section in a stable zone state", () => {
    const { result } = renderHook(() => useActiveSection(["only"]));

    expect(result.current.mode).toBe("zone");
    expect(result.current.current).toBe("only");
    expect(result.current.from).toBe("only");
    expect(result.current.to).toBe("only");
    expect(result.current.progress).toBe(0);
  });
});
