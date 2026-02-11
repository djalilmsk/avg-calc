/**
 * Public appearance registry surface.
 *
 * Structure:
 * - registry/themes.js: all color themes
 * - registry/fonts.js: all font presets
 * - registry/constants.js: defaults + storage key
 *
 * For pull requests:
 * - Add themes in `registry/themes.js`
 * - Add font presets in `registry/fonts.js`
 */

export {
  BASE_THEME_TOKENS,
  createTheme,
  APPEARANCE_THEMES,
  createFontPreset,
  FONT_PRESETS,
  ROUNDNESS_LEVELS,
  DEFAULT_APPEARANCE,
  APPEARANCE_STORAGE_KEY,
} from "./registry";
