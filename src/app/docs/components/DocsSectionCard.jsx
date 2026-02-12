import FakeInput from "@/app/home/components/FakeInput";
import HistoryListRows from "@/app/calculator/components/HistoryListRows";
import TemplateCard from "@/app/home/components/TemplateCard";
import TemplateDetailsDialog from "@/components/ui/template-details-dialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

function SectionItemCard({ item }) {
  const Icon = item.icon;
  const isLink = typeof item.href === "string" && item.href.length > 0;
  const isExternalLink = isLink && /^https?:\/\//i.test(item.href);
  const cardClassName = cn(
    "group relative w-full md:flex max-xl:flex-col max-xl:items-start items-center gap-2 overflow-hidden rounded-xl p-3 bg-primary/20 text-left transition-all",
    isLink
      ? "cursor-pointer hover:border-foreground/10 hover:bg-secondary/40"
      : "cursor-default",
  );

  if (isLink) {
    return (
      <a
        href={item.href}
        target={isExternalLink ? "_blank" : undefined}
        rel={isExternalLink ? "noreferrer" : undefined}
        className={cardClassName}
      >
        <div className="flex items-center max-xl:mb-3 gap-2">
          <div className="flex size-12 items-center justify-center rounded-lg border border-border/50 bg-background shadow-sm transition-colors">
            <Icon className="size-4 text-muted-foreground transition-colors" />
          </div>
          <h4 className="font-medium leading-none tracking-tight text-foreground transition-colors xl:hidden">
            {item.title}
          </h4>
        </div>
        <div className="space-y-1">
          <h4 className="font-medium leading-none tracking-tight text-foreground transition-colors max-xl:hidden">
            {item.title}
          </h4>
          <p className="line-clamp-2 text-sm text-muted-foreground/80">
            {item.text}
          </p>
        </div>
      </a>
    );
  }

  return (
    <div className={cardClassName}>
      <div className="flex items-center max-xl:mb-3 gap-2">
        <div className="flex size-12 items-center justify-center rounded-lg border border-border/50 bg-background shadow-sm transition-colors">
          <Icon className="size-4 text-muted-foreground transition-colors" />
        </div>
        <h4 className="font-medium leading-none tracking-tight text-foreground transition-colors xl:hidden">
          {item.title}
        </h4>
      </div>
      <div className="space-y-1">
        <h4 className="font-medium leading-none tracking-tight text-foreground transition-colors max-xl:hidden">
          {item.title}
        </h4>
        <p className="line-clamp-2 text-sm text-muted-foreground/80">
          {item.text}
        </p>
      </div>
    </div>
  );
}

function Shortcut({ shortcutKey, isLast, isInText }) {
  return (
    <>
      <kbd
        className={cn(
          " inline-flex items-center gap-1 align-middle rounded-md border border-border bg-muted/60 px-3 py-1.5 font-mono text-[0.9em] leading-none text-muted-foreground/80 relative top-px ",
          isInText && "mx-2 mb-px",
        )}
      >
        {shortcutKey}
      </kbd>

      {!isLast && (
        <Plus className="inline-block size-3 align-middle mx-1 opacity-70" />
      )}
    </>
  );
}

function ShortcutRow({ shortcut }) {
  return (
    <div className="flex max-md:flex-col md:items-center gap-3 justify-between py-3 text-sm">
      <span className="text-muted-foreground/90">{shortcut.action}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {shortcut.keys.map((key, index) => (
          <Shortcut
            key={index}
            shortcutKey={key}
            isLast={index === shortcut.keys.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function toShortcutNode(shortcutKey) {
  if (typeof shortcutKey === "string") return shortcutKey;

  if (
    shortcutKey &&
    typeof shortcutKey === "object" &&
    shortcutKey.icon &&
    shortcutKey.label
  ) {
    const Icon = shortcutKey.icon;
    return (
      <span className="flex items-center gap-1">
        <Icon className="size-3.5" /> {shortcutKey.label}
      </span>
    );
  }

  return shortcutKey;
}

function InlineShortcutGroup({ shortcutKeys }) {
  return shortcutKeys.map((shortcutKey, index) => (
    <Shortcut
      key={index}
      shortcutKey={toShortcutNode(shortcutKey)}
      isLast={index === shortcutKeys.length - 1}
      isInText
    />
  ));
}

const MAX_SIDEBAR_PREVIEW_ROWS = 6;
const MIN_SIDEBAR_PREVIEW_ROWS = 1;

function orderHistoriesForPreview(histories) {
  const pinned = histories.filter((historyItem) => historyItem.pinned);
  const unpinned = histories.filter((historyItem) => !historyItem.pinned);
  return [...pinned, ...unpinned];
}

function buildCopyName(sourceName, histories) {
  const normalizedNames = new Set(
    histories.map((history) => history.name.trim().toLowerCase()),
  );

  const baseName = `${sourceName} Copy`;
  if (!normalizedNames.has(baseName.toLowerCase())) return baseName;

  let index = 2;
  while (normalizedNames.has(`${baseName} ${index}`.toLowerCase())) {
    index += 1;
  }

  return `${baseName} ${index}`;
}

function createPreviewHistoryId(sourceId) {
  const suffix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${sourceId}-copy-${suffix}`;
}

function SidebarActionsDemo({ block }) {
  const initialHistories =
    Array.isArray(block.histories) && block.histories.length > 0
      ? block.histories
      : [{ id: "preview-history-1", name: "Preview History", pinned: false }];

  const [histories, setHistories] = useState(
    orderHistoriesForPreview(initialHistories),
  );
  const [activeHistoryId, setActiveHistoryId] = useState(
    block.activeHistoryId ?? initialHistories[0]?.id ?? null,
  );
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [templateDraft, setTemplateDraft] = useState(null);

  function startEditing(historyItem) {
    setEditingHistoryId(historyItem.id);
    setEditingName(historyItem.name);
  }

  function submitEditing() {
    if (!editingHistoryId) return;
    const trimmedName = editingName.trim();
    if (trimmedName) {
      setHistories((currentHistories) =>
        currentHistories.map((historyItem) =>
          historyItem.id === editingHistoryId
            ? { ...historyItem, name: trimmedName }
            : historyItem,
        ),
      );
    }
    setEditingHistoryId(null);
    setEditingName("");
  }

  function cancelEditing() {
    setEditingHistoryId(null);
    setEditingName("");
  }

  function togglePinHistory(historyId) {
    setHistories((currentHistories) =>
      orderHistoriesForPreview(
        currentHistories.map((historyItem) =>
          historyItem.id === historyId
            ? { ...historyItem, pinned: !historyItem.pinned }
            : historyItem,
        ),
      ),
    );
  }

  function duplicateHistory(historyId) {
    setHistories((currentHistories) => {
      if (currentHistories.length >= MAX_SIDEBAR_PREVIEW_ROWS) {
        return currentHistories;
      }

      const sourceIndex = currentHistories.findIndex(
        (historyItem) => historyItem.id === historyId,
      );
      if (sourceIndex === -1) return currentHistories;

      const source = currentHistories[sourceIndex];
      const duplicate = {
        ...source,
        id: createPreviewHistoryId(source.id),
        name: buildCopyName(source.name, currentHistories),
      };

      const nextHistories = [...currentHistories];
      nextHistories.splice(sourceIndex + 1, 0, duplicate);
      return orderHistoriesForPreview(nextHistories);
    });
  }

  function deleteHistory(historyId) {
    setHistories((currentHistories) => {
      if (currentHistories.length <= MIN_SIDEBAR_PREVIEW_ROWS) {
        return currentHistories;
      }

      const nextHistories = currentHistories.filter(
        (historyItem) => historyItem.id !== historyId,
      );
      if (nextHistories.length === currentHistories.length) {
        return currentHistories;
      }

      setActiveHistoryId((currentActiveHistoryId) =>
        currentActiveHistoryId === historyId
          ? (nextHistories[0]?.id ?? null)
          : currentActiveHistoryId,
      );
      setEditingHistoryId((currentEditingHistoryId) =>
        currentEditingHistoryId === historyId ? null : currentEditingHistoryId,
      );
      setEditingName((currentEditingName) =>
        editingHistoryId === historyId ? "" : currentEditingName,
      );
      return orderHistoriesForPreview(nextHistories);
    });
  }

  function openTemplateDialog(historyItem) {
    setTemplateDraft({
      historyId: historyItem.id,
      name: historyItem.name,
      year: "Custom",
      semester: "--",
    });
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

  function closeTemplateDialog() {
    setTemplateDraft(null);
  }

  return (
    <div className={block.className}>
      <HistoryListRows
        histories={histories}
        activeHistoryId={activeHistoryId}
        editingHistoryId={editingHistoryId}
        editingName={editingName}
        onEditingNameChange={setEditingName}
        onSubmitEditing={submitEditing}
        onCancelEditing={cancelEditing}
        onStartEditing={startEditing}
        onOpenHistory={setActiveHistoryId}
        onDuplicateHistory={duplicateHistory}
        onTogglePinHistory={togglePinHistory}
        onCreateTemplateFromHistory={openTemplateDialog}
        onDeleteHistory={deleteHistory}
      />

      {templateDraft ? (
        <TemplateDetailsDialog
          title="Create Template"
          description="Preview only. This dialog does not create a template."
          submitLabel="Close"
          draft={templateDraft}
          onChange={onTemplateDraftChange}
          onCancel={closeTemplateDialog}
          onSubmit={closeTemplateDialog}
        />
      ) : null}
    </div>
  );
}

function GuideBlock({ block }) {
  if (block.type === "paragraph") {
    return (
      <p className={cn("break-words", block.className)}>
        {block.text ?? block.textBefore}
        {Array.isArray(block.shortcutKeys) && block.shortcutKeys.length > 0 ? (
          <InlineShortcutGroup shortcutKeys={block.shortcutKeys} />
        ) : null}
        {block.textAfter ?? null}
      </p>
    );
  }

  if (block.type === "preview" && block.previewType === "fake-input") {
    return (
      <div className={block.className}>
        <FakeInput opacity={1} />
      </div>
    );
  }

  if (block.type === "preview" && block.previewType === "templates-grid") {
    return (
      <div className={cn(block.className, 'max-sm:max-w-[90dvw]')}>
        {block.templates?.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    );
  }

  if (
    block.type === "preview" &&
    block.previewType === "sidebar-actions-demo"
  ) {
    return (
      <>
        <div className={cn(block.className, "max-sm:hidden")}>
          <div className="flex items-center justify-center gap-2">
            <SidebarActionsDemo block={block} />
          </div>
        </div>
        <div className="sm:hidden max-w-[90dvw]">
          <SidebarActionsDemo block={block} />
        </div>
      </>
    );
  }

  if (block.type === "preview" && block.previewType === "top-controls-demo") {
    return (
      <div className={block.className}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {block.controls?.map((control) => {
            const Icon = control.icon;
            return (
              <button
                key={control.label}
                type="button"
                className="flex h-11 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm text-muted-foreground"
              >
                <Icon className="size-4" />
                <span>{control.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}

export default function DocsSectionCard({ section }) {
  const SectionIcon = section.icon;

  return (
    <section
      id={section.id}
      className="scroll-mt-24 not-last:border-b border-border/40 pb-12 not-first:pt-8"
    >
      <div className="mb-8 flex items-center gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/30 text-muted-foreground/80">
          <SectionIcon className="size-7" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {section.title}
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
            {section.subtitle}
          </p>
        </div>
      </div>

      {Array.isArray(section.items) ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item) => (
            <SectionItemCard key={item.title} item={item} />
          ))}
        </div>
      ) : null}

      {Array.isArray(section.guides) ? (
        <div className="mt-10">
          {section.guides.map((guide) => (
            <div key={guide.title}>
              <h1 className={guide.titleClassName}>
                <li>{guide.title}</li>
              </h1>
              {guide.blocks?.map((block, index) => (
                <GuideBlock key={index} block={block} />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {Array.isArray(section.shortcuts) ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-border/40 bg-card/30">
          <div className="px-4 py-4 border-b border-border/40 bg-secondary/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keyboard Shortcuts
            </h4>
          </div>
          <div className="divide-y divide-border/40 px-4">
            {section.shortcuts.map((shortcut) => (
              <ShortcutRow key={shortcut.action} shortcut={shortcut} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
