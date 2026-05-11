import { useEffect, useRef, useState, type RefObject } from "react";

const ZONE_PADDING = 0.15;

interface SectionRect {
  id: string;
  top: number;
  bottom: number;
  zoneTop: number;
  zoneBottom: number;
}

export function useActiveSection(
  sectionIds: string[],
  rootRef?: RefObject<HTMLElement | null>,
) {
  const [state, setState] = useState<{
    from: string;
    to: string;
    progress: number;
  }>(() => {
    if (sectionIds.length === 0) {
      return { from: "", to: "", progress: 0 };
    }

    const first = sectionIds[0];
    return { from: first, to: first, progress: 0 };
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (sectionIds.length === 0) {
      setState({ from: "", to: "", progress: 0 });
      return;
    }

    const root = rootRef?.current ?? null;
    const nodes = Array.from(
      (root ?? document).querySelectorAll<HTMLElement>("[data-section-id]"),
    );
    if (nodes.length === 0) {
      return;
    }

    const computeState = () => {
      const viewportCenter = window.innerHeight / 2;
      const rects: SectionRect[] = nodes.map((node, i) => {
        const rect = node.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const isFirst = i === 0;
        const isLast = i === nodes.length - 1;

        return {
          id: node.dataset.sectionId ?? "",
          top: rect.top,
          bottom: rect.bottom,
          zoneTop: isFirst ? rect.top : centerY - rect.height * ZONE_PADDING,
          zoneBottom: isLast ? Number.POSITIVE_INFINITY : centerY + rect.height * ZONE_PADDING,
        };
      });

      // Find which visual-center zone contains the viewport center
      for (const rect of rects) {
        if (viewportCenter >= rect.zoneTop && viewportCenter <= rect.zoneBottom) {
          if (stateRef.current.from !== rect.id || stateRef.current.to !== rect.id || stateRef.current.progress !== 0) {
            setState({ from: rect.id, to: rect.id, progress: 0 });
          }

          return;
        }
      }

      // Find the gap: first section whose zoneTop is below viewport center (upper/entering),
      // and the section immediately before it (lower/exiting)
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
        const gapProgress = gapLength > 0
          ? (viewportCenter - gapStart) / gapLength
          : 0;
        const clamped = Math.max(0, Math.min(1, gapProgress));

        if (stateRef.current.from !== lower.id || stateRef.current.to !== upper.id || stateRef.current.progress !== clamped) {
          setState({ from: lower.id, to: upper.id, progress: clamped });
        }

        return;
      }

      // Before first section's zone or after last section's zone
      const firstId = rects[0]?.id ?? sectionIds[0];
      if (stateRef.current.from !== firstId || stateRef.current.to !== firstId || stateRef.current.progress !== 0) {
        setState({ from: firstId, to: firstId, progress: 0 });
      }
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
