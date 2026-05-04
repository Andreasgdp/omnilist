import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/server/auth";
import { routes } from "@/shared/lib/routes";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export const requireSession = async () => {
  const session = await getSession();

  if (!session) {
    redirect(routes.signIn);
  }

  return session;
};
