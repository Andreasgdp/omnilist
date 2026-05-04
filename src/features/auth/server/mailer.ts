import { Resend } from "resend";

import { env } from "@/shared/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const sendMagicLinkEmail = async ({ email, url }: { email: string; url: string }) => {
  if (!resend || !env.RESEND_FROM_EMAIL) {
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
