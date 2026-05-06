import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { getSession } from "@/features/auth/server/session";

export const themeSchema = z.enum(["light", "dark"]);
export type ThemePreference = z.infer<typeof themeSchema>;

export const getThemePreference = async (): Promise<ThemePreference | null> => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      themePreference: true,
    },
  });

  const parsed = themeSchema.safeParse(user?.themePreference);
  return parsed.success ? parsed.data : null;
};

export const saveThemePreference = async (theme: ThemePreference) => {
  const session = await getSession();

  if (!session) {
    return;
  }

  await db
    .update(users)
    .set({
      themePreference: theme,
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id));
};
