import { Button } from "@/components/ui/button";
import { SquareChevronDown } from "lucide-react";
import FakeInput from "./FakeInput";
import TemplatesGrid from "./TemplatesGrid";

function DesktopTemplatesView({
  templates,
  hasOverflow,
  onShowMore,
  onStart,
  onDelete,
  onEdit,
}) {
  return (
    <div className="mt-auto mx-auto flex h-[calc(50dvh+5.2rem)] w-full max-w-7xl flex-col px-3">
      <div className="pb-4 text-center">
        <h1 className="font-heading-token truncate text-nowrap text-3xl font-bold text-foreground max-lg:mt-2 lg:text-5xl">
          Welcome to CookedCalc
        </h1>
      </div>

      <FakeInput />

      <TemplatesGrid
        templates={templates}
        onStart={onStart}
        onDelete={onDelete}
        onEdit={onEdit}
        className="grid h-30 w-full grid-cols-1 grid-rows-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      />

      {hasOverflow ? (
        <div className="mt-10 flex justify-center">
          <Button type="button" variant="link" onClick={onShowMore}>
            <SquareChevronDown />
            Show more
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default DesktopTemplatesView;
