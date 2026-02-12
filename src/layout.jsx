import SnapshotsList from "@/app/calculator/components/SnapshotsList";
import { useSemesterCalculator } from "@/app/calculator/hooks/useSemesterCalculator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useCallback, useEffect, useRef, useState } from "react";
import { startSidebarResize } from "./lib/side-bar-resize";
import { Outlet, useLocation, useNavigate } from "react-router";
import HomeHeader from "./components/layouts/HomeHeader";
import AddModuleBar from "./components/layouts/AddModuleBar";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.pathname;
  const isHomeRoute = route === "/";
  const isCalculatorRoute = route.startsWith("/calc/");
  const shouldShowAddModuleBar = isHomeRoute || isCalculatorRoute;
  const calculator = useSemesterCalculator();
  const { actions, history, histories, selectedHistoryId, templates } =
    calculator;
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

  useEffect(() => {
    function handleHistoryShortcut(event) {
      if (
        shouldShowAddModuleBar &&
        event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "m"
      ) {
        event.preventDefault();

        const focusAddModuleInput = () => {
          const moduleInput = document.querySelector(
            '[data-add-module-input="true"]',
          );
          if (!(moduleInput instanceof HTMLInputElement)) return false;
          moduleInput.focus();
          moduleInput.select();
          return true;
        };

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
        return;
      }

      if (isCalculatorRoute && activeRouteHistoryId) {
        if (
          event.ctrlKey &&
          event.shiftKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          const lowerKey = event.key.toLowerCase();

          if (lowerKey === "h") {
            event.preventDefault();
            setTemplateDialogHistoryId(activeRouteHistoryId);
            return;
          }

          if (lowerKey === "d") {
            event.preventDefault();
            const duplicated = actions.duplicateHistory(activeRouteHistoryId);
            if (duplicated) {
              navigate(`/calc/${duplicated.id}`);
            }
            return;
          }

          if (event.key === "Backspace") {
            event.preventDefault();
            actions.deleteHistory(activeRouteHistoryId);
            navigate("/");
            return;
          }
        }

        if (
          event.altKey &&
          event.shiftKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          event.key.toLowerCase() === "p"
        ) {
          event.preventDefault();
          actions.toggleHistoryPinned(activeRouteHistoryId);
          return;
        }

        if (
          event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          !event.metaKey &&
          event.key === "ArrowLeft"
        ) {
          event.preventDefault();
          actions.undo();
          return;
        }

        if (
          event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          !event.metaKey &&
          event.key === "ArrowRight"
        ) {
          event.preventDefault();
          actions.redo();
          return;
        }
      }

      if (event.key !== "Enter" || !event.altKey) return;
      if (event.ctrlKey || event.metaKey) return;

      const totalHistories = histories.length;
      if (totalHistories === 0) return;

      const direction = event.shiftKey ? -1 : 1;
      const currentIndex = histories.findIndex(
        (historyItem) => historyItem.id === activeRouteHistoryId,
      );

      const fallbackIndex = direction > 0 ? 0 : totalHistories - 1;
      const baseIndex = currentIndex >= 0 ? currentIndex : fallbackIndex;
      const nextIndex =
        (baseIndex + direction + totalHistories) % totalHistories;
      const nextHistoryId = histories[nextIndex]?.id;
      if (!nextHistoryId) return;

      event.preventDefault();
      navigate(`/calc/${nextHistoryId}`);
    }

    window.addEventListener("keydown", handleHistoryShortcut);
    return () => window.removeEventListener("keydown", handleHistoryShortcut);
  }, [
    actions,
    activeRouteHistoryId,
    histories,
    isCalculatorRoute,
    navigate,
    shouldShowAddModuleBar,
  ]);

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
        <HomeHeader history={history} actions={actions} />
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
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
