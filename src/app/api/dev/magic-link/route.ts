import { NextResponse } from "next/server";

import { getFallbackMagicLink } from "@/features/auth/server/mailer";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload = await getFallbackMagicLink();

  if (!payload) {
    return NextResponse.json({ error: "No fallback magic link has been generated yet." }, { status: 404 });
  }

  return NextResponse.json(payload);
}
