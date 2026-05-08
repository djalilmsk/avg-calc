import { Copy, Pin, Share2, X, MoreHorizontal, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  onExportHistory,
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
            onClick={() => !isEditing && onOpenHistory?.(historyItem.id)}
            onDoubleClick={() => !isEditing && onStartEditing?.(historyItem)}
            className={`group flex items-center gap-2 rounded-lg px-2 py-2 md:px-1.5 md:py-1.5 cursor-pointer transition-colors ${
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePinHistory?.(historyItem.id); }}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`flex h-11 w-11 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-md border cursor-pointer ${
                historyItem.pinned
                  ? "border-border bg-accent text-foreground"
                  : "border-border bg-secondary text-muted-foreground"
              }`}
              title={historyItem.pinned ? "Unpin" : "Pin"}
              aria-label={historyItem.pinned ? "Unpin history" : "Pin history"}
            >
              <Pin
                className={cn(
                  "h-6 w-6 md:h-4.5 md:w-4.5",
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
                className="h-11 md:h-8 flex-1 text-base md:text-sm"
              />
            ) : (
              <span
                className="flex-1 truncate text-left text-base md:text-sm"
                title={historyItem.name}
              >
                {historyItem.name}
              </span>
            )}

            <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-11 md:h-9 md:w-9 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="More options"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-6 w-6 md:h-4.5 md:w-4.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicateHistory?.(historyItem.id); }} className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExportHistory?.(historyItem.id); }} className="cursor-pointer">
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Export</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateTemplateFromHistory?.(historyItem); }} className="cursor-pointer">
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    <span>Create template</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteHistory?.(historyItem.id); }} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
