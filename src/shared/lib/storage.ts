import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/shared/lib/env";

const isStorageConfigured =
  Boolean(env.S3_ENDPOINT) &&
  Boolean(env.S3_BUCKET) &&
  Boolean(env.S3_ACCESS_KEY_ID) &&
  Boolean(env.S3_SECRET_ACCESS_KEY);

export const storage = isStorageConfigured
  ? new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export const createUploadUrl = async ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  if (!storage || !env.S3_BUCKET) {
    throw new Error("Object storage is not configured");
  }

  return getSignedUrl(
    storage,
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 5 },
  );
};

export const getPublicAssetUrl = (key: string) => {
  if (!env.S3_PUBLIC_BASE_URL) {
    return null;
  }

  return `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
};
