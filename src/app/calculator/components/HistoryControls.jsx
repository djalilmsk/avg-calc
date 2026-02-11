import { Redo2, Settings, Undo2 } from "lucide-react";
import { CalcButton } from "@/components/ui/calc-ui";
import { useState } from "react";
import { useAppearanceSettings } from "@/app/preferences/useAppearanceSettings";
import AppearancePreferencesDialog from "@/app/preferences/components/AppearancePreferencesDialog";

export default function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const {
    appearance,
    themes,
    fonts,
    roundnessLevels,
    setThemeId,
    setFontId,
    setRoundnessId,
  } =
    useAppearanceSettings();

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-2.5">
          <CalcButton
            onClick={onUndo}
            disabled={!canUndo}
            variant="soft"
            className="flex h-11 w-11 items-center justify-center rounded-lg px-0 sm:h-9 sm:w-9"
            title="Undo"
            aria-label="Undo"
          >
            <Undo2 className="sm:h-4 sm:w-4 h-6 w-6" />
          </CalcButton>

          <CalcButton
            onClick={onRedo}
            disabled={!canRedo}
            variant="soft"
            className="flex h-11 w-11 items-center justify-center rounded-lg px-0 sm:h-9 sm:w-9"
            title="Redo"
            aria-label="Redo"
          >
            <Redo2 className="sm:h-4 sm:w-4 h-6 w-6" />
          </CalcButton>

          <CalcButton
            onClick={() => setIsPreferencesOpen(true)}
            variant="soft"
            className="flex h-11 w-11 items-center justify-center rounded-lg px-0 sm:h-9 sm:w-9"
            title="Open preferences"
            aria-label="Open preferences"
          >
            <Settings className="sm:h-4 sm:w-4 h-6 w-6" />
          </CalcButton>
        </div>
      </div>
      <AppearancePreferencesDialog
        open={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        appearance={appearance}
        themes={themes}
        fonts={fonts}
        roundnessLevels={roundnessLevels}
        onThemeChange={setThemeId}
        onFontChange={setFontId}
        onRoundnessChange={setRoundnessId}
      />
    </>
  );
}
