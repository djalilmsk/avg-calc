import { X } from "lucide-react";
import { CalcButton, SoftIconButton } from "@/components/ui/calc-ui";
import { useEffect } from "react";

function FontCard({ label, description, active, onSelect, heading, body }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-16 w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border p-3 text-left transition-colors ${
        active
          ? "border-primary bg-accent text-foreground"
          : "border-border bg-secondary/70 text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <div
        className="block min-w-0 truncate text-sm font-semibold"
        style={{ fontFamily: heading }}
      >
        {label}
      </div>
      <div
        className="mt-1 block min-w-0 truncate text-xs opacity-90"
        style={{ fontFamily: body }}
      >
        {description}
      </div>
    </button>
  );
}

function ThemeCard({ label, active, onSelect, preview }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer rounded-xl p-2 text-left transition-colors flex flex-col gap-2 ${
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/20 hover:text-foreground"
      }`}
    >
      {preview ? <ThemePreview theme={preview} /> : null}
      <div className="font-semibold ml-1 truncate">{label}</div>
    </button>
  );
}

function ThemePreview({ theme }) {
  const primary = theme?.tokens?.["--primary"] ?? "var(--primary)";
  const secondary = theme?.tokens?.["--secondary"] ?? "var(--secondary)";

  return (
    <div className="sm:h-16 h-12 w-full overflow-hidden rounded-md border border-border/80">
      <div className="grid h-full w-full grid-cols-2">
        <div style={{ backgroundColor: primary }} />
        <div style={{ backgroundColor: secondary }} />
      </div>
    </div>
  );
}

function RoundnessCard({ item, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border p-2 text-left transition-colors cursor-pointer ${
        active
          ? "border-primary bg-accent text-foreground"
          : "border-border bg-secondary/70 text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <div
        style={{ borderRadius: item.previewRadius }}
        className="mb-2 h-8 w-full border border-border/80 bg-card/70 p-1"
      >
        <div
          className="h-full w-full bg-primary/70"
          style={{ borderRadius: item.previewRadius }}
        />
      </div>
      <div className="text-sm font-semibold truncate">{item.label}</div>
      <div className="mt-0.5 text-xs opacity-90 truncate">
        {item.description}
      </div>
    </button>
  );
}

function AppearancePreferencesDialog({
  open,
  onClose,
  appearance,
  themes,
  fonts,
  roundnessLevels,
  onThemeChange,
  onFontChange,
  onRoundnessChange,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Preferences
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Pick a color theme and font preset.
            </p>
          </div>
          <SoftIconButton
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md"
            aria-label="Close preferences"
            title="Close"
          >
            <X className="h-4 w-4" />
          </SoftIconButton>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden pr-1">
          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Roundness
            </h4>
            <div className="grid gap-2 grid-cols-2 lg:grid-cols-5">
              {roundnessLevels.map((item) => (
                <RoundnessCard
                  key={item.id}
                  item={item}
                  active={appearance.roundnessId === item.id}
                  onSelect={() => onRoundnessChange(item.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Themes
            </h4>
            <div className="grid grid-cols-3 lg:grid-cols-4">
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  label={theme.label}
                  description={theme.description}
                  active={appearance.themeId === theme.id}
                  onSelect={() => onThemeChange(theme.id)}
                  preview={theme}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-foreground">
              Fonts
            </h4>
            <div className="grid min-w-0 gap-2 overflow-x-hidden grid-cols-2 md:grid-cols-3">
              {fonts.map((font) => (
                <FontCard
                  key={font.id}
                  label={font.label}
                  description={font.description}
                  active={appearance.fontId === font.id}
                  onSelect={() => onFontChange(font.id)}
                  heading={font.heading}
                  body={font.body}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 flex justify-end">
          <CalcButton variant="soft" onClick={onClose}>
            Close
          </CalcButton>
        </div>
      </div>
    </div>
  );
}

export default AppearancePreferencesDialog;
