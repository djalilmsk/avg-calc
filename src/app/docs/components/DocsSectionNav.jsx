import { cn } from "@/lib/utils";

function NavButton({ section, activeSectionId, onJumpToSection, compact = false }) {
  return (
    <button
      type="button"
      onClick={() => onJumpToSection(section.id)}
      className={cn(
        "cursor-pointer",
        compact
          ? "rounded-[var(--radius-lg)] border px-3 py-1.5 text-xs font-semibold transition-colors"
          : "flex w-full items-center gap-3 rounded-lg px-3.5 py-3 text-left text-sm transition-colors",
        activeSectionId === section.id
          ? "border-accent bg-accent text-foreground"
          : "border-border bg-secondary/40 text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {compact ? null : <section.icon className="size-4" />}
      <span>{section.title}</span>
    </button>
  );
}

export function MobileSectionNav({ sections, activeSectionId, onJumpToSection }) {
  return (
    <div className="mt-6 overflow-x-auto pb-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:hidden">
      <div className="flex w-max items-center gap-2">
        {sections.map((section) => (
          <NavButton
            key={section.id}
            section={section}
            activeSectionId={activeSectionId}
            onJumpToSection={onJumpToSection}
            compact
          />
        ))}
      </div>
    </div>
  );
}

export function DesktopSectionNav({ sections, activeSectionId, onJumpToSection }) {
  return (
    <aside className="sticky top-4 hidden lg:block">
      <div>
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          On This Page
        </p>
        <div className="mt-2 space-y-1">
          {sections.map((section) => (
            <NavButton
              key={section.id}
              section={section}
              activeSectionId={activeSectionId}
              onJumpToSection={onJumpToSection}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
