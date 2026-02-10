import { START_TEMPLATES } from "@/constants/constants";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import FakeInput from "./components/FakeInput";
import { useSidebar } from "@/components/ui/sidebar";

function Home() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const { isMobile } = useSidebar();

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {!isMobile && (
        <div className="mt-auto h-[calc(50dvh+5.2rem)] px-3 mx-auto flex w-full max-w-7xl flex-col">
          <div className="text-center pb-4">
            <h1 className="text-3xl font-bold text-slate-100 lg:text-5xl max-lg:mt-2 text-nowrap truncate">
              Welcome to CookedCalc
            </h1>
          </div>
          <FakeInput />
          <div className="grid grid-cols-1 grid-rows-1  gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full h-30">
            {START_TEMPLATES.map((template) => (
              <Link
                key={template.id}
                to={`/calc/${template.id}`}
                className="block rounded-2xl bg-[#2a2b2f] p-4 text-sm hover:bg-[#3a3b3f] w-full h-30 border border-[#4a4b4f] "
              >
                {template.name}
              </Link>
            )).slice(0, isLargeScreen ? 4 : 3)}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
