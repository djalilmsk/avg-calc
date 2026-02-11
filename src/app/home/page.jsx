import { useEffect, useState } from "react";
import FakeInput from "./components/FakeInput";
import { useSidebar } from "@/components/ui/sidebar";
import TemplateCard from "./components/TemplateCard";
import { useNavigate, useOutletContext } from "react-router";

function Home() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { templates = [], actions } = useOutletContext();

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleStartFromTemplate(templateId) {
    const historyItem = actions.createHistoryFromTemplate(templateId);
    if (!historyItem) return;
    navigate(`/calc/${historyItem.id}`);
  }

  function handleDeleteTemplate(templateId) {
    actions.deleteTemplate(templateId);
  }

  return (
    <>
      {!isMobile ? (
        <div className="mt-auto h-[calc(50dvh+5.2rem)] px-3 mx-auto flex w-full max-w-7xl flex-col">
          <div className="text-center pb-4">
            <h1 className="text-3xl font-bold text-slate-100 lg:text-5xl max-lg:mt-2 text-nowrap truncate">
              Welcome to CookedCalc
            </h1>
          </div>
          <FakeInput />
          <div className="grid grid-cols-1 grid-rows-1  gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full h-30">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onStart={handleStartFromTemplate}
                onDelete={handleDeleteTemplate}
              />
            )).slice(0, isLargeScreen ? 4 : 3)}
          </div>
        </div>
      ) : (
        <div className="px-3 mx-auto flex w-full max-w-7xl flex-col h-[50dvh] items-center justify-center gap-6">
          <div className="text-center pb-4">
            <h1 className="text-4xl font-bold text-slate-100 lg:text-5xl max-lg:mt-2">
              Welcome <br className="sm:hidden" /> to CookedCalc
            </h1>
          </div>
          <div className="grid gap-3 grid-cols-2 w-full h-30">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onStart={handleStartFromTemplate}
                onDelete={handleDeleteTemplate}
              />
            )).slice(0, 4)}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
