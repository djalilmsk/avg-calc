import SnapshotsList from "@/app/calculator/components/SnapshotsList";
import { useSemesterCalculator } from "@/app/calculator/hooks/useSemesterCalculator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { APP_SHORTCUTS } from "@/lib/shortcuts";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { startSidebarResize } from "./lib/side-bar-resize";
import { Outlet, useLocation, useNavigate } from "react-router";
import HomeHeader from "./components/layouts/HomeHeader";
import AddModuleBar from "./components/layouts/AddModuleBar";
import TemplateExportDialog from "@/components/ui/template-export-dialog";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.pathname;
  const isHomeRoute = route === "/";
  const isCalculatorRoute = route.startsWith("/calc/");
  const shouldShowAddModuleBar = isHomeRoute || isCalculatorRoute;
  const calculator = useSemesterCalculator();
  const {
    actions,
    getHistoryById,
    history,
    histories,
    rows,
    selectedHistoryId,
    templates,
  } = calculator;
  const { discardSelectedTemplateHistoryIfEmpty } = actions;

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return 300;
    const saved = Number(window.localStorage.getItem("sidebar_width_px"));
    return Number.isFinite(saved) ? Math.min(360, Math.max(240, saved)) : 300;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const isResizingRef = useRef(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [templateDialogHistoryId, setTemplateDialogHistoryId] = useState(null);
  const [exportHistoryId, setExportHistoryId] = useState(null);
  const [exportIncludeGrades, setExportIncludeGrades] = useState(false);
  const resizeObserverRef = useRef(null);

  const addModuleBarRef = useCallback((node) => {
    // Disconnect previous observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (!node) return;

    const checkWrapped = () => {
      setIsWrapped(node.scrollHeight > 80);
    };

    const ro = new ResizeObserver(checkWrapped);
    ro.observe(node);
    resizeObserverRef.current = ro;

    // Run once immediately
    checkWrapped();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sidebar_width_px", String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isHomeRoute) return;
    discardSelectedTemplateHistoryIfEmpty?.();
  }, [discardSelectedTemplateHistoryIfEmpty, isHomeRoute]);

  const handleResizeStart = (event) =>
    startSidebarResize(
      event,
      setSidebarWidth,
      setIsResizingSidebar,
      isResizingRef,
    );

  const handleAddFromHome = (payload) => {
    const historyItem = actions.createHistoryFromModule(payload);
    if (!historyItem) return;
    navigate(`/calc/${historyItem.id}`);
  };

  const activeRouteHistoryId = isCalculatorRoute
    ? route.slice("/calc/".length)
    : isHomeRoute
      ? selectedHistoryId
      : null;

  const exportHistoryPayload = useMemo(() => {
    if (!exportHistoryId) return null;

    const historyItem = getHistoryById(exportHistoryId);
    if (!historyItem) return null;

    return {
      name: historyItem.name,
      year: "Custom",
      semester: "--",
      rows: exportHistoryId === selectedHistoryId ? rows : historyItem.rows,
    };
  }, [exportHistoryId, getHistoryById, rows, selectedHistoryId]);

  const focusAddModuleInput = useCallback(() => {
    const moduleInput = document.querySelector('[data-add-module-input="true"]');
    if (!(moduleInput instanceof HTMLInputElement)) return false;
    moduleInput.focus();
    moduleInput.select();
    return true;
  }, []);

  const handleFocusAddModuleInput = useCallback(() => {
    if (focusAddModuleInput()) return;

    const openComposerButton = document.querySelector(
      '[data-add-module-open="true"]',
    );
    if (openComposerButton instanceof HTMLButtonElement) {
      openComposerButton.click();
      window.setTimeout(() => {
        focusAddModuleInput();
      }, 0);
    }
  }, [focusAddModuleInput]);

  const navigateHistoryByStep = useCallback(
    (direction) => {
      const totalHistories = histories.length;
      if (totalHistories === 0) return;

      const currentIndex = histories.findIndex(
        (historyItem) => historyItem.id === activeRouteHistoryId,
      );

      const fallbackIndex = direction > 0 ? 0 : totalHistories - 1;
      const baseIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;
      const nextIndex =
        (baseIndex + direction + totalHistories) % totalHistories;
      const nextHistoryId = histories[nextIndex]?.id;
      if (!nextHistoryId) return;

      navigate(`/calc/${nextHistoryId}`);
    },
    [activeRouteHistoryId, histories, navigate],
  );

  const calculatorHotkeys = useMemo(() => {
    const hasActiveCalculatorHistory = Boolean(
      isCalculatorRoute && activeRouteHistoryId,
    );

    return [
      {
        hotkey: APP_SHORTCUTS.focusAddModule,
        callback: handleFocusAddModuleInput,
        options: {
          enabled: shouldShowAddModuleBar,
          ignoreInputs: false,
          meta: {
            name: "Focus Add Module input",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.nextHistory,
        callback: () => navigateHistoryByStep(1),
        options: {
          enabled: histories.length > 0,
          ignoreInputs: false,
          meta: {
            name: "Next history",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.previousHistory,
        callback: () => navigateHistoryByStep(-1),
        options: {
          enabled: histories.length > 0,
          ignoreInputs: false,
          meta: {
            name: "Previous history",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.createTemplate,
        callback: () => setTemplateDialogHistoryId(activeRouteHistoryId),
        options: {
          enabled: hasActiveCalculatorHistory,
          ignoreInputs: false,
          meta: {
            name: "Open create-template dialog for current history",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.duplicateHistory,
        callback: () => {
          const duplicated = actions.duplicateHistory(activeRouteHistoryId);
          if (duplicated) {
            navigate(`/calc/${duplicated.id}`);
          }
        },
        options: {
          enabled: hasActiveCalculatorHistory,
          ignoreInputs: false,
          meta: {
            name: "Duplicate current history",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.deleteHistory,
        callback: () => {
          actions.deleteHistory(activeRouteHistoryId);
          navigate("/");
        },
        options: {
          enabled: hasActiveCalculatorHistory,
          ignoreInputs: false,
          meta: {
            name: "Delete current history",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.toggleHistoryPinned,
        callback: () => actions.toggleHistoryPinned(activeRouteHistoryId),
        options: {
          enabled: hasActiveCalculatorHistory,
          ignoreInputs: false,
          meta: {
            name: "Pin/unpin current history",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.undo,
        callback: actions.undo,
        options: {
          enabled: hasActiveCalculatorHistory,
          ignoreInputs: false,
          meta: {
            name: "Undo",
          },
        },
      },
      {
        hotkey: APP_SHORTCUTS.redo,
        callback: actions.redo,
        options: {
          enabled: hasActiveCalculatorHistory,
          ignoreInputs: false,
          meta: {
            name: "Redo",
          },
        },
      },
    ];
  }, [
    actions,
    activeRouteHistoryId,
    handleFocusAddModuleInput,
    histories,
    isCalculatorRoute,
    navigate,
    navigateHistoryByStep,
    shouldShowAddModuleBar,
  ]);

  useHotkeys(calculatorHotkeys, { conflictBehavior: "allow" });

  return (
    <SidebarProvider
      defaultOpen
      className={isResizingSidebar ? "is-resizing-sidebar" : ""}
      style={{ "--sidebar-width": `${sidebarWidth}px` }}
    >
      <SnapshotsList
        onNewChat={() => {
          discardSelectedTemplateHistoryIfEmpty?.();
          navigate("/");
        }}
        onOpenDocs={() => navigate("/docs")}
        histories={histories}
        activeHistoryId={activeRouteHistoryId}
        onOpenHistory={(historyId) => navigate(`/calc/${historyId}`)}
        onDuplicateHistory={(historyId) => {
          const duplicated = actions.duplicateHistory(historyId);
          if (duplicated) {
            navigate(`/calc/${duplicated.id}`);
          }
        }}
        onExportHistory={(historyId) => {
          setExportHistoryId(historyId);
          setExportIncludeGrades(false);
        }}
        onRenameHistory={actions.renameHistory}
        onDeleteHistory={(historyId) => {
          actions.deleteHistory(historyId);
          if (activeRouteHistoryId === historyId) {
            navigate("/");
          }
        }}
        onTogglePinHistory={actions.toggleHistoryPinned}
        onCreateTemplateFromHistory={(historyId, templateDetails) => {
          const createdTemplate = actions.createTemplateFromHistory(
            historyId,
            templateDetails,
          );
          if (createdTemplate) {
            navigate("/");
          }
          return createdTemplate;
        }}
        openTemplateDialogHistoryId={templateDialogHistoryId}
        onOpenTemplateDialogHandled={() => setTemplateDialogHistoryId(null)}
        templateCount={templates.length}
        onResizeStart={handleResizeStart}
      />

      <SidebarInset
        className={`relative h-screen overflow-hidden bg-background p-2 sm:p-4
          `}
      >
        <HomeHeader 
          history={history} 
          actions={actions} 
          onExport={
            activeRouteHistoryId
              ? () => {
                  setExportHistoryId(activeRouteHistoryId);
                  setExportIncludeGrades(false);
                }
              : undefined
          }
        />
        <Outlet context={calculator} />
        {shouldShowAddModuleBar ? (
          <AddModuleBar
            ref={addModuleBarRef}
            onAdd={isHomeRoute ? handleAddFromHome : actions.addRow}
            className={
              isHomeRoute
                ? `sm:bottom-1/2 ${isWrapped ? "sm:translate-y-2/3" : "sm:translate-y-1/2"}`
                : "translate-y-0"
            }
          />
        ) : null}
        <TemplateExportDialog
          payload={exportHistoryPayload}
          allowIncludeGrades
          includeGrades={exportIncludeGrades}
          onIncludeGradesChange={setExportIncludeGrades}
          onClose={() => setExportHistoryId(null)}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
