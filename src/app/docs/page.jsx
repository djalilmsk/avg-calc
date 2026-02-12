import { useRef } from "react";
import DocsHero from "./components/DocsHero";
import DocsSectionCard from "./components/DocsSectionCard";
import {
  DesktopSectionNav,
  MobileSectionNav,
} from "./components/DocsSectionNav";
import { DOC_SECTIONS, QUICK_LINKS } from "./content.jsx";
import { useActiveDocsSection } from "./hooks/useActiveDocsSection";
import DocsHeader from "@/components/layouts/DocsHeader";
import SeoHead from "@/components/seo/SeoHead";

function DocsPage() {
  const scrollContainerRef = useRef(null);
  const { activeSectionId, setActiveSectionId } = useActiveDocsSection(
    DOC_SECTIONS,
    scrollContainerRef,
  );

  function jumpToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    setActiveSectionId(sectionId);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="h-screen flex flex-col">
      <SeoHead
        title="CookedCalc Docs | Shortcuts and Usage Guide"
        description="Read CookedCalc docs for keyboard shortcuts, sidebar actions, top controls, and calculator workflow tips for students and universities."
        keywords="cookedcalc docs, calculator shortcuts, sidebar actions, grade calculator guide"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: "CookedCalc Documentation",
            name: "CookedCalc Docs",
            url: "https://cookedcalc.djalilmsk.dev/docs",
            description:
              "Documentation covering shortcuts, sidebar actions, top controls, and workflow in CookedCalc.",
            author: {
              "@type": "Person",
              name: "Abd eldjallil Meskali (djalilmsk)",
              url: "https://djalilmsk.dev",
            },
            publisher: {
              "@id": "https://cookedcalc.djalilmsk.dev/#organization",
            },
            image: "https://cookedcalc.djalilmsk.dev/preview.jpg",
          },
        ]}
      />
      <div className="sticky top-0 bg-background z-10 pb-2">
        <DocsHeader />
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 mx-auto w-full max-w-7xl px-5 pb-20 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
    </div>
  );
}

export default DocsPage;
