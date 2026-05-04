import { env } from "@/shared/lib/env";

const asBoolean = (value: string) => value === "true";

export const flags = {
  multiWorkspace: asBoolean(env.FEATURE_MULTI_WORKSPACE),
  attachments: asBoolean(env.FEATURE_ATTACHMENTS),
  listSharing: asBoolean(env.FEATURE_LIST_SHARING),
  customViews: asBoolean(env.FEATURE_CUSTOM_VIEWS),
  billing: asBoolean(env.FEATURE_BILLING),
};
