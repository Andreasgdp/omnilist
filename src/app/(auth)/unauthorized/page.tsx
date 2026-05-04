import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Link className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground" href={routes.signIn}>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
