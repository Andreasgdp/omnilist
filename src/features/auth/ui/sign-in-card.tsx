"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/features/auth/auth-client";

export function SignInCard({
  hasGoogleAuth,
  hasMagicLinkEmail,
}: {
  hasGoogleAuth: boolean;
  hasMagicLinkEmail: boolean;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const canSendMagicLink = !isPending && email.trim().length > 0;

  const requestMagicLink = async () => {
    if (!canSendMagicLink) {
      return;
    }

    setIsPending(true);
    setMessage(null);

    const result = await authClient.signIn.magicLink({
      email,
      callbackURL: "/",
    });

    setIsPending(false);
    if (result.error) {
      setMessage(result.error.message ?? "Unable to send magic link");
      return;
    }

    setMessage("If this email can sign in, a magic link has been sent.");
  };

  return (
    <Card className="w-full max-w-md border border-border/50 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur">
      <CardHeader>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
            <Image src="/omnilist-logo.png" alt="Omnilist logo" width={42} height={42} className="size-10" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary/80">Omnilist</p>
            <p className="text-sm text-muted-foreground">Your shared lists, simplified.</p>
          </div>
        </div>
        <CardTitle>Sign in to Omnilist</CardTitle>
        <CardDescription>
          Use Google or request a magic link for one of the allowed accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasGoogleAuth ? (
          <Button
            className="w-full disabled:pointer-events-none disabled:opacity-50"
            aria-disabled={isPending}
            onClick={async () => {
              if (isPending) {
                return;
              }

              setIsPending(true);
              try {
                await authClient.signIn.social({ provider: "google", callbackURL: "/" });
              } finally {
                setIsPending(false);
              }
            }}
          >
            Continue with Google
          </Button>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await requestMagicLink();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Magic link email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full aria-disabled:pointer-events-none aria-disabled:opacity-50"
            aria-disabled={!canSendMagicLink}
          >
            Email me a magic link
          </Button>
        </form>

        {!hasMagicLinkEmail ? (
          <p className="text-sm text-muted-foreground">
            Email delivery is not configured in this environment. After requesting a magic link locally, open
            {" "}
            <code>/api/dev/magic-link</code>
            {" "}
            to copy the latest generated link.
          </p>
        ) : null}

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
