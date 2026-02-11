import { useEffect, useMemo, useState } from "react";
import {
  APPEARANCE_STORAGE_KEY,
  APPEARANCE_THEMES,
  DEFAULT_APPEARANCE,
  FONT_PRESETS,
  ROUNDNESS_LEVELS,
} from "./appearance-registry";

function sanitizeAppearance(input) {
  const rawThemeId = String(input?.themeId ?? "").trim();
  const rawFontId = String(input?.fontId ?? "").trim();
  const rawRoundnessId = String(input?.roundnessId ?? "").trim();

  const hasTheme = APPEARANCE_THEMES.some((theme) => theme.id === rawThemeId);
  const hasFont = FONT_PRESETS.some((font) => font.id === rawFontId);
  const hasRoundness = ROUNDNESS_LEVELS.some(
    (roundness) => roundness.id === rawRoundnessId
  );

  return {
    themeId: hasTheme ? rawThemeId : DEFAULT_APPEARANCE.themeId,
    fontId: hasFont ? rawFontId : DEFAULT_APPEARANCE.fontId,
    roundnessId: hasRoundness
      ? rawRoundnessId
      : DEFAULT_APPEARANCE.roundnessId,
  };
}

function readInitialAppearance() {
  if (typeof window === "undefined") return DEFAULT_APPEARANCE;

  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    return sanitizeAppearance(JSON.parse(raw));
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

function applyAppearance(appearance, themeMap, fontMap, roundnessMap) {
  if (typeof document === "undefined") return;

  const theme = themeMap.get(appearance.themeId) ?? themeMap.get(DEFAULT_APPEARANCE.themeId);
  const font = fontMap.get(appearance.fontId) ?? fontMap.get(DEFAULT_APPEARANCE.fontId);
  const roundness =
    roundnessMap.get(appearance.roundnessId) ??
    roundnessMap.get(DEFAULT_APPEARANCE.roundnessId);
  if (!theme || !font || !roundness) return;

  const root = document.documentElement;
  for (const [token, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(token, value);
  }
  root.style.setProperty("--font-body", font.body);
  root.style.setProperty("--font-heading", font.heading);
  for (const [token, value] of Object.entries(roundness.tokens)) {
    root.style.setProperty(token, value);
  }
}

export function useAppearanceSettings() {
  const [appearance, setAppearance] = useState(readInitialAppearance);

  const themeMap = useMemo(
    () => new Map(APPEARANCE_THEMES.map((theme) => [theme.id, theme])),
    [],
  );
  const fontMap = useMemo(
    () => new Map(FONT_PRESETS.map((font) => [font.id, font])),
    [],
  );
  const roundnessMap = useMemo(
    () => new Map(ROUNDNESS_LEVELS.map((item) => [item.id, item])),
    [],
  );

  useEffect(() => {
    const nextAppearance = sanitizeAppearance(appearance);
    applyAppearance(nextAppearance, themeMap, fontMap, roundnessMap);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        APPEARANCE_STORAGE_KEY,
        JSON.stringify(nextAppearance),
      );
    }
  }, [appearance, fontMap, themeMap, roundnessMap]);

  function setThemeId(themeId) {
    setAppearance((current) => sanitizeAppearance({ ...current, themeId }));
  }

  function setFontId(fontId) {
    setAppearance((current) => sanitizeAppearance({ ...current, fontId }));
  }

  function setRoundnessId(roundnessId) {
    setAppearance((current) => sanitizeAppearance({ ...current, roundnessId }));
  }

  return {
    appearance,
    themes: APPEARANCE_THEMES,
    fonts: FONT_PRESETS,
    roundnessLevels: ROUNDNESS_LEVELS,
    setThemeId,
    setFontId,
    setRoundnessId,
  };
}
