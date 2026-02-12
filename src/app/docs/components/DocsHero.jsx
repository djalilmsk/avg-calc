import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

function QuickLinkCard({ link, onJumpToSection }) {
  const Icon = link.icon;

  const baseClass =
    "group relative flex flex-col justify-between rounded-2xl border border-border bg-secondary/60 p-4 transition-all hover:bg-accent hover:shadow-md";

  const Content = (
    <>
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-background border border-border transition-colors">
            <Icon className="size-5 text-foreground" />
          </div>

          <div>
            <p className="text-sm font-semibold leading-none">{link.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{link.text}</p>
          </div>
        </div>

        <ArrowRight className="size-6 opacity-0 text-muted-foreground group-hover:text-foreground group-hover:opacity-100 group-hover:-rotate-45 duration-300 transition-all" />
      </div>
    </>
  );

  if (link.to.startsWith("#")) {
    return (
      <button
        type="button"
        onClick={() => onJumpToSection(link.to.slice(1))}
        className={`${baseClass} text-left cursor-pointer`}
      >
        {Content}
      </button>
    );
  }

  return (
    <Link to={link.to} className={`${baseClass} cursor-pointer`}>
      {Content}
    </Link>
  );
}

export default function DocsHero({ quickLinks, onJumpToSection }) {
  return (
    <section className="relative mt-4 overflow-hidden">
      <div className="relative">
        <h2 className="mt-3 text-2xl font-bold sm:text-4xl">
          Quick Visual Guide
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Less text, more actions. Jump straight to the section you need or
          explore our comprehensive docs to master the semester average
          calculator.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <QuickLinkCard
              key={link.title}
              link={link}
              onJumpToSection={onJumpToSection}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
