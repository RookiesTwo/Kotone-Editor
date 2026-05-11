import { useEffect, useState, type RefObject } from "react";

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
    return {
      from: first,
      to: sectionIds.length > 1 ? sectionIds[1] : first,
      progress: 0,
    };
  });

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

    const updateProgress = () => {
      const viewportCenter = window.innerHeight / 2;
      let bestFrom = sectionIds[0];
      let bestTo = sectionIds[0];
      let bestProgress = 0;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rect = node.getBoundingClientRect();
        const nodeCenter = rect.top + rect.height / 2;
        const distance = Math.abs(nodeCenter - viewportCenter);
        const maxDistance = window.innerHeight / 2 + rect.height / 2;
        const proximity = Math.max(0, 1 - distance / maxDistance);

        if (proximity > bestProgress) {
          bestProgress = proximity;
          bestTo = node.dataset.sectionId ?? sectionIds[0];
          bestFrom = i > 0
            ? (nodes[i - 1].dataset.sectionId ?? sectionIds[0])
            : (node.dataset.sectionId ?? sectionIds[0]);
        }
      }

      setState((prev) => {
        const nextProgress = Math.max(0, Math.min(1, bestProgress));
        if (prev.from === bestFrom && prev.to === bestTo && prev.progress === nextProgress) {
          return prev;
        }

        return { from: bestFrom, to: bestTo, progress: nextProgress };
      });
    };

    updateProgress();

    if (typeof requestAnimationFrame === "function" && window.innerHeight > 0) {
      const onScroll = () => requestAnimationFrame(updateProgress);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [rootRef, sectionIds]);

  return state;
}
