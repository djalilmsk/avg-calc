import { Copy, Pin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalcInput } from "@/components/ui/calc-ui";

export default function HistoryListRows({
  histories = [],
  activeHistoryId,
  editingHistoryId = null,
  editingName = "",
  onEditingNameChange,
  onSubmitEditing,
  onCancelEditing,
  onStartEditing,
  onOpenHistory,
  onDuplicateHistory,
  onTogglePinHistory,
  onCreateTemplateFromHistory,
  onDeleteHistory,
  disableEditing = false,
}) {
  return (
    <div className="space-y-1">
      {histories.map((historyItem) => {
        const isActive = activeHistoryId === historyItem.id;
        const isEditing =
          !disableEditing && editingHistoryId === historyItem.id;

        return (
          <div
            key={historyItem.id}
            className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <button
              type="button"
              onClick={() => onTogglePinHistory?.(historyItem.id)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border cursor-pointer ${
                historyItem.pinned
                  ? "border-border bg-accent text-foreground"
                  : "border-border bg-secondary text-muted-foreground"
              }`}
              title={historyItem.pinned ? "Unpin" : "Pin"}
              aria-label={historyItem.pinned ? "Unpin history" : "Pin history"}
            >
              <Pin
                className={cn(
                  "h-3.5 w-3.5",
                  historyItem.pinned ? "-rotate-45 fill-white" : "",
                )}
              />
            </button>

            {isEditing ? (
              <CalcInput
                value={editingName}
                autoFocus
                onChange={(event) => onEditingNameChange?.(event.target.value)}
                onBlur={onSubmitEditing}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSubmitEditing?.();
                    return;
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onCancelEditing?.();
                  }
                }}
                className="h-8 flex-1 text-sm"
              />
            ) : (
              <button
                type="button"
                onClick={() => onOpenHistory?.(historyItem.id)}
                onDoubleClick={() => onStartEditing?.(historyItem)}
                className="flex-1 truncate text-left text-sm cursor-pointer"
                title={historyItem.name}
              >
                {historyItem.name}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDuplicateHistory?.(historyItem.id)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Duplicate history"
              aria-label="Duplicate history"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onCreateTemplateFromHistory?.(historyItem)}
              className="h-7 cursor-pointer rounded-md border border-border bg-secondary px-2 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Create template from history"
              aria-label="Create template from history"
            >
              Tpl
            </button>

            <button
              type="button"
              onClick={() => onDeleteHistory?.(historyItem.id)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Delete history"
              aria-label="Delete history"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
