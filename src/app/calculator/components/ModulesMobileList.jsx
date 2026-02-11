import { Trash2 } from "lucide-react";
import { useState } from "react";
import { CalcButton, CalcInput, CalcLabel } from "@/components/ui/calc-ui";
import ModuleWeightsDialog from "./ModuleWeightsDialog";
import {
  createDraftFromRow,
  formatCompactWeights,
  normalizeDraft,
  updateWeightDraft,
} from "./module-weighting";

function EmptyValue({ value }) {
  return <>{value === "" ? "-" : value}</>;
}

export default function ModulesMobileList({
  rows,
  onUpdateRow,
  onUpdateRowStats,
  onRemoveRow,
}) {
  const [editingWeight, setEditingWeight] = useState(null);

  function openWeightDialog(index) {
    const row = rows[index];
    if (!row) return;
    setEditingWeight({
      index,
      draft: createDraftFromRow(row),
    });
  }

  function closeWeightDialog() {
    setEditingWeight(null);
  }

  function updateDraft(key, value) {
    setEditingWeight((current) => {
      if (!current) return current;
      return {
        ...current,
        draft: updateWeightDraft(current.draft, key, value),
      };
    });
  }

  function saveWeightDialog() {
    if (!editingWeight) return;
    onUpdateRowStats?.(editingWeight.index, normalizeDraft(editingWeight.draft));
    closeWeightDialog();
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 md:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-[var(--radius-2xl)] bg-secondary/40 p-4"
          >
            <div className="flex items-center gap-2">
              <CalcInput
                value={row.name}
                onChange={(event) =>
                  onUpdateRow(index, "name", event.target.value)
                }
                className="flex-1 font-semibold"
                placeholder="Module name"
              />
              <button
                type="button"
                onClick={() => openWeightDialog(index)}
                className="flex min-w-11 shrink-0 cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border border-border bg-secondary px-1.5 py-1.5 text-[10px] leading-none text-muted-foreground tabular-nums hover:bg-accent hover:text-foreground text-nowrap"
                title="Edit weights"
                aria-label="Edit weights"
              >
                {formatCompactWeights(row).split("/").map((part, i) => (
                  <span key={i} className="block">
                    {part}
                  </span>
                ))}
              </button>

              <CalcButton
                onClick={() => onRemoveRow(index)}
                variant="soft"
                className="flex h-11 w-11 items-center justify-center px-0"
                title="Remove module"
                aria-label="Remove module"
              >
                <Trash2 className="h-4 w-4" />
              </CalcButton>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="max-sm:col-span-2">
                <CalcLabel className="mb-1 block text-xs">Coef</CalcLabel>
                <CalcInput
                  type="number"
                  step="1"
                  value={row.coef}
                  onChange={(event) =>
                    onUpdateRow(index, "coef", event.target.value)
                  }
                />
              </div>

              <div>
                <CalcLabel className="mb-1 block text-xs">Exam</CalcLabel>
                <CalcInput
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={row.exam}
                  onChange={(event) =>
                    onUpdateRow(index, "exam", event.target.value)
                  }
                  disabled={row.includeExam === false}
                  className={`${row.includeExam === false ? "opacity-40" : ""}`}
                />
              </div>

              <div>
                <CalcLabel className="mb-1 block text-xs">TD</CalcLabel>
                <CalcInput
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={row.ca}
                  onChange={(event) =>
                    onUpdateRow(index, "ca", event.target.value)
                  }
                  disabled={row.includeCa === false}
                  className={`col-span-2 sm:col-span-1 ${
                    row.includeCa === false ? "opacity-40" : ""
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">Final Grade</span>
              <span
                className={`text-lg font-bold ${
                  row.moduleFinal !== "" && row.moduleFinal < 10
                    ? "text-destructive"
                    : "text-foreground"
                }`}
              >
                <EmptyValue value={row.moduleFinal} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <ModuleWeightsDialog
        draft={editingWeight?.draft}
        onChange={updateDraft}
        onClose={closeWeightDialog}
        onSave={saveWeightDialog}
      />
    </>
  );
}
