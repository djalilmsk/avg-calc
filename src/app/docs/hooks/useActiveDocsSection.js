import { useEffect, useState } from "react";

export function useActiveDocsSection(sections = [], scrollContainerRef = null) {
  const firstSectionId = sections[0]?.id ?? "";
  const [activeSectionId, setActiveSectionId] = useState(firstSectionId);

  useEffect(() => {
    setActiveSectionId(firstSectionId);
  }, [firstSectionId]);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean)
      .sort((left, right) => left.offsetTop - right.offsetTop);

    if (targets.length === 0) return;

    let frameId = null;

    function updateActiveSection() {
      const containerTop = container.getBoundingClientRect().top;
      const activationLine = containerTop + 160;

      let nextActiveId = targets[0].id;
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= activationLine) {
          nextActiveId = target.id;
        } else {
          break;
        }
      }
      setActiveSectionId((current) =>
        current === nextActiveId ? current : nextActiveId
      );
    }

    function scheduleUpdate() {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateActiveSection();
      });
    }

    container.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateActiveSection();

    return () => {
      container.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [sections, scrollContainerRef]);

  return { activeSectionId, setActiveSectionId };
}
