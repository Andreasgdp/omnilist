"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { assets, workspaceMembers } from "@/db/schema";
import { createUploadRequestSchema } from "@/features/assets/lib/schema";
import { requireApprovedSession } from "@/features/auth/server/guard";
import { createUploadUrl } from "@/shared/lib/storage";

const createId = () => crypto.randomUUID();

export const createUploadRequest = async (input: z.infer<typeof createUploadRequestSchema>) => {
  const session = await requireApprovedSession();
  const parsed = createUploadRequestSchema.parse(input);

  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, parsed.workspaceId),
      eq(workspaceMembers.userId, session.user.id),
    ),
  });

  if (!membership) {
    throw new Error("Workspace access denied");
  }

  const id = createId();
  const objectKey = `${parsed.workspaceId}/${id}/${parsed.fileName}`;

  await db.insert(assets).values({
    id,
    workspaceId: parsed.workspaceId,
    uploadedBy: session.user.id,
    kind: parsed.kind,
    objectKey,
    originalName: parsed.fileName,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.sizeBytes,
  });

  const uploadUrl = await createUploadUrl({
    key: objectKey,
    contentType: parsed.mimeType,
  });

  return {
    assetId: id,
    objectKey,
    uploadUrl,
  };
};

export const markUploadComplete = async ({ assetId }: { assetId: string }) => {
  const session = await requireApprovedSession();
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, assetId),
  });

  if (!asset || asset.uploadedBy !== session.user.id) {
    throw new Error("Asset not found");
  }

  await db.update(assets).set({ status: "ready", updatedAt: new Date() }).where(eq(assets.id, assetId));

  return { ok: true };
};
