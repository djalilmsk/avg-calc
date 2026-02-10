import AddModuleBar from "./calculator/components/AddModuleBar";
import HistoryControls from "./calculator/components/HistoryControls";
import ModulesMobileList from "./calculator/components/ModulesMobileList";
import ModulesTable from "./calculator/components/ModulesTable";
import SnapshotsList from "./calculator/components/SnapshotsList";
import SummaryBar from "./calculator/components/SummaryBar";
import TemplateChooser from "./calculator/components/TemplateChooser";
import { useSemesterCalculator } from "./calculator/hooks/useSemesterCalculator";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Github, PanelLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="flex sm:h-9 sm:w-9 h-11 w-11 items-center justify-center rounded-lg cursor-pointer bg-[#262626] text-zinc-200 hover:bg-[#2f2f2f]"
      title="Toggle snapshots"
      aria-label="Toggle snapshots"
    >
      <PanelLeft className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
    </button>
  );
}

export default function SemesterAverageApp() {
  const {
    snapshots,
    computed,
    history,
    actions,
    // templates,
    // needsTemplateChoice,
  } = useSemesterCalculator();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return 300;
    const saved = Number(window.localStorage.getItem("sidebar_width_px"));
    return Number.isFinite(saved) ? Math.min(420, Math.max(240, saved)) : 300;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const isResizingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sidebar_width_px", String(sidebarWidth));
  }, [sidebarWidth]);

  function startSidebarResize(event) {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    event.preventDefault();
    isResizingRef.current = true;
    setIsResizingSidebar(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onPointerMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const next = Math.min(420, Math.max(240, moveEvent.clientX));
      setSidebarWidth(next);
    };

    const onPointerUp = () => {
      isResizingRef.current = false;
      setIsResizingSidebar(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  return (
    <SidebarProvider
      defaultOpen
      className={isResizingSidebar ? "is-resizing-sidebar" : ""}
      style={{ "--sidebar-width": `${sidebarWidth}px` }}
    >
      <SnapshotsList
        snapshots={snapshots}
        onSave={actions.saveSnapshot}
        onRestore={actions.restoreSnapshot}
        onDelete={actions.deleteSnapshot}
        onRename={actions.renameSnapshot}
        onResizeStart={startSidebarResize}
      />

      <SidebarInset className="h-screen overflow-hidden bg-[#1a1b1e] p-2 sm:p-4">
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl sm:hidden mx-auto -mb-1 pt-3 pb-2">
          CookedCalc
        </h1>

        <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
          <div className="shrink-0 px-3 sm:px-7">
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
                    className="sm:h-4 sm:w-4 h-6 w-11"
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

          <div className="flex-1 overflow-y-auto px-3 pb-44 sm:px-7 sm:pb-36 w-full">
            <div className="mx-auto max-w-full">
              <ModulesTable
                rows={computed.perRow}
                onUpdateRow={actions.updateRow}
                onRemoveRow={actions.removeRow}
              />

              <ModulesMobileList
                rows={computed.perRow}
                onUpdateRow={actions.updateRow}
                onRemoveRow={actions.removeRow}
              />

              <SummaryBar
                sumCoef={computed.sumCoef}
                semesterAvg={computed.semesterAvg}
                rows={computed.perRow}
              />
            </div>
          </div>
        </div>
        <AddModuleBar onAdd={actions.addRow} />

        {/* {needsTemplateChoice && (
          <TemplateChooser
            templates={templates}
            onChoose={actions.applyTemplate}
          />
        )} */}
      </SidebarInset>
    </SidebarProvider>
  );
}
