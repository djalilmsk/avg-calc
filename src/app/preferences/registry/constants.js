import { APPEARANCE_THEMES } from "./themes";
import { FONT_PRESETS } from "./fonts";
import { ROUNDNESS_LEVELS } from "./roundness-levels";

export const DEFAULT_APPEARANCE = {
  themeId: APPEARANCE_THEMES[0].id,
  fontId: FONT_PRESETS[0].id,
  roundnessId: ROUNDNESS_LEVELS[2].id,
};

export const APPEARANCE_STORAGE_KEY = "cookedcalc_appearance_v1";
