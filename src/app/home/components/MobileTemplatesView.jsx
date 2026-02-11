import { Button } from "@/components/ui/button";
import { SquareChevronDown } from "lucide-react";
import TemplatesGrid from "./TemplatesGrid";

function MobileTemplatesView({
  templates,
  expanded,
  hasOverflow,
  onShowMore,
  onStart,
  onDelete,
  onEdit,
}) {
  return (
    <div className="h-full overflow-y-auto pb-28">
      <div
        className={`mx-auto mt-10 flex w-full max-w-7xl flex-col items-center gap-6 px-3 ${
          expanded ? "justify-start pb-6" : "justify-center"
        }`}
      >
        <div className="pb-4 text-center">
          <h1 className="font-heading-token text-4xl font-bold text-foreground max-lg:mt-2 lg:text-5xl">
            Welcome <br className="sm:hidden" /> to CookedCalc
          </h1>
        </div>

        <TemplatesGrid
          templates={templates}
          onStart={onStart}
          onDelete={onDelete}
          onEdit={onEdit}
          className="grid w-full grid-cols-2 gap-3"
        />

        {hasOverflow ? (
          <Button type="button" variant="link" onClick={onShowMore}>
            <SquareChevronDown />
            Show more
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default MobileTemplatesView;
