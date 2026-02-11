import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ArrowRight, Pen, Trash2 } from "lucide-react";

function TemplateCard({ template, onStart, onDelete, onEdit }) {
  function handleOpenTemplate() {
    onStart?.(template.id);
  }

  function handleEditTemplate() {
    onEdit?.(template);
  }

  function handleDeleteTemplate() {
    if (!onDelete) return;

    const shouldDelete = window.confirm("Delete this template?");
    if (!shouldDelete) return;
    onDelete(template.id);
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={handleOpenTemplate}
          className="group relative flex min-h-36 w-full cursor-pointer flex-col justify-between rounded-2xl border border-border bg-secondary/65 p-4 text-foreground transition-colors duration-200 hover:bg-accent lg:p-5"
        >
          <ArrowRight className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 transition-all duration-200 group-hover:-rotate-45 group-hover:opacity-100" />
          <div className="flex flex-wrap gap-2 pr-8 text-sm text-muted-foreground">
            <span>{template.year}</span>
            <span className="text-muted-foreground/70">&middot;</span>
            <span>{template.semester}</span>
          </div>
          <h1 className="font-heading-token text-left text-xl font-semibold leading-snug line-clamp-2">
            {template.name}
          </h1>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={handleEditTemplate}>
          <Pen /> Edit
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onSelect={handleDeleteTemplate}>
          <Trash2 /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default TemplateCard;
