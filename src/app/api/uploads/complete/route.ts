import { NextResponse } from "next/server";
import { z } from "zod";

import { markUploadComplete } from "@/features/assets/server/actions";

const bodySchema = z.object({
  assetId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = bodySchema.parse(await request.json());
  const result = await markUploadComplete(body);
  return NextResponse.json(result);
}
