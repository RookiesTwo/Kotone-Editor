import { useEffect, useRef, useState, type RefObject } from "react";

const ZONE_PADDING = 0.15;

type TransitionMode = "zone" | "gap";

interface PhaseState {
  mode: TransitionMode;
  current: string;
  from: string;
  to: string;
  progress: number;
}

interface SectionRect {
  id: string;
  zoneTop: number;
  zoneBottom: number;
}

export function useActiveSection(
  sectionIds: string[],
  rootRef?: RefObject<HTMLElement | null>,
) {
  const [state, setState] = useState<PhaseState>(() => {
    const first = sectionIds[0] ?? "";
    return {
      mode: "zone",
      current: first,
      from: first,
      to: first,
      progress: 0,
    };
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (sectionIds.length === 0) {
      setState({ mode: "zone", current: "", from: "", to: "", progress: 0 });
      return;
    }

    const root = rootRef?.current ?? null;
    const nodes = Array.from((root ?? document).querySelectorAll<HTMLElement>("[data-section-id]"));
    if (nodes.length === 0) {
      return;
    }

    const computeState = () => {
      const viewportCenter = window.innerHeight / 2;
      const rects: SectionRect[] = nodes.map((node, index) => {
        const rect = node.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const isFirst = index === 0;
        const isLast = index === nodes.length - 1;

        return {
          id: node.dataset.sectionId ?? sectionIds[0],
          zoneTop: isFirst ? rect.top : centerY - rect.height * ZONE_PADDING,
          zoneBottom: isLast ? Number.POSITIVE_INFINITY : centerY + rect.height * ZONE_PADDING,
        };
      });

      for (const rect of rects) {
        if (viewportCenter >= rect.zoneTop && viewportCenter <= rect.zoneBottom) {
          const next: PhaseState = {
            mode: "zone",
            current: rect.id,
            from: rect.id,
            to: rect.id,
            progress: 0,
          };

          setState((prev) =>
            prev.mode === next.mode &&
            prev.current === next.current &&
            prev.from === next.from &&
            prev.to === next.to &&
            prev.progress === next.progress
              ? prev
              : next,
          );
          return;
        }
      }

      let upper: SectionRect | null = null;
      let lower: SectionRect | null = null;

      for (let i = 0; i < rects.length; i++) {
        if (rects[i].zoneTop > viewportCenter) {
          upper = rects[i];
          lower = i > 0 ? rects[i - 1] : null;
          break;
        }
      }

      if (upper && lower) {
        const gapStart = lower.zoneBottom;
        const gapEnd = upper.zoneTop;
        const gapLength = gapEnd - gapStart;
        const progress = gapLength > 0 ? (viewportCenter - gapStart) / gapLength : 0;
        const clamped = Math.max(0, Math.min(1, progress));

        const next: PhaseState = {
          mode: "gap",
          current: upper.id,
          from: lower.id,
          to: upper.id,
          progress: clamped,
        };

        setState((prev) =>
          prev.mode === next.mode &&
          prev.current === next.current &&
          prev.from === next.from &&
          prev.to === next.to &&
          prev.progress === next.progress
            ? prev
            : next,
        );
        return;
      }

      const last = rects.at(-1)?.id ?? sectionIds[0];
      const next: PhaseState = {
        mode: "zone",
        current: last,
        from: last,
        to: last,
        progress: 0,
      };

      setState((prev) =>
        prev.mode === next.mode &&
        prev.current === next.current &&
        prev.from === next.from &&
        prev.to === next.to &&
        prev.progress === next.progress
          ? prev
          : next,
      );
    };

    computeState();

    if (typeof requestAnimationFrame === "function" && window.innerHeight > 0) {
      const onScroll = () => requestAnimationFrame(computeState);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [rootRef, sectionIds]);

  return state;
}
