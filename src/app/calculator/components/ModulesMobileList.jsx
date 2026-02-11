import { Trash2 } from "lucide-react";
import { useState } from "react";

function EmptyValue({ value }) {
  return <>{value === "" ? "-" : value}</>;
}

function formatCompactWeights(row) {
  const includeExam = row?.includeExam !== false;
  const includeCa = row?.includeCa !== false;

  if (includeExam && includeCa) {
    const examPercent = Math.round(Number(row?.examWeight ?? 0.6) * 100);
    const tdPercent = Math.round(Number(row?.caWeight ?? 0.4) * 100);
    return `EX-${examPercent}/TD-${tdPercent}`;
  }

  if (includeExam) return "EX-1/TD-0";
  if (includeCa) return "EX-0/TD-1";
  return "EX-1/TD-0";
}

function createDraftFromRow(row) {
  const includeExam = row?.includeExam !== false;
  const includeCa = row?.includeCa !== false;
  const examWeight = Number(row?.examWeight ?? 0.6);
  const caWeight = Number(row?.caWeight ?? 0.4);

  return {
    includeExam,
    includeCa,
    examWeight: Number.isFinite(examWeight) ? examWeight : 0.6,
    caWeight: Number.isFinite(caWeight) ? caWeight : 0.4
  };
}

function clamp01(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(1, Math.max(0, numeric));
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function normalizeDraft(draft) {
  let includeExam = draft.includeExam;
  let includeCa = draft.includeCa;

  if (!includeExam && !includeCa) {
    includeExam = true;
  }

  if (!includeExam) {
    return {
      includeExam: false,
      includeCa: true,
      examWeight: 0,
      caWeight: 1
    };
  }

  if (!includeCa) {
    return {
      includeExam: true,
      includeCa: false,
      examWeight: 1,
      caWeight: 0
    };
  }

  const examWeight = clamp01(draft.examWeight, 0.6);
  const caWeight = round2(1 - examWeight);
  return {
    includeExam: true,
    includeCa: true,
    examWeight: round2(examWeight),
    caWeight
  };
}

function WeightDialog({ draft, onChange, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#3b3b3b] bg-[#1f2024] p-4">
        <h3 className="text-sm font-semibold text-zinc-100">Module Weights</h3>
        <p className="mt-1 text-xs text-zinc-400">Update Exam and TD weights.</p>

        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 rounded-lg bg-[#2a2b30] px-3 py-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={draft.includeExam}
              onChange={(event) => onChange("includeExam", event.target.checked)}
              className="size-4 accent-zinc-400"
            />
            Include Exam
          </label>

          <label className="flex items-center gap-2 rounded-lg bg-[#2a2b30] px-3 py-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={draft.includeCa}
              onChange={(event) => onChange("includeCa", event.target.checked)}
              className="size-4 accent-zinc-400"
            />
            Include TD
          </label>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              inputMode="decimal"
              aria-label="Exam weight"
              value={draft.examWeight}
              onChange={(event) => onChange("examWeight", event.target.value)}
              disabled={!draft.includeExam}
              className="calc-input"
              placeholder="Exam weight"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              inputMode="decimal"
              aria-label="TD weight"
              value={draft.caWeight}
              onChange={(event) => onChange("caWeight", event.target.value)}
              disabled={!draft.includeCa}
              className="calc-input"
              placeholder="TD weight"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="calc-btn calc-btn--soft">
            Cancel
          </button>
          <button type="button" onClick={onSave} className="calc-btn calc-btn--primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModulesMobileList({
  rows,
  onUpdateRow,
  onUpdateRowStats,
  onRemoveRow
}) {
  const [editingWeight, setEditingWeight] = useState(null);

  function openWeightDialog(index) {
    const row = rows[index];
    if (!row) return;
    setEditingWeight({
      index,
      draft: createDraftFromRow(row)
    });
  }

  function closeWeightDialog() {
    setEditingWeight(null);
  }

  function updateDraft(key, value) {
    setEditingWeight((current) => {
      if (!current) return current;

      const draft = current.draft;

      if (key === "includeExam") {
        const includeExam = Boolean(value);
        if (!includeExam) {
          return {
            ...current,
            draft: {
              ...draft,
              includeExam: false,
              includeCa: true,
              examWeight: 0,
              caWeight: 1
            }
          };
        }

        const nextExamWeight =
          draft.includeCa && Number(draft.examWeight) > 0
            ? round2(clamp01(draft.examWeight, 0.6))
            : 0.6;

        return {
          ...current,
          draft: {
            ...draft,
            includeExam: true,
            includeCa: true,
            examWeight: nextExamWeight,
            caWeight: round2(1 - nextExamWeight)
          }
        };
      }

      if (key === "includeCa") {
        const includeCa = Boolean(value);
        if (!includeCa) {
          return {
            ...current,
            draft: {
              ...draft,
              includeExam: true,
              includeCa: false,
              examWeight: 1,
              caWeight: 0
            }
          };
        }

        const nextCaWeight =
          draft.includeExam && Number(draft.caWeight) > 0
            ? round2(clamp01(draft.caWeight, 0.4))
            : 0.4;

        return {
          ...current,
          draft: {
            ...draft,
            includeExam: true,
            includeCa: true,
            caWeight: nextCaWeight,
            examWeight: round2(1 - nextCaWeight)
          }
        };
      }

      if (key === "examWeight") {
        const examWeight = round2(clamp01(value, 0.6));
        return {
          ...current,
          draft: {
            ...draft,
            includeExam: true,
            includeCa: true,
            examWeight,
            caWeight: round2(1 - examWeight)
          }
        };
      }

      if (key === "caWeight") {
        const caWeight = round2(clamp01(value, 0.4));
        return {
          ...current,
          draft: {
            ...draft,
            includeExam: true,
            includeCa: true,
            caWeight,
            examWeight: round2(1 - caWeight)
          }
        };
      }

      return {
        ...current,
        draft: {
          ...draft,
          [key]: value
        }
      };
    });
  }

  function saveWeightDialog() {
    if (!editingWeight) return;
    const normalized = normalizeDraft(editingWeight.draft);
    onUpdateRowStats?.(editingWeight.index, normalized);
    closeWeightDialog();
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-4 md:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-2xl bg-[#23252b] p-4"
          >
            <div className="flex items-center gap-2">
              <input
                value={row.name}
                onChange={(event) =>
                  onUpdateRow(index, "name", event.target.value)
                }
                className="calc-input flex-1 font-semibold"
                placeholder="Module name"
              />
              <button
                type="button"
                onClick={() => openWeightDialog(index)}
                className="shrink-0 rounded-md border border-[#3a3b40] bg-[#25262b] px-1.5 w-11 text-[10px] leading-none text-zinc-400 tabular-nums flex flex-col gap-2 py-1.5 cursor-pointer"
                title="Edit weights"
                aria-label="Edit weights"
              >
                {formatCompactWeights(row)
                  .split("/")
                  .map((part, i) => (
                    <span key={i} className="block">
                      {part}
                    </span>
                  ))}
              </button>

              <button
                onClick={() => onRemoveRow(index)}
                className="rounded-lg calc-btn--soft flex h-11 w-11 items-center justify-center cursor-pointer px-0"
                title="Remove module"
                aria-label="Remove module"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="max-sm:col-span-2">
                <label className="calc-label mb-1 block text-xs">Coef</label>
                <input
                  type="number"
                  step="1"
                  value={row.coef}
                  onChange={(event) =>
                    onUpdateRow(index, "coef", event.target.value)
                  }
                  className="calc-input"
                />
              </div>

              <div>
                <label className="calc-label mb-1 block text-xs">Exam</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={row.exam}
                  onChange={(event) =>
                    onUpdateRow(index, "exam", event.target.value)
                  }
                  disabled={row.includeExam === false}
                  className={`calc-input ${
                    row.includeExam === false ? "opacity-40" : ""
                  }`}
                />
              </div>

              <div>
                <label className="calc-label mb-1 block text-xs">TD</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={row.ca}
                  onChange={(event) =>
                    onUpdateRow(index, "ca", event.target.value)
                  }
                  disabled={row.includeCa === false}
                  className={`calc-input col-span-2 sm:col-span-1 ${
                    row.includeCa === false ? "opacity-40" : ""
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-zinc-400">Final Grade</span>
              <span
                className={`text-lg font-bold ${row.moduleFinal !== "" && row.moduleFinal < 10 ? "text-red-300" : "text-zinc-100"}`}
              >
                <EmptyValue value={row.moduleFinal} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {editingWeight ? (
        <WeightDialog
          draft={editingWeight.draft}
          onChange={updateDraft}
          onClose={closeWeightDialog}
          onSave={saveWeightDialog}
        />
      ) : null}
    </>
  );
}
