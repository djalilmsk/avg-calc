import { APP_SHORTCUTS } from "@/lib/shortcuts";
import { useHotkey } from "@tanstack/react-hotkeys";
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

  useHotkey(
    APP_SHORTCUTS.newWorkspace,
    () => {
      navigate("/");
    },
    {
      ignoreInputs: true,
      meta: {
        name: "Open new workspace",
      },
    },
  );

  return null;
}

export default PageManager;
