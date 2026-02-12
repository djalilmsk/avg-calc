import { CalcButton, CalcInput } from "@/components/ui/calc-ui";

function TemplateDetailsDialog({
  title = "Template",
  description = "",
  submitLabel = "Save Template",
  draft,
  errorMessage = "",
  submitDisabled = false,
  onChange,
  onCancel,
  onSubmit
}) {
  if (!draft) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.();
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onCancel?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onCancel?.();
      }}
    >
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-xl border border-border bg-card p-4"
      >
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
        {errorMessage ? (
          <p className="mt-2 rounded-[var(--radius-md)] border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-3 space-y-2">
          <CalcInput
            value={draft.name}
            onChange={(event) => onChange("name", event.target.value)}
            placeholder="Template name"
          />
          <CalcInput
            value={draft.year}
            onChange={(event) => onChange("year", event.target.value)}
            placeholder="Year"
          />
          <CalcInput
            value={draft.semester}
            onChange={(event) => onChange("semester", event.target.value)}
            placeholder="Semester"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <CalcButton type="button" onClick={onCancel} variant="soft">
            Cancel
          </CalcButton>
          <CalcButton type="submit" variant="primary" disabled={submitDisabled}>
            {submitLabel}
          </CalcButton>
        </div>
      </form>
    </div>
  );
}

export default TemplateDetailsDialog;
