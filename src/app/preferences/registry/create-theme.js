import { BASE_THEME_TOKENS } from "./theme-tokens";

export function createTheme(id, label, description, tokenOverrides = {}) {
  return {
    id,
    label,
    description,
    tokens: {
      ...BASE_THEME_TOKENS,
      ...tokenOverrides,
    },
  };
}
