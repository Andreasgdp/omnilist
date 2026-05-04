import { NextResponse } from "next/server";

import { createUploadRequestSchema } from "@/features/assets/lib/schema";
import { createUploadRequest } from "@/features/assets/server/actions";

export async function POST(request: Request) {
  const body = await request.json();
  const input = createUploadRequestSchema.parse(body);
  const result = await createUploadRequest(input);

  return NextResponse.json(result);
}
