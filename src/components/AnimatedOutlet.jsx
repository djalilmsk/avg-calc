import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router";

export default function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const [displayedOutlet, setDisplayedOutlet] = useState(outlet);
  const [phase, setPhase] = useState("in"); // "in" | "out"
  const prevKey = useRef(location.key);

  const [isHome, setIsHome] = useState(window.location.pathname === "/");

  useEffect(() => {
    if (location.key === prevKey.current) return;

    // Start fade-out
    const timeout = setTimeout(() => {
      setPhase("out");
      const innerTimeout = setTimeout(() => {
        prevKey.current = location.key;
        setDisplayedOutlet(outlet);
        setIsHome(window.location.pathname === "/");
        setPhase("in");
      }, 150); // match the CSS transition duration
      return () => clearTimeout(innerTimeout);
    }, 0);

    return () => clearTimeout(timeout);
  }, [location.key, outlet]);

  return (
    <div
      className={cn("transition-opacity duration-150 ease-in-out", isHome ? "md:mt-auto" : "h-full")}
      style={{ opacity: phase === "out" ? 0 : 1 }}
    >
      {displayedOutlet}
    </div>
  );
}
