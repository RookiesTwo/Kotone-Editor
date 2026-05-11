import { useEffect, useState, type RefObject } from "react";

export function useActiveSection(sectionIds: string[], rootRef?: RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveId("");
      return;
    }

    const root = rootRef?.current ?? null;
    const nodes = Array.from((root ?? document).querySelectorAll<HTMLElement>("[data-section-id]"));
    if (nodes.length === 0) {
      setActiveId(sectionIds[0]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length === 0) {
          return;
        }

        const best = visibleEntries.sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (!(best?.target instanceof HTMLElement)) {
          return;
        }

        const nextId = best.target.dataset.sectionId ?? sectionIds[0];
        const shouldSwitch = best.intersectionRatio >= 0.55 || activeId === "";

        if (shouldSwitch) {
          setActiveId(nextId);
        }
      },
      {
        root,
        threshold: [0.35, 0.6, 0.85],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [activeId, rootRef, sectionIds]);

  return activeId;
}
