import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/features/auth/server/auth";
import { routes } from "@/shared/lib/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>
            This deployment only allows approved accounts configured by the project owner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await auth.api.signOut({
                headers: await headers(),
              });
              redirect(routes.signIn);
            }}
          >
            <button
              type="submit"
              className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Back to sign in
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
