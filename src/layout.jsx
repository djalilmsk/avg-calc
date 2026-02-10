import SnapshotsList from "@/app/calculator/components/SnapshotsList";
import { useSemesterCalculator } from "@/app/calculator/hooks/useSemesterCalculator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useCallback, useEffect, useRef, useState } from "react";
import { startSidebarResize } from "./lib/side-bar-resize";
import { useLocation } from "react-router";
import HomeHeader from "./components/layouts/HomeHeader";
import AddModuleBar from "./components/layouts/AddModuleBar";
import AnimatedOutlet from "./components/AnimatedOutlet";

function Layout() {
  const route = useLocation().pathname;
  const { snapshots, actions } = useSemesterCalculator();

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
        onResizeStart={handleResizeStart}
      />

      <SidebarInset className="h-screen overflow-hidden bg-[#1a1b1e] p-2 sm:p-4 relative">
        <HomeHeader />
        <AnimatedOutlet />
        <AddModuleBar
          ref={addModuleBarRef}
          onAdd={actions.addRow}
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
