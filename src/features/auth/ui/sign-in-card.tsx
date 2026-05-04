"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/features/auth/auth-client";
import { authConfig } from "@/shared/lib/auth-config";

export function SignInCard() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle>Sign in to Omnilist</CardTitle>
        <CardDescription>
          Use Google or request a magic link for one of the allowed accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authConfig.hasGoogleAuth ? (
          <Button
            className="w-full"
            onClick={async () => {
              setIsPending(true);
              try {
                await authClient.signIn.social({ provider: "google", callbackURL: "/" });
              } finally {
                setIsPending(false);
              }
            }}
            disabled={isPending}
          >
            Continue with Google
          </Button>
        ) : null}

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
          variant="outline"
          className="w-full"
          disabled={isPending || !email}
          onClick={async () => {
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

            setMessage("Magic link sent. Check your inbox.");
          }}
        >
          Email me a magic link
        </Button>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
