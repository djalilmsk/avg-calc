import { useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar";
import { Copy, Pin, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

function CreateTemplateDialog({
  draft,
  onChange,
  onCancel,
  onSubmit
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#3b3b3b] bg-[#1f2024] p-4">
        <h3 className="text-base font-semibold text-zinc-100">
          Create Template
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          Exam and TD grades will be cleared for the new template.
        </p>

        <div className="mt-3 space-y-2">
          <input
            value={draft.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Template name"
            className="calc-input"
          />
          <input
            value={draft.year}
            onChange={(event) => onChange("year", event.target.value)}
            placeholder="Year"
            className="calc-input"
          />
          <input
            value={draft.semester}
            onChange={(event) => onChange("semester", event.target.value)}
            placeholder="Semester"
            className="calc-input"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="calc-btn calc-btn--soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="calc-btn calc-btn--primary"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

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
  onResizeStart
}) {
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [templateDraft, setTemplateDraft] = useState(null);

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
    setTemplateDraft({
      historyId: historyItem.id,
      name: historyItem.name,
      year: "Custom",
      semester: "--"
    });
  }

  function submitTemplateDialog() {
    if (!templateDraft) return;
    const createdTemplate = onCreateTemplateFromHistory?.(templateDraft.historyId, {
      name: templateDraft.name,
      year: templateDraft.year,
      semester: templateDraft.semester
    });
    if (!createdTemplate) {
      window.alert("Template limit reached. You can store up to 4 templates.");
      return;
    }
    setTemplateDraft(null);
  }

  function onTemplateDraftChange(key, value) {
    setTemplateDraft((currentDraft) => {
      if (!currentDraft) return currentDraft;
      return {
        ...currentDraft,
        [key]: value
      };
    });
  }

  return (
    <>
      <Sidebar
        variant="sidebar"
        side="left"
        collapsible="offcanvas"
        className="border-r border-[#2b2b2b] bg-[#171717]"
      >
        <SidebarHeader className="border-b border-[#2b2b2b] bg-[#171717] p-2.5">
          <div className="mb-2 flex items-center justify-between gap-2 px-1 pt-2">
            <h2 className="text-sm font-semibold text-zinc-200">Histories</h2>
            <button
              onClick={onNewChat}
              className="flex sm:h-8 sm:w-8 h-11 w-11 items-center justify-center rounded-md border border-[#3d3d3d] bg-[#2a2a2a] text-zinc-100 hover:bg-[#323232]"
              title="Go home"
              aria-label="Go home"
            >
              <Plus className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
            </button>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-[#171717] p-2">
          <SidebarGroup className="h-full p-0">
            <SidebarGroupContent className="h-full overflow-y-auto pr-1">
              {sortedHistories.length === 0 ? (
                <div className="rounded-lg bg-[#1f1f1f] px-3 py-2 text-xs text-zinc-500">
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
                            ? "bg-[#2a2b2f] text-zinc-100"
                            : "text-zinc-300 hover:bg-[#212226]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onTogglePinHistory?.(historyItem.id)}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border cursor-pointer ${
                            historyItem.pinned
                              ? "border-[#5c5c5c] bg-[#303136] text-zinc-100"
                              : "border-[#3a3a3a] bg-[#25262b] text-zinc-500"
                          }`}
                          title={historyItem.pinned ? "Unpin" : "Pin"}
                          aria-label={historyItem.pinned ? "Unpin history" : "Pin history"}
                        >
                          <Pin className={cn("h-3.5 w-3.5", historyItem.pinned ? "-rotate-45 fill-white" : "")} />
                        </button>

                        {isEditing ? (
                          <input
                            value={editingName}
                            autoFocus
                            onChange={(event) => setEditingName(event.target.value)}
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
                            className="calc-input h-8 flex-1 text-sm"
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
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3a3a] bg-[#25262b] text-zinc-400 hover:bg-[#2d2e34] hover:text-zinc-200 cursor-pointer"
                          title="Duplicate history"
                          aria-label="Duplicate history"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openTemplateDialog(historyItem)}
                          className="h-7 rounded-md border border-[#3a3a3a] bg-[#25262b] px-2 text-[11px] text-zinc-300 hover:bg-[#2d2e34] cursor-pointer"
                          title="Create template from history"
                          aria-label="Create template from history"
                        >
                          Tpl
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteHistory?.(historyItem.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3a3a] bg-[#25262b] text-zinc-400 hover:bg-[#2d2e34] hover:text-zinc-200 cursor-pointer"
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

        <SidebarFooter className="bg-[#171717] p-2 pt-0 text-xs text-zinc-500">
          Double-click a history name to rename.
        </SidebarFooter>
        <SidebarRail
          onClick={(event) => event.preventDefault()}
          onPointerDown={onResizeStart}
          className="hidden cursor-col-resize md:flex"
        />
      </Sidebar>

      {templateDraft ? (
        <CreateTemplateDialog
          draft={templateDraft}
          onChange={onTemplateDraftChange}
          onCancel={() => setTemplateDraft(null)}
          onSubmit={submitTemplateDialog}
        />
      ) : null}
    </>
  );
}
