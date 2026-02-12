import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { CalcButton, CalcInput } from "@/components/ui/calc-ui";
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

export default function ModulesTable({
  rows,
  onUpdateRow,
  onUpdateRowStats,
  onRemoveRow,
}) {
  const examRefs = useRef([]);
  const caRefs = useRef([]);
  const [editingWeight, setEditingWeight] = useState(null);

  function buildTabOrder() {
    const order = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      order.push({ rowIndex, field: "ca" });
      order.push({ rowIndex, field: "exam" });
    }
    return order;
  }

  function getInputRef(field, rowIndex) {
    return field === "ca" ? caRefs.current[rowIndex] : examRefs.current[rowIndex];
  }

  function handleTabNavigation(event, rowIndex, field) {
    if (event.key !== "Tab") return;

    const tabOrder = buildTabOrder();
    const currentOrderIndex = tabOrder.findIndex(
      (item) => item.rowIndex === rowIndex && item.field === field,
    );
    if (currentOrderIndex < 0) return;

    const step = event.shiftKey ? -1 : 1;
    let nextOrderIndex = currentOrderIndex + step;

    while (nextOrderIndex >= 0 && nextOrderIndex < tabOrder.length) {
      const targetField = tabOrder[nextOrderIndex];
      const targetInput = getInputRef(targetField.field, targetField.rowIndex);
      if (targetInput && !targetInput.disabled) {
        event.preventDefault();
        targetInput.focus();
        return;
      }
      nextOrderIndex += step;
    }
  }

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
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full min-w-140 table-fixed border-separate [border-spacing:0_10px]">
          <thead>
            <tr>
              <th className="py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Module
              </th>
              <th className="w-[12%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Coef
              </th>
              <th className="w-[12%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                TD
              </th>
              <th className="w-[12%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Exam
              </th>
              <th className="w-[8%] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Final
              </th>
              <th className="w-13 px-2 py-3"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="rounded-l-[var(--radius-xl)] pr-2">
                  <div className="flex items-center gap-2">
                    <CalcInput
                      value={row.name}
                      onChange={(event) =>
                        onUpdateRow(index, "name", event.target.value)
                      }
                      className="min-w-0 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => openWeightDialog(index)}
                      className="flex min-w-11 shrink-0 cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border border-border bg-secondary px-1.5 py-1 text-[10px] leading-none text-muted-foreground tabular-nums hover:bg-accent hover:text-foreground text-nowrap"
                      title="Edit weights"
                      aria-label="Edit weights"
                    >
                      {formatCompactWeights(row).split("/").map((part, i) => (
                        <span key={i} className="block">
                          {part}
                        </span>
                      ))}
                    </button>
                  </div>
                </td>

                <td className="px-1">
                  <CalcInput
                    type="number"
                    step="1"
                    min="0"
                    value={row.coef}
                    onChange={(event) =>
                      onUpdateRow(index, "coef", event.target.value)
                    }
                    className="min-w-0"
                  />
                </td>

                <td className="px-1">
                  <CalcInput
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={row.ca}
                    onChange={(event) =>
                      onUpdateRow(index, "ca", event.target.value)
                    }
                    disabled={row.includeCa === false}
                    ref={(el) => {
                      caRefs.current[index] = el;
                    }}
                    onKeyDown={(event) => handleTabNavigation(event, index, "ca")}
                    className={`min-w-0 ${
                      row.includeCa === false ? "opacity-40" : ""
                    }`}
                  />
                </td>

                <td className="px-1">
                  <CalcInput
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={row.exam}
                    onChange={(event) =>
                      onUpdateRow(index, "exam", event.target.value)
                    }
                    disabled={row.includeExam === false}
                    ref={(el) => {
                      examRefs.current[index] = el;
                    }}
                    onKeyDown={(event) =>
                      handleTabNavigation(event, index, "exam")
                    }
                    className={`min-w-0 ${
                      row.includeExam === false ? "opacity-40" : ""
                    }`}
                  />
                </td>

                <td className="px-1">
                  <span
                    className={`font-semibold pl-3 ${
                      row.moduleFinal !== "" && row.moduleFinal < 10
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    <EmptyValue value={row.moduleFinal} />
                  </span>
                </td>

                <td className="rounded-r-[var(--radius-xl)] pl-2">
                  <CalcButton
                    onClick={() => onRemoveRow(index)}
                    variant="soft"
                    className="ml-auto flex h-9 w-9 aspect-square items-center justify-center p-0"
                    title="Remove module"
                    aria-label="Remove module"
                  >
                    <Trash2 className="size-4" />
                  </CalcButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
