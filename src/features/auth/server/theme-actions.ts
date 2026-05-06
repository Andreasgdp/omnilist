"use server";

import { saveThemePreference, themeSchema } from "@/features/auth/server/theme";

export const setThemePreferenceAction = async (theme: unknown) => {
  const parsed = themeSchema.parse(theme);
  await saveThemePreference(parsed);
};
