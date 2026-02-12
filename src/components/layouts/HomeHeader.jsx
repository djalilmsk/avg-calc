import { SidebarToggleButton } from "../ui/side-bar-toggle";
import { Github } from "lucide-react";
import HistoryControls from "@/app/calculator/components/HistoryControls";
import { Link } from "react-router";
import { SoftIconButton } from "../ui/calc-ui";

function HomeHeader({ history, actions }) {
  return (
    <>
      <Link
        to="/"
        className="text-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <h1 className="text-2xl font-bold sm:text-3xl sm:hidden mx-auto -mb-1 pt-1 pb-2">
          CookedCalc
        </h1>
      </Link>

      <div className="shrink-0 px-3 mx-auto flex w-full max-w-7xl flex-col">
        <div className="flex items-center justify-between gap-2 pb-2 py-2">
          <div className="flex gap-2">
            <SidebarToggleButton />
            <SoftIconButton asChild className="flex h-11 items-center gap-2 rounded-lg px-2 sm:h-9">
              <a
                href="https://github.com/djalilmsk/avg-calc"
                target="_blank"
                rel="noreferrer"
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
            </SoftIconButton>
          </div>

          <Link
            to="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <h1 className="text-xl font-bold sm:text-3xl max-sm:hidden">
              CookedCalc
            </h1>
          </Link>

          <div className="flex items-center gap-2">
            <HistoryControls
              canUndo={history.canUndo}
              canRedo={history.canRedo}
              onUndo={actions.undo}
              onRedo={actions.redo}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default HomeHeader;
