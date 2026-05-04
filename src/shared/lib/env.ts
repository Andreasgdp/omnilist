import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  ALLOWED_USERS: z.string().min(1),
  DEFAULT_SHARED_WORKSPACE_NAME: z.string().min(1).default("Home"),
  DEFAULT_SHARED_WORKSPACE_SLUG: z.string().min(1).default("home"),
  FEATURE_MULTI_WORKSPACE: z.enum(["true", "false"]).default("false"),
  FEATURE_ATTACHMENTS: z.enum(["true", "false"]).default("true"),
  FEATURE_LIST_SHARING: z.enum(["true", "false"]).default("true"),
  FEATURE_CUSTOM_VIEWS: z.enum(["true", "false"]).default("false"),
  FEATURE_BILLING: z.enum(["true", "false"]).default("false"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  S3_REGION: z.string().default("auto"),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse({
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? "development-secret-development-secret",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/omnilist",
  ALLOWED_USERS: process.env.ALLOWED_USERS ?? "example@example.com",
  DEFAULT_SHARED_WORKSPACE_NAME: process.env.DEFAULT_SHARED_WORKSPACE_NAME,
  DEFAULT_SHARED_WORKSPACE_SLUG: process.env.DEFAULT_SHARED_WORKSPACE_SLUG,
  FEATURE_MULTI_WORKSPACE: process.env.FEATURE_MULTI_WORKSPACE,
  FEATURE_ATTACHMENTS: process.env.FEATURE_ATTACHMENTS,
  FEATURE_LIST_SHARING: process.env.FEATURE_LIST_SHARING,
  FEATURE_CUSTOM_VIEWS: process.env.FEATURE_CUSTOM_VIEWS,
  FEATURE_BILLING: process.env.FEATURE_BILLING,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  S3_REGION: process.env.S3_REGION,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
});

if (!parsed.success) {
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
export const allowedUserEmails = env.ALLOWED_USERS.split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
