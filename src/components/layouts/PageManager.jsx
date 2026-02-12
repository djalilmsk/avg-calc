import { useEffect } from "react";
import { useLocation } from "react-router";

function getPageMeta(pathname) {
  if (pathname === "/") {
    return { title: "CookedCalc | Home", page: "home" };
  }

  if (pathname.startsWith("/calc/")) {
    return { title: "CookedCalc | Calculator", page: "calculator" };
  }

  return { title: "CookedCalc", page: "default" };
}

function PageManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = meta.title;
    document.body.dataset.page = meta.page;
  }, [pathname]);

  return null;
}

export default PageManager;
