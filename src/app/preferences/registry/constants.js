import { FONT_PRESETS } from "./fonts";
import { BORDER_STYLES } from "./border-styles";
import { ROUNDNESS_LEVELS } from "./roundness-levels";

export const DEFAULT_APPEARANCE = {
  themeId: "mono-contrast",
  fontId: "nunito-soft",
  roundnessId: ROUNDNESS_LEVELS[2].id,
  borderStyleId: BORDER_STYLES[1].id,
};

export const APPEARANCE_STORAGE_KEY = "cookedcalc_appearance_v1";
