import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

function getPageMeta(pathname) {
  if (pathname === "/") {
    return { page: "home" };
  }

  if (pathname.startsWith("/calc/")) {
    return { page: "calculator" };
  }

  if (pathname === "/docs") {
    return { page: "docs" };
  }

  return { page: "default" };
}

function PageManager() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.body.dataset.page = meta.page;
  }, [pathname]);

  useEffect(() => {
    function handleNewWorkspaceShortcut(event) {
      if (!event.ctrlKey || !event.shiftKey) return;
      if (event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() !== "o") return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      navigate("/");
    }

    window.addEventListener("keydown", handleNewWorkspaceShortcut);
    return () =>
      window.removeEventListener("keydown", handleNewWorkspaceShortcut);
  }, [navigate]);

  return null;
}

export default PageManager;
