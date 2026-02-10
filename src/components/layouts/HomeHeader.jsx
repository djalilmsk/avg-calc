import { useSemesterCalculator } from "@/app/calculator/hooks/useSemesterCalculator";
import { SidebarToggleButton } from "../ui/side-bar-toggle";
import { Github } from "lucide-react";
import HistoryControls from "@/app/calculator/components/HistoryControls";

function HomeHeader() {
  const { history, actions } = useSemesterCalculator();

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl sm:hidden mx-auto -mb-1 pt-3 pb-2">
        CookedCalc
      </h1>

      <div className="shrink-0 px-3 mx-auto flex w-full max-w-7xl flex-col pt-2">
        <div className="flex items-center justify-between gap-2 pb-2 py-4">
          <div className="flex gap-2">
            <SidebarToggleButton />
            <a
              href="https://github.com/djalilmsk/avg-calc"
              target="_blank"
              rel="noreferrer"
              className="flex sm:h-9 h-11 items-center gap-2 rounded-lg bg-[#262626] px-2 text-zinc-200 transition-colors hover:bg-[#2f2f2f]"
              aria-label="Open GitHub repository"
              title="Open GitHub repository"
            >
              <Github className="sm:size-4 size-5.5" />
              <img
                src="https://img.shields.io/github/stars/djalilmsk/avg-calc?style=flat&label=%E2%98%85&color=2f2f2f"
                alt="GitHub stars"
                className="sm:h-4 sm:w-8 h-6 w-11"
              />
            </a>
          </div>

          <h1 className="text-xl font-bold text-slate-100 sm:text-3xl max-sm:hidden">
            CookedCalc
          </h1>

          <div className="flex items-center gap-2">
            <HistoryControls
              canUndo={history.canUndo}
              canRedo={history.canRedo}
              onUndo={actions.undo}
              onRedo={actions.redo}
              onReset={actions.resetAll}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomeHeader;
