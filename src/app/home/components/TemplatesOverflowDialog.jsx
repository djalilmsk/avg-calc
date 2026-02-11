import { useEffect } from "react";
import { CalcButton } from "@/components/ui/calc-ui";
import TemplatesGrid from "./TemplatesGrid";

function TemplatesOverflowDialog({
  open,
  templates,
  onClose,
  onStart,
  onDelete,
  onEdit,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose?.();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              All Templates
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {templates.length} saved templates
            </p>
          </div>
          <CalcButton variant="soft" onClick={onClose}>
            Close
          </CalcButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <TemplatesGrid
            templates={templates}
            onStart={onStart}
            onDelete={onDelete}
            onEdit={onEdit}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          />
        </div>
      </div>
    </div>
  );
}

export default TemplatesOverflowDialog;
