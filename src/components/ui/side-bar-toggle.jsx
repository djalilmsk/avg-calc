import { PanelLeft } from "lucide-react";
import { useSidebar } from "./sidebar";
import { SoftIconButton } from "./calc-ui";

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <SoftIconButton
      onClick={toggleSidebar}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg sm:h-9 sm:w-9"
      title="Toggle sidebar"
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
    </SoftIconButton>
  );
}

export { SidebarToggleButton };
