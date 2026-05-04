import { env } from "@/shared/lib/env";

export const authConfig = {
  hasGoogleAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
};
