import { SNAPSHOT_VISIBLE_LIMIT } from "../constants";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Check, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function SnapshotsList({
  snapshots,
  onSave,
  onRestore,
  onDelete,
  onRename,
  onResizeStart
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");

  function startRename(snapshot) {
    setEditingId(snapshot.id);
    setDraftName(snapshot.label);
  }

  function cancelRename() {
    setEditingId(null);
    setDraftName("");
  }

  function submitRename(id) {
    const next = draftName.trim();
    if (!next) return;
    onRename(id, next);
    cancelRename();
  }

  return (
    <Sidebar
      variant="sidebar"
      side="left"
      collapsible="offcanvas"
      className="border-r border-[#2b2b2b] bg-[#171717]"
    >
      <SidebarHeader className="border-b border-[#2b2b2b] bg-[#171717] p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2 px-1 pt-2">
          <h2 className="text-sm font-semibold text-zinc-200">Saved History</h2>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-[#262626] px-3 py-2 text-xs text-zinc-300 sm:h-8 sm:w-8 h-11 w-11 flex justify-center items-center max-sm:text-xl">{snapshots.length}</span>
            <button
              onClick={onSave}
              className="flex sm:h-8 sm:w-8 h-11 w-11 items-center justify-center rounded-md border border-[#3d3d3d] bg-[#2a2a2a] text-zinc-100 hover:bg-[#323232]"
              title="New snapshot"
              aria-label="New snapshot"
            >
              <Plus className="sm:h-4 sm:w-4 h-5.5 w-5.5" />
            </button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#171717] p-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <p className="mb-2 px-2 text-xs text-zinc-500">Local history</p>
            <div className="space-y-1.5 pr-1">
              {snapshots.length === 0 && (
                <div className="rounded-lg bg-[#1f1f1f] px-3 py-2 text-xs text-zinc-500">
                  No snapshots yet.
                </div>
              )}

              {snapshots.slice(0, SNAPSHOT_VISIBLE_LIMIT).map((snapshot) => (
                <div key={snapshot.id} className="rounded-lg bg-[#202020] p-2">
                  <div className="flex items-center gap-1.5">
                    {editingId === snapshot.id ? (
                      <input
                        autoFocus
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") submitRename(snapshot.id);
                          if (event.key === "Escape") cancelRename();
                        }}
                        className="h-7 min-w-0 flex-1 rounded-md bg-[#2b2b2b] px-2 text-sm text-zinc-100 outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => onRestore(snapshot.id)}
                        className="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm text-zinc-200 hover:bg-[#2b2b2b]"
                        title={snapshot.label}
                      >
                        {snapshot.label}
                      </button>
                    )}

                    {editingId === snapshot.id ? (
                      <>
                        <button
                          onClick={() => submitRename(snapshot.id)}
                          className="flex h-9 w-9 sm:h-7 sm:w-7  items-center justify-center rounded-md bg-[#2a2a2a] text-zinc-300 hover:bg-[#343434]"
                          title="Save name"
                          aria-label="Save name"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="flex h-9 w-9 sm:h-7 sm:w-7  items-center justify-center rounded-md bg-[#2a1f1f] text-red-300 hover:bg-[#352626]"
                          title="Cancel rename"
                          aria-label="Cancel rename"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onRestore(snapshot.id)}
                          className="flex h-9 w-9 sm:h-7 sm:w-7  items-center justify-center rounded-md bg-[#2a2a2a] text-zinc-300 hover:bg-[#343434]"
                          title="Restore snapshot"
                          aria-label="Restore snapshot"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => startRename(snapshot)}
                          className="flex h-9 w-9 sm:h-7 sm:w-7  items-center justify-center rounded-md bg-[#2a2a2a] text-zinc-300 hover:bg-[#343434]"
                          title="Rename snapshot"
                          aria-label="Rename snapshot"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(snapshot.id)}
                          className="flex h-9 w-9 sm:h-7 sm:w-7  items-center justify-center rounded-md bg-[#2a1f1f] text-red-300 hover:bg-[#352626]"
                          title="Delete snapshot"
                          aria-label="Delete snapshot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {snapshots.length > SNAPSHOT_VISIBLE_LIMIT && (
                <div className="px-1 text-xs text-zinc-500">
                  Showing latest {SNAPSHOT_VISIBLE_LIMIT} snapshots. Older ones are still saved.
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#171717] p-2 pt-0 text-xs text-zinc-500">
        Saved locally
      </SidebarFooter>
      <SidebarRail
        onClick={(event) => event.preventDefault()}
        onPointerDown={onResizeStart}
        className="hidden cursor-col-resize md:flex"
      />
    </Sidebar>
  );
}
