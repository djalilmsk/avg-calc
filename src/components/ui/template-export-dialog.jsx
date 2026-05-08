import { useEffect, useMemo, useState } from "react";
import { Copy, X, Check, Share } from "lucide-react";
import { CalcButton, CalcCheckChip, CalcInput } from "@/components/ui/calc-ui";
import { buildTemplateShareUrl } from "@/app/calculator/template-share";

function copyTextFallback(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function TemplateExportDialog({
  payload,
  allowIncludeGrades = false,
  includeGrades = false,
  onIncludeGradesChange,
  onClose,
}) {
  const [copyState, setCopyState] = useState("idle");
  const sharePayload = useMemo(() => {
    if (!payload) return null;
    return {
      ...payload,
      includeGrades: allowIncludeGrades ? includeGrades : false,
    };
  }, [allowIncludeGrades, includeGrades, payload]);
  const shareUrl = useMemo(
    () => (sharePayload ? buildTemplateShareUrl(sharePayload) : ""),
    [sharePayload],
  );

  useEffect(() => {
    setCopyState("idle");
  }, [shareUrl]);

  useEffect(() => {
    if (copyState === "copied" || copyState === "failed") {
      const timeout = setTimeout(() => setCopyState("idle"), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copyState]);

  if (!payload) return null;

  async function handleCopy() {
    if (!shareUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (!copyTextFallback(shareUrl)) {
        throw new Error("Clipboard unavailable");
      }
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  async function handleNativeShare() {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: "Cooked Calc Template",
        text: `Check out this template: ${payload.name}`,
        url: shareUrl,
      });
    } catch (err) {
      // Ignore abort errors from user cancelling the share sheet
    }
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-export-title"
        onKeyDown={handleKeyDown}
        className="w-full max-w-xl rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id="template-export-title"
              className="text-base font-semibold text-foreground"
            >
              Export Template
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {payload.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close export dialog"
            title="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {allowIncludeGrades ? (
          <CalcCheckChip className="mt-4">
            <input
              type="checkbox"
              checked={includeGrades}
              onChange={(event) => onIncludeGradesChange?.(event.target.checked)}
              className="mr-1 size-5 rounded-full accent-muted-foreground"
            />
            Include grades
          </CalcCheckChip>
        ) : null}

        <label className="mt-4 block text-xs font-semibold text-muted-foreground">
          Share URL
          <CalcInput
            readOnly
            value={shareUrl}
            onFocus={(event) => event.target.select()}
            className="mt-2 font-mono text-xs"
          />
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="min-h-5 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {copyState === "copied" ? "Copied." : null}
            {copyState === "failed" ? "Copy failed." : null}
          </p>
          <div className="flex justify-end gap-2 flex-wrap">
            <CalcButton type="button" onClick={onClose} variant="soft">
              Close
            </CalcButton>
            {typeof navigator !== "undefined" && navigator.share ? (
              <CalcButton
                type="button"
                onClick={handleNativeShare}
                variant="soft"
                className="inline-flex items-center gap-2"
              >
                <Share className="size-4" />
                Share
              </CalcButton>
            ) : null}
            <CalcButton
              type="button"
              onClick={handleCopy}
              variant="primary"
              disabled={!shareUrl}
              className="inline-flex items-center gap-2 min-w-[120px] justify-center"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="size-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy Link
                </>
              )}
            </CalcButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateExportDialog;
