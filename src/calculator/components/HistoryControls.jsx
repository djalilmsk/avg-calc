import { Redo2, RotateCcw, Undo2 } from "lucide-react";

export default function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-2.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-lg calc-btn--soft flex h-9 w-9 items-center justify-center cursor-pointer px-0"
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-lg calc-btn--soft flex h-9 w-9 items-center justify-center cursor-pointer px-0"
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <button
          onClick={onReset}
          className="rounded-lg calc-btn--warm flex h-9 w-9 items-center justify-center cursor-pointer px-0"
          title="Clear history and reset"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
