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
  const calculator = useSemesterCalculator();
  const { actions, history, histories, selectedHistoryId } = calculator;

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return 300;
    const saved = Number(window.localStorage.getItem("sidebar_width_px"));
    return Number.isFinite(saved) ? Math.min(360, Math.max(240, saved)) : 300;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const isResizingRef = useRef(false);
  const [isWrapped, setIsWrapped] = useState(false);
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

  const activeRouteHistoryId = route.startsWith("/calc/")
    ? route.slice("/calc/".length)
    : selectedHistoryId;

  return (
    <SidebarProvider
      defaultOpen
      className={isResizingSidebar ? "is-resizing-sidebar" : ""}
      style={{ "--sidebar-width": `${sidebarWidth}px` }}
    >
      <SnapshotsList
        onNewChat={() => navigate("/")}
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
        onCreateTemplateFromHistory={actions.createTemplateFromHistory}
        onResizeStart={handleResizeStart}
      />

      <SidebarInset className="h-screen overflow-hidden bg-[#1a1b1e] p-2 sm:p-4 relative">
        <HomeHeader history={history} actions={actions} />
        <Outlet context={calculator} />
        <AddModuleBar
          ref={addModuleBarRef}
          onAdd={route === "/" ? handleAddFromHome : actions.addRow}
          className={
            route === "/"
              ? `sm:bottom-1/2 ${isWrapped ? "sm:translate-y-2/3" : "sm:translate-y-1/2"}`
              : "translate-y-0"
          }
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
