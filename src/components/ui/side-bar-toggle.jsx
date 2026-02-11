import { PanelLeft } from "lucide-react";
import { useSidebar } from "./sidebar";

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="flex sm:h-9 sm:w-9 h-11 w-11 items-center justify-center rounded-lg cursor-pointer bg-[#262626] text-zinc-200 hover:bg-[#2f2f2f]"
      title="Toggle sidebar"
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
    </button>
  );
}

export { SidebarToggleButton };
