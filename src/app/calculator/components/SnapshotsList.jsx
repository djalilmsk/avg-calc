import { useEffect, useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { BookOpen, Edit } from "lucide-react";
import { SoftIconButton } from "@/components/ui/calc-ui";
import TemplateDetailsDialog from "@/components/ui/template-details-dialog";
import { MAX_TEMPLATE_STORAGE } from "@/app/calculator/constants";
import HistoryListRows from "./HistoryListRows";

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
  openTemplateDialogHistoryId = null,
  onOpenTemplateDialogHandled,
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

  useEffect(() => {
    if (!openTemplateDialogHistoryId) return;

    const targetHistory = histories.find(
      (historyItem) => historyItem.id === openTemplateDialogHistoryId,
    );

    if (!targetHistory) {
      onOpenTemplateDialogHandled?.();
      return;
    }

    queueMicrotask(() => {
      setTemplateDraftError(
        isTemplateLimitReached
          ? `Template limit reached. You can store up to ${MAX_TEMPLATE_STORAGE} templates.`
          : "",
      );
      setTemplateDraft({
        historyId: targetHistory.id,
        name: targetHistory.name,
        year: "Custom",
        semester: "--",
      });
      onOpenTemplateDialogHandled?.();
    });
  }, [
    histories,
    isTemplateLimitReached,
    onOpenTemplateDialogHandled,
    openTemplateDialogHistoryId,
  ]);

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
                <div className="rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  No histories yet.
                </div>
              ) : (
                <HistoryListRows
                  histories={sortedHistories}
                  activeHistoryId={activeHistoryId}
                  editingHistoryId={editingHistoryId}
                  editingName={editingName}
                  onEditingNameChange={setEditingName}
                  onSubmitEditing={submitEditing}
                  onCancelEditing={cancelEditing}
                  onStartEditing={startEditing}
                  onOpenHistory={onOpenHistory}
                  onDuplicateHistory={onDuplicateHistory}
                  onTogglePinHistory={onTogglePinHistory}
                  onCreateTemplateFromHistory={openTemplateDialog}
                  onDeleteHistory={onDeleteHistory}
                />
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
