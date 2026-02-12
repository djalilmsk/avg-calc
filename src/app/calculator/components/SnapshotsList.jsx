import { useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BookOpen, Copy, Edit, Pin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalcInput, SoftIconButton } from "@/components/ui/calc-ui";
import TemplateDetailsDialog from "@/components/ui/template-details-dialog";
import { MAX_TEMPLATE_STORAGE } from "@/app/calculator/constants";

export default function SnapshotsList({
  histories = [],
  activeHistoryId,
  onNewChat,
  onOpenHistory,
  onDuplicateHistory,
  onRenameHistory,
  onDeleteHistory,
  onTogglePinHistory,
  onCreateTemplateFromHistory,
  onOpenDocs,
  templateCount = 0,
  onResizeStart,
}) {
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [templateDraft, setTemplateDraft] = useState(null);
  const [templateDraftError, setTemplateDraftError] = useState("");
  const isTemplateLimitReached = templateCount >= MAX_TEMPLATE_STORAGE;

  const sortedHistories = useMemo(() => {
    const copy = [...histories];
    copy.sort((left, right) => {
      if (left.pinned !== right.pinned) {
        return left.pinned ? -1 : 1;
      }
      return right.updatedAt - left.updatedAt;
    });
    return copy;
  }, [histories]);

  function startEditing(historyItem) {
    setEditingHistoryId(historyItem.id);
    setEditingName(historyItem.name);
  }

  function submitEditing() {
    if (!editingHistoryId) return;
    const trimmedName = editingName.trim();
    if (trimmedName) {
      onRenameHistory?.(editingHistoryId, trimmedName);
    }
    setEditingHistoryId(null);
    setEditingName("");
  }

  function cancelEditing() {
    setEditingHistoryId(null);
    setEditingName("");
  }

  function openTemplateDialog(historyItem) {
    setTemplateDraftError(
      isTemplateLimitReached
        ? `Template limit reached. You can store up to ${MAX_TEMPLATE_STORAGE} templates.`
        : "",
    );
    setTemplateDraft({
      historyId: historyItem.id,
      name: historyItem.name,
      year: "Custom",
      semester: "--",
    });
  }

  function submitTemplateDialog() {
    if (!templateDraft) return;
    if (isTemplateLimitReached) {
      setTemplateDraftError(
        `Template limit reached. You can store up to ${MAX_TEMPLATE_STORAGE} templates.`,
      );
      return;
    }

    const createdTemplate = onCreateTemplateFromHistory?.(
      templateDraft.historyId,
      {
        name: templateDraft.name,
        year: templateDraft.year,
        semester: templateDraft.semester,
      },
    );
    if (!createdTemplate) {
      setTemplateDraftError("Unable to create template from this history.");
      return;
    }
    setTemplateDraftError("");
    setTemplateDraft(null);
  }

  function onTemplateDraftChange(key, value) {
    setTemplateDraft((currentDraft) => {
      if (!currentDraft) return currentDraft;
      return {
        ...currentDraft,
        [key]: value,
      };
    });
  }

  return (
    <>
      <Sidebar
        variant="sidebar"
        side="left"
        collapsible="offcanvas"
        className="border-r border-sidebar-border bg-sidebar"
      >
        <SidebarHeader className="border-b border-sidebar-border bg-sidebar p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2 px-1 pt-2">
            <h2 className="text-sm font-semibold text-sidebar-foreground">
              Histories
            </h2>
            <div className="flex items-center gap-1.5">
              {onOpenDocs ? (
                <SoftIconButton
                  onClick={onOpenDocs}
                  className="flex h-11 w-11 items-center justify-center rounded-md sm:h-8 sm:w-8 cursor-pointer"
                  title="Open docs"
                  aria-label="Open docs"
                >
                  <BookOpen className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
                </SoftIconButton>
              ) : null}
              <SoftIconButton
                onClick={onNewChat}
                className="flex h-11 w-11 items-center justify-center rounded-md sm:h-8 sm:w-8 cursor-pointer"
                title="Go home"
                aria-label="Go home"
              >
                <Edit className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
              </SoftIconButton>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-sidebar p-2">
          <SidebarGroup className="h-full p-0">
            <SidebarGroupContent className="h-full overflow-y-auto pr-1">
              {sortedHistories.length === 0 ? (
                <div className="rounded-lg bg-card/80 px-3 py-2 text-xs text-muted-foreground">
                  No histories yet.
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedHistories.map((historyItem) => {
                    const isActive = activeHistoryId === historyItem.id;
                    const isEditing = editingHistoryId === historyItem.id;

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
                          aria-label={
                            historyItem.pinned ? "Unpin history" : "Pin history"
                          }
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
                            onChange={(event) =>
                              setEditingName(event.target.value)
                            }
                            onBlur={submitEditing}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                submitEditing();
                                return;
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                cancelEditing();
                              }
                            }}
                            className="h-8 flex-1 text-sm"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenHistory?.(historyItem.id)}
                            onDoubleClick={() => startEditing(historyItem)}
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
                          onClick={() => openTemplateDialog(historyItem)}
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
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-sidebar p-2 pt-0 text-xs text-muted-foreground">
          Double-click a history name to rename.
        </SidebarFooter>
        <SidebarRail
          onClick={(event) => event.preventDefault()}
          onPointerDown={onResizeStart}
          className="hidden cursor-col-resize md:flex"
        />
      </Sidebar>

      {templateDraft ? (
        <TemplateDetailsDialog
          title="Create Template"
          description="Exam and TD grades will be cleared for the new template."
          submitLabel="Save Template"
          draft={templateDraft}
          errorMessage={templateDraftError}
          submitDisabled={isTemplateLimitReached}
          onChange={onTemplateDraftChange}
          onCancel={() => {
            setTemplateDraftError("");
            setTemplateDraft(null);
          }}
          onSubmit={submitTemplateDialog}
        />
      ) : null}
    </>
  );
}
