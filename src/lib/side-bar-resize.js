function startSidebarResize(
  event,
  setSidebarWidth,
  setIsResizingSidebar,
  isResizingRef,
) {
  if (typeof window !== "undefined" && window.innerWidth < 768) return;

  event.preventDefault();
  isResizingRef.current = true;
  setIsResizingSidebar(true);
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";

  const onPointerMove = (moveEvent) => {
    if (!isResizingRef.current) return;
    const next = Math.min(360, Math.max(240, moveEvent.clientX));
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

export { startSidebarResize };
