import { useEffect, useMemo, useState } from "react";
import {
  APPEARANCE_STORAGE_KEY,
  APPEARANCE_THEMES,
  BORDER_STYLES,
  DEFAULT_APPEARANCE,
  FONT_PRESETS,
  ROUNDNESS_LEVELS,
} from "./appearance-registry";

function sanitizeAppearance(input) {
  const rawThemeId = String(input?.themeId ?? "").trim();
  const rawFontId = String(input?.fontId ?? "").trim();
  const rawRoundnessId = String(input?.roundnessId ?? "").trim();
  const rawBorderStyleId = String(input?.borderStyleId ?? "").trim();

  const hasTheme = APPEARANCE_THEMES.some((theme) => theme.id === rawThemeId);
  const hasFont = FONT_PRESETS.some((font) => font.id === rawFontId);
  const hasRoundness = ROUNDNESS_LEVELS.some(
    (roundness) => roundness.id === rawRoundnessId
  );
  const hasBorderStyle = BORDER_STYLES.some(
    (borderStyle) => borderStyle.id === rawBorderStyleId
  );

  return {
    themeId: hasTheme ? rawThemeId : DEFAULT_APPEARANCE.themeId,
    fontId: hasFont ? rawFontId : DEFAULT_APPEARANCE.fontId,
    roundnessId: hasRoundness
      ? rawRoundnessId
      : DEFAULT_APPEARANCE.roundnessId,
    borderStyleId: hasBorderStyle
      ? rawBorderStyleId
      : DEFAULT_APPEARANCE.borderStyleId,
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

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  const shortMatch = normalized.match(/^#([\da-f]{3})$/i);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split("");
    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
    };
  }

  const fullMatch = normalized.match(/^#([\da-f]{6})$/i);
  if (!fullMatch) return null;

  return {
    r: Number.parseInt(fullMatch[1].slice(0, 2), 16),
    g: Number.parseInt(fullMatch[1].slice(2, 4), 16),
    b: Number.parseInt(fullMatch[1].slice(4, 6), 16),
  };
}

function toHexColor({ r, g, b }) {
  return `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHexColors(base, target, weight = 0.5) {
  const baseColor = parseHexColor(base);
  const targetColor = parseHexColor(target);
  if (!baseColor || !targetColor) return base;

  const ratio = Math.max(0, Math.min(1, weight));
  return toHexColor({
    r: baseColor.r * ratio + targetColor.r * (1 - ratio),
    g: baseColor.g * ratio + targetColor.g * (1 - ratio),
    b: baseColor.b * ratio + targetColor.b * (1 - ratio),
  });
}

function getBorderOverrides(theme, borderStyleId) {
  if (borderStyleId === "none") {
    return {
      "--border": "transparent",
      "--sidebar-border": "transparent",
      "--danger-border": "transparent",
    };
  }

  if (borderStyleId === "extra-hard") {
    return {
      "--border": mixHexColors(
        theme.tokens["--border"],
        theme.tokens["--foreground"],
        0.7
      ),
      "--sidebar-border": mixHexColors(
        theme.tokens["--sidebar-border"],
        theme.tokens["--sidebar-foreground"],
        0.72
      ),
      "--danger-border": mixHexColors(
        theme.tokens["--danger-border"],
        theme.tokens["--danger-foreground"],
        0.68
      ),
    };
  }

  if (borderStyleId !== "soft") return null;

  return {
    "--border": mixHexColors(theme.tokens["--border"], theme.tokens["--card"], 0.58),
    "--sidebar-border": mixHexColors(
      theme.tokens["--sidebar-border"],
      theme.tokens["--sidebar"],
      0.56
    ),
    "--danger-border": mixHexColors(
      theme.tokens["--danger-border"],
      theme.tokens["--danger-soft"],
      0.62
    ),
  };
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
  const borderOverrides = getBorderOverrides(theme, appearance.borderStyleId);
  if (borderOverrides) {
    for (const [token, value] of Object.entries(borderOverrides)) {
      root.style.setProperty(token, value);
    }
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

  function setBorderStyleId(borderStyleId) {
    setAppearance((current) => sanitizeAppearance({ ...current, borderStyleId }));
  }

  return {
    appearance,
    themes: APPEARANCE_THEMES,
    fonts: FONT_PRESETS,
    borderStyles: BORDER_STYLES,
    roundnessLevels: ROUNDNESS_LEVELS,
    setThemeId,
    setFontId,
    setRoundnessId,
    setBorderStyleId,
  };
}
