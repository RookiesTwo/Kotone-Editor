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
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (best?.target instanceof HTMLElement) {
          setActiveId(best.target.dataset.sectionId ?? sectionIds[0]);
        }
      },
      {
        root,
        threshold: [0.35, 0.6, 0.85],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [rootRef, sectionIds]);

  return activeId;
}
