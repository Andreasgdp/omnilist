import { betterAuth } from "better-auth/minimal";
import { dash } from "@better-auth/infra";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { sendMagicLinkEmail } from "@/features/auth/server/mailer";
import { authConfig } from "@/shared/lib/auth-config";
import { env } from "@/shared/lib/env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: authConfig.hasGoogleAuth
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  plugins: [
    dash({
      apiKey: env.BETTER_AUTH_API_KEY,
    }),
    magicLink({
      disableSignUp: false,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail({ email, url });
      },
    }),
    nextCookies(),
  ],
});
