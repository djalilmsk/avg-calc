import { CalcButton, CalcInput } from "@/components/ui/calc-ui";

function ModuleWeightsDialog({ draft, onChange, onClose, onSave }) {
  if (!draft) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Module Weights</h3>
        <p className="mt-1 text-xs text-muted-foreground">Update Exam and TD weights.</p>

        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-muted px-3 py-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.includeExam}
              onChange={(event) => onChange("includeExam", event.target.checked)}
              className="size-4 accent-muted-foreground"
            />
            Include Exam
          </label>

          <label className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-muted px-3 py-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={draft.includeCa}
              onChange={(event) => onChange("includeCa", event.target.checked)}
              className="size-4 accent-muted-foreground"
            />
            Include TD
          </label>

          <div className="grid grid-cols-2 gap-2">
            <CalcInput
              type="number"
              step="0.01"
              min="0"
              max="1"
              inputMode="decimal"
              aria-label="Exam weight"
              value={draft.examWeight}
              onChange={(event) => onChange("examWeight", event.target.value)}
              disabled={!draft.includeExam}
              placeholder="Exam weight"
            />
            <CalcInput
              type="number"
              step="0.01"
              min="0"
              max="1"
              inputMode="decimal"
              aria-label="TD weight"
              value={draft.caWeight}
              onChange={(event) => onChange("caWeight", event.target.value)}
              disabled={!draft.includeCa}
              placeholder="TD weight"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <CalcButton type="button" onClick={onClose} variant="soft">
            Cancel
          </CalcButton>
          <CalcButton type="button" onClick={onSave} variant="primary">
            Save
          </CalcButton>
        </div>
      </div>
    </div>
  );
}

export default ModuleWeightsDialog;
