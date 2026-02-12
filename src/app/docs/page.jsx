import { useRef } from "react";
import DocsHero from "./components/DocsHero";
import DocsSectionCard from "./components/DocsSectionCard";
import {
  DesktopSectionNav,
  MobileSectionNav
} from "./components/DocsSectionNav";
import { DOC_SECTIONS, QUICK_LINKS } from "./content";
import { useActiveDocsSection } from "./hooks/useActiveDocsSection";

function DocsPage() {
  const scrollContainerRef = useRef(null);
  const { activeSectionId, setActiveSectionId } =
    useActiveDocsSection(DOC_SECTIONS, scrollContainerRef);

  function jumpToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    setActiveSectionId(sectionId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      ref={scrollContainerRef}
      className="mx-auto w-full max-w-7xl px-3 pb-20 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <DocsHero quickLinks={QUICK_LINKS} onJumpToSection={jumpToSection} />
      <MobileSectionNav
        sections={DOC_SECTIONS}
        activeSectionId={activeSectionId}
        onJumpToSection={jumpToSection}
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <DesktopSectionNav
          sections={DOC_SECTIONS}
          activeSectionId={activeSectionId}
          onJumpToSection={jumpToSection}
        />

        <main className="space-y-5 pb-10 mt-8">
          {DOC_SECTIONS.map((section) => (
            <DocsSectionCard key={section.id} section={section} />
          ))}
        </main>
      </div>
    </div>
  );
}

export default DocsPage;
