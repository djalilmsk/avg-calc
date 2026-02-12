function SectionItemCard({ item }) {
  const Icon = item.icon;

  return (
    <button className="group relative flex w-full items-center gap-2 overflow-hidden rounded-xl p-3 bg-primary/20  text-left transition-all hover:border-foreground/10 hover:bg-secondary/40">
      <div className="flex size-12 items-center justify-center rounded-lg border border-border/50 bg-background shadow-sm transition-colors">
        <Icon className="size-4 text-muted-foreground transition-colors" />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium leading-none tracking-tight text-foreground transition-colors">
          {item.title}
        </h4>
        <p className="line-clamp-2 text-sm text-muted-foreground/80">
          {item.text}
        </p>
      </div>
    </button>
  );
}

function ShortcutRow({ shortcut }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground/90">{shortcut.action}</span>
      <div className="flex items-center gap-1.5">
        {shortcut.keys.map((key) => (
          <kbd
            key={key}
            className="flex min-w-[20px] items-center justify-center rounded-md border border-border bg-muted/60 px-1.5 py-1 font-mono text-[10px] font-bold text-muted-foreground/80 shadow-[inset_0_-1.5px_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-1.5px_0_0_rgba(255,255,255,0.1)]"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export default function DocsSectionCard({ section }) {
  const SectionIcon = section.icon;

  return (
    <section
      id={section.id}
      className="scroll-mt-24 not-last:border-b border-border/40 pb-12 not-first:pt-8"
    >
      <div className="mb-8 flex items-center gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/30 text-muted-foreground/80">
          <SectionIcon className="size-7" />
        </div>
        <div className="">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {section.title}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            {section.subtitle}
          </p>
        </div>
      </div>

      {Array.isArray(section.items) ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item) => (
            <SectionItemCard key={item.title} item={item} />
          ))}
        </div>
      ) : null}

      {Array.isArray(section.shortcuts) ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-border/40 bg-card/30">
          <div className="px-4 py-3 border-b border-border/40 bg-secondary/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keyboard Shortcuts
            </h4>
          </div>
          <div className="divide-y divide-border/40 px-4 py-1">
            {section.shortcuts.map((shortcut) => (
              <ShortcutRow key={shortcut.action} shortcut={shortcut} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
