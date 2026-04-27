import { detectPlatform, formatForDisplay } from "@tanstack/react-hotkeys";

export const APP_SHORTCUTS = Object.freeze({
  nextHistory: "Alt+Enter",
  previousHistory: "Alt+Shift+Enter",
  submitModule: "Enter",
  newWorkspace: "Mod+Shift+O",
  navigateGradeFields: "Tab",
  createTemplate: "Mod+Shift+H",
  duplicateHistory: "Mod+Shift+D",
  deleteHistory: "Mod+Shift+Backspace",
  toggleHistoryPinned: "Alt+Shift+P",
  undo: "Mod+ArrowLeft",
  redo: "Mod+ArrowRight",
  focusAddModule: "Control+M",
  toggleSidebar: "Control+B",
});

const DISPLAY_OPTIONS = {
  useSymbols: false,
  separatorToken: "+",
};

export function formatShortcut(hotkey, options = {}) {
  return formatForDisplay(hotkey, {
    ...DISPLAY_OPTIONS,
    ...options,
  });
}

export function getShortcutKeyLabels(hotkey, options = {}) {
  return formatShortcut(hotkey, options).split("+");
}

export function getDetectedShortcutPlatform() {
  return detectPlatform();
}
