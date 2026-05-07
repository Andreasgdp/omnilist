"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/server/auth";
import { routes } from "@/shared/lib/routes";

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect(routes.signIn);
}
