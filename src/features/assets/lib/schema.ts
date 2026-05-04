import { z } from "zod";

export const createUploadRequestSchema = z.object({
  workspaceId: z.string().uuid(),
  kind: z.enum(["image", "file"]),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.coerce.number().int().positive(),
});
