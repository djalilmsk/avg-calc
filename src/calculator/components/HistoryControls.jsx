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
          className="rounded-lg calc-btn--soft flex sm:h-9 sm:w-9 h-11 w-11 items-center justify-center cursor-pointer px-0"
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 className="sm:h-4 sm:w-4 h-6 w-6" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-lg calc-btn--soft flex sm:h-9 sm:w-9 h-11 w-11 items-center justify-center cursor-pointer px-0"
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 className="sm:h-4 sm:w-4 h-6 w-6" />
        </button>

        <button
          onClick={onReset}
          className="rounded-lg calc-btn--warm flex sm:h-9 sm:w-9 h-11 w-11 items-center justify-center cursor-pointer px-0"
          title="Clear history and reset"
          aria-label="Reset"
        >
          <RotateCcw className="sm:h-4 sm:w-4 h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
