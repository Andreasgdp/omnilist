import { Resend } from "resend";
import { promises as fs } from "node:fs";
import path from "node:path";

import { env } from "@/shared/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
const fallbackFilePath = path.join(process.cwd(), ".omnilist-last-magic-link.json");

const persistFallbackMagicLink = async ({ email, url }: { email: string; url: string }) => {
  await fs.writeFile(
    fallbackFilePath,
    JSON.stringify(
      {
        email,
        url,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
};

export const getFallbackMagicLink = async () => {
  try {
    const raw = await fs.readFile(fallbackFilePath, "utf8");
    return JSON.parse(raw) as { email: string; url: string; createdAt: string };
  } catch {
    return null;
  }
};

export const sendMagicLinkEmail = async ({ email, url }: { email: string; url: string }) => {
  if (!resend || !env.RESEND_FROM_EMAIL) {
    await persistFallbackMagicLink({ email, url });
    console.info(`Magic link for ${email}: ${url}`);
    return;
  }

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Sign in to Omnilist",
    html: `<p>Open the link below to sign in to Omnilist:</p><p><a href="${url}">${url}</a></p>`,
  });
};
